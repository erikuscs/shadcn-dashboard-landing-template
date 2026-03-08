import { NextResponse } from "next/server";
import { readTeamMembers } from "@/lib/mission-store";

export const runtime = "nodejs";

function csvEscape(value: string | number) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replace(/\"/g, '""')}"`;
  }
  return text;
}

export async function GET() {
  const teamMembers = await readTeamMembers();
  const header = [
    "id",
    "email",
    "name",
    "role",
    "department",
    "manager",
    "workload",
    "requiredTools",
    "grantedTools",
  ];

  const rows = teamMembers.map((member) => [
    member.id,
    member.email,
    member.name,
    member.role,
    member.department,
    member.manager,
    member.workload,
    member.requiredTools.join("|"),
    member.grantedTools.join("|"),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(`${csv}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=team-members.csv",
    },
  });
}
