import { NextResponse } from "next/server";
import { readClients, writeClients } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readClients();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const data = await readClients();
  const now = new Date().toISOString();

  if (payload.clientId) {
    (data as any)["clients"] = (data as any)["clients"].map((item: any) =>
      item.clientId === payload.clientId ? { ...item, ...payload, updatedAt: now } : item
    );
  } else {
    // Append new item
    payload.clientId = `client-${Date.now()}`;
    payload.createdAt = now;
    (data as any)["clients"].push(payload);
  }

  (data as any).updatedAt = now;
  await writeClients(data as any);
  return NextResponse.json(data);
}
