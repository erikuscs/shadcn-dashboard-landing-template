import { NextResponse } from "next/server";
import { createLog, createToolId, readLogs, readTools, writeLogs, writeTools } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const tools = await readTools();
  return NextResponse.json({ tools });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    name?: string;
    owner?: string;
    state?: "Live" | "Beta" | "Draft";
    trigger?: "manual" | "webhook" | "schedule";
    notes?: string;
  };

  if (!payload.name?.trim()) {
    return NextResponse.json({ error: "Tool name is required." }, { status: 400 });
  }

  const tools = await readTools();
  const tool = {
    id: createToolId(payload.name),
    name: payload.name.trim(),
    owner: payload.owner?.trim() || "Ops",
    state: payload.state || "Draft",
    trigger: payload.trigger || "manual",
    notes: payload.notes?.trim() || "",
    createdAt: new Date().toISOString(),
    lastRunAt: null,
  };

  tools.unshift(tool);
  await writeTools(tools);

  const logs = await readLogs();
  logs.unshift(createLog("info", `Created tool \"${tool.name}\" in ${tool.state} state.`));
  await writeLogs(logs.slice(0, 200));

  return NextResponse.json({ tool }, { status: 201 });
}
