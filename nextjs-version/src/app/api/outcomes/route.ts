import { NextResponse } from "next/server";
import { readOutcomes, writeOutcomes } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readOutcomes();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const data = await readOutcomes();
  const now = new Date().toISOString();

  if (payload.id) {
    (data as any)["outcomes"] = (data as any)["outcomes"].map((item: any) =>
      item.id === payload.id ? { ...item, ...payload, updatedAt: now } : item
    );
  } else {
    // Append new item
    payload.id = `outcome-${Date.now()}`;
    payload.createdAt = now;
    (data as any)["outcomes"].push(payload);
  }

  (data as any).updatedAt = now;
  await writeOutcomes(data as any);
  return NextResponse.json(data);
}
