import { NextResponse } from "next/server";
import { readOpportunities, writeOpportunities } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readOpportunities();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const data = await readOpportunities();
  const now = new Date().toISOString();

  if (payload.id) {
    (data as any)["opportunities"] = (data as any)["opportunities"].map((item: any) =>
      item.id === payload.id ? { ...item, ...payload, updatedAt: now } : item
    );
  } else {
    // Append new item
    payload.id = `opportunitie-${Date.now()}`;
    payload.createdAt = now;
    (data as any)["opportunities"].push(payload);
  }

  (data as any).updatedAt = now;
  await writeOpportunities(data as any);
  return NextResponse.json(data);
}
