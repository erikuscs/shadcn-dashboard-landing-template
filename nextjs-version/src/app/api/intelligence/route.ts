import { NextResponse } from "next/server";
import { readIntelligence, writeIntelligence } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readIntelligence();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as {
    signalId?: string; status?: string; assignedTo?: string; notes?: string;
    riskId?: string; riskStatus?: string; riskNotes?: string;
  };

  const data = await readIntelligence();

  if (payload.signalId) {
    data.signals = data.signals.map((sig) =>
      sig.id === payload.signalId
        ? {
            ...sig,
            ...(payload.status ? { status: payload.status as "new" | "reviewed" | "actioned" | "monitored" } : {}),
            ...(payload.assignedTo !== undefined ? { assignedTo: payload.assignedTo } : {}),
            ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
          }
        : sig,
    );
  }

  if (payload.riskId) {
    data.riskRegister = data.riskRegister.map((r) =>
      r.id === payload.riskId
        ? {
            ...r,
            ...(payload.riskStatus ? { status: payload.riskStatus as "open" | "in_progress" | "closed" } : {}),
            ...(payload.riskNotes !== undefined ? { mitigationPlan: payload.riskNotes } : {}),
          }
        : r,
    );
  }

  data.updatedAt = new Date().toISOString();
  await writeIntelligence(data);
  return NextResponse.json(data);
}
