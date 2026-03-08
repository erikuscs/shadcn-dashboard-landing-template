import { NextResponse } from "next/server";
import { readBenchmarks, writeBenchmarks } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readBenchmarks();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as { kpiId?: string; current?: number };
  if (!payload.kpiId || payload.current === undefined) {
    return NextResponse.json({ error: "kpiId and current value required." }, { status: 400 });
  }
  const data = await readBenchmarks();
  data.kpis = data.kpis.map((kpi) =>
    kpi.id === payload.kpiId ? { ...kpi, current: payload.current! } : kpi,
  );
  data.updatedAt = new Date().toISOString();
  await writeBenchmarks(data);
  return NextResponse.json(data);
}
