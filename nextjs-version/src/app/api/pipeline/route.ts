import { NextResponse } from "next/server";
import { readIntelligence } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readIntelligence();
  return NextResponse.json({ pipeline: data.pipeline });
}
