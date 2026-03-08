import { NextResponse } from "next/server";
import { createLog, readLogs, readTools, writeLogs, writeTools } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tools = await readTools();
  const idx = tools.findIndex((tool) => tool.id === id);

  if (idx < 0) {
    return NextResponse.json({ error: "Tool not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const updatedTool = { ...tools[idx], lastRunAt: now };
  tools[idx] = updatedTool;
  await writeTools(tools);

  const logs = await readLogs();
  logs.unshift(createLog("info", `Executed tool \"${updatedTool.name}\" successfully.`));
  await writeLogs(logs.slice(0, 200));

  return NextResponse.json({ tool: updatedTool });
}
