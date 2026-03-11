import { NextResponse } from "next/server";
import { readTeamMembers } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const teamMembers = await readTeamMembers();
  const models = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    department: m.department,
    model: (m as Record<string, unknown>).model ?? null,
    modelRationale: (m as Record<string, unknown>).modelRationale ?? null,
  }));
  return NextResponse.json({ models });
}
