import { NextResponse } from "next/server";
import { readRoadmap } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readRoadmap();
  return NextResponse.json(data);
}
