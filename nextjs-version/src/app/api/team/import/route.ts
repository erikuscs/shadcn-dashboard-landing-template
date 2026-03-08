import { NextResponse } from "next/server";
import { createTeamMember, readTeamMembers, writeTeamMembers } from "@/lib/mission-store";

export const runtime = "nodejs";

type ImportMode = "append" | "replace";

type TeamRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  manager: string;
  workload: number;
  requiredTools: string[];
  grantedTools: string[];
};

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(csv: string) {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [] as TeamRow[];
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (name: string) => headers.indexOf(name);

  const out: TeamRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    const name = cols[idx("name")]?.trim();
    const email = cols[idx("email")]?.trim().toLowerCase();
    const role = cols[idx("role")]?.trim();

    if (!name || !role || !email || !email.endsWith("@sustainablegaps.com")) {
      continue;
    }

    const workloadRaw = cols[idx("workload")];
    const workloadNum = Number.parseInt(workloadRaw || "60", 10);
    const workload = Number.isFinite(workloadNum) ? Math.min(100, Math.max(0, workloadNum)) : 60;

    const requiredRaw = cols[idx("requiredtools")] || "OpenClaw Mission Control";
    const grantedRaw = cols[idx("grantedtools")] || "OpenClaw Mission Control";

    out.push({
      id: cols[idx("id")]?.trim() || `tm-csv-${Date.now()}-${i}`,
      email,
      name,
      role,
      department: cols[idx("department")]?.trim() || "Operations",
      manager: cols[idx("manager")]?.trim() || "Unassigned",
      workload,
      requiredTools: requiredRaw.split("|").map((v) => v.trim()).filter(Boolean),
      grantedTools: grantedRaw.split("|").map((v) => v.trim()).filter(Boolean),
    });
  }

  return out;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { csv?: string; mode?: ImportMode };

  if (!payload.csv?.trim()) {
    return NextResponse.json({ error: "CSV content is required." }, { status: 400 });
  }

  const parsedRows = parseCsv(payload.csv);

  if (parsedRows.length === 0) {
    return NextResponse.json({ error: "No valid team rows found in CSV." }, { status: 400 });
  }

  const mode: ImportMode = payload.mode === "replace" ? "replace" : "append";
  const existing = await readTeamMembers();

  const incoming = parsedRows.map((row) =>
    createTeamMember({
      email: row.email,
      name: row.name,
      role: row.role,
      department: row.department,
      manager: row.manager,
      workload: row.workload,
      requiredTools: row.requiredTools,
      grantedTools: row.grantedTools,
    }),
  );

  const merged = mode === "replace" ? incoming : [...existing, ...incoming];
  await writeTeamMembers(merged);

  return NextResponse.json({ imported: incoming.length, mode, total: merged.length });
}
