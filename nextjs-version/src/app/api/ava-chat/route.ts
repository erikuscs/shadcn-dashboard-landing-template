import { NextResponse } from "next/server";
import {
  createAvaChatMessage,
  createLog,
  readAvaChat,
  readLogs,
  writeAvaChat,
  writeLogs,
  type AvaChatMessage,
} from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const messages = await readAvaChat();
  return NextResponse.json({ messages: messages.slice(0, 100) });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { text?: string };
  if (!payload.text?.trim()) {
    return NextResponse.json({ error: "Command text required." }, { status: 400 });
  }

  const messages = await readAvaChat();

  const userMsg = createAvaChatMessage("user", payload.text.trim());
  const avaAck = createAvaChatMessage(
    "ava",
    "Command received. I am reviewing your directive now — I will update this thread once the action is complete.",
    "pending",
  );

  // Newest first in storage; chronologically userMsg is before avaAck
  messages.unshift(avaAck, userMsg);
  await writeAvaChat(messages.slice(0, 200));

  const logs = await readLogs();
  logs.unshift(createLog("info", `Ava command queued: "${userMsg.text.slice(0, 80)}"`));
  await writeLogs(logs.slice(0, 200));

  return NextResponse.json({ userMsg, avaAck }, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as {
    id?: string;
    text?: string;
    status?: AvaChatMessage["status"];
  };
  if (!payload.id) {
    return NextResponse.json({ error: "id required." }, { status: 400 });
  }

  const messages = await readAvaChat();
  const updated = messages.map((m) =>
    m.id === payload.id
      ? {
          ...m,
          ...(payload.text !== undefined ? { text: payload.text } : {}),
          ...(payload.status !== undefined ? { status: payload.status } : {}),
        }
      : m,
  );
  await writeAvaChat(updated);

  const logs = await readLogs();
  logs.unshift(createLog("info", `Ava response updated for message ${payload.id}.`));
  await writeLogs(logs.slice(0, 200));

  return NextResponse.json({ ok: true });
}
