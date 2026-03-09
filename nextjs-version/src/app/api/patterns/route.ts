import { NextResponse } from "next/server";
import { readPatterns, writePatterns } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readPatterns();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const data = await readPatterns();
  const now = new Date().toISOString();

  if (payload.id) {
    (data as any)["patterns"] = (data as any)["patterns"].map((item: any) =>
      item.id === payload.id ? { ...item, ...payload, updatedAt: now } : item
    );
  } else {
    // Append new item
    payload.id = `pattern-${Date.now()}`;
    payload.createdAt = now;
    (data as any)["patterns"].push(payload);
  }

  (data as any).updatedAt = now;
  await writePatterns(data as any);
  return NextResponse.json(data);
}
