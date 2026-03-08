import { NextResponse } from "next/server";
import { createLog, readLogs, readTools, writeLogs, writeTools } from "@/lib/mission-store";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = (await request.json()) as {
    state?: "Draft" | "Beta" | "Live";
    owner?: string;
  };

  const { id } = await params;
  const tools = await readTools();
  const idx = tools.findIndex((tool) => tool.id === id);

  if (idx < 0) {
    return NextResponse.json({ error: "Tool not found." }, { status: 404 });
  }

  const previous = tools[idx];
  const updated = {
    ...previous,
    state: payload.state ?? previous.state,
    owner: payload.owner?.trim() || previous.owner,
  };

  tools[idx] = updated;
  await writeTools(tools);

  if (updated.state !== previous.state) {
    const logs = await readLogs();
    logs.unshift(
      createLog(
        "info",
        `Moved tool \"${updated.name}\" from ${previous.state} to ${updated.state}.`,
      ),
    );
    await writeLogs(logs.slice(0, 200));
  }

  return NextResponse.json({ tool: updated });
}
