import { NextResponse } from "next/server";
import { readInfrastructure, writeInfrastructure } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readInfrastructure();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const data = await readInfrastructure();
  const now = new Date().toISOString();

  if (payload.id) {
    (data as any)["sites"] = (data as any)["sites"].map((item: any) =>
      item.id === payload.id ? { ...item, ...payload, updatedAt: now } : item
    );
  } else {
    // Append new item
    payload.id = `infrastructure-${Date.now()}`;
    payload.createdAt = now;
    (data as any)["sites"].push(payload);
  }

  (data as any).updatedAt = now;
  await writeInfrastructure(data as any);
  return NextResponse.json(data);
}
