import { NextResponse } from "next/server";
import { readDecisions, writeDecisions } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readDecisions();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const data = await readDecisions();
  const now = new Date().toISOString();

  if (payload.id) {
    (data as any)["decisions"] = (data as any)["decisions"].map((item: any) =>
      item.id === payload.id ? { ...item, ...payload, updatedAt: now } : item
    );
  } else {
    // Append new item
    payload.id = `decision-${Date.now()}`;
    payload.createdAt = now;
    (data as any)["decisions"].push(payload);
  }

  (data as any).updatedAt = now;
  await writeDecisions(data as any);
  return NextResponse.json(data);
}
