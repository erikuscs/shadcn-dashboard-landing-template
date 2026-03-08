import { NextResponse } from "next/server";
import { createTeamMember, readTeamMembers, writeTeamMembers } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const teamMembers = await readTeamMembers();
  return NextResponse.json({ teamMembers });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    email?: string;
    name?: string;
    role?: string;
    department?: string;
    manager?: string;
    workload?: number;
    requiredTools?: string[];
    grantedTools?: string[];
  };

  if (!payload.name?.trim() || !payload.role?.trim() || !payload.email?.trim()) {
    return NextResponse.json({ error: "Name, role, and email are required." }, { status: 400 });
  }

  const email = payload.email.trim().toLowerCase();
  if (!email.endsWith("@sustainablegaps.com")) {
    return NextResponse.json(
      { error: "Email must use @sustainablegaps.com domain." },
      { status: 400 },
    );
  }

  const teamMembers = await readTeamMembers();
  const teamMember = createTeamMember({
    email,
    name: payload.name.trim(),
    role: payload.role.trim(),
    department: payload.department?.trim() || "Ops",
    manager: payload.manager?.trim() || "Unassigned",
    workload: Number.isFinite(payload.workload) ? Math.max(0, Math.min(100, payload.workload!)) : 60,
    requiredTools: payload.requiredTools ?? ["OpenClaw Mission Control"],
    grantedTools: payload.grantedTools ?? ["OpenClaw Mission Control"],
  });

  teamMembers.push(teamMember);
  await writeTeamMembers(teamMembers);

  return NextResponse.json({ teamMember }, { status: 201 });
}
