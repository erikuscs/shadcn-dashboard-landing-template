import { NextResponse } from "next/server";
import {
  createChloeChatMessage,
  createLog,
  readChloeChat,
  readLogs,
  writeChloeChat,
  writeLogs,
  type ChloeChatMessage,
} from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const messages = await readChloeChat();
  return NextResponse.json({ messages: messages.slice(0, 100) });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { text?: string };
  if (!payload.text?.trim()) {
    return NextResponse.json({ error: "Command text required." }, { status: 400 });
  }

  const messages = await readChloeChat();

  const userMsg = createChloeChatMessage("user", payload.text.trim());
  const chloeAck = createChloeChatMessage(
    "chloe",
    "Command received. Reviewing your directive now — I will update this thread once the action is complete.",
    "pending",
  );

  // Newest first in storage; chronologically userMsg is before chloeAck
  messages.unshift(chloeAck, userMsg);
  await writeChloeChat(messages.slice(0, 200));

  const logs = await readLogs();
  logs.unshift(createLog("info", `Command queued: "${userMsg.text.slice(0, 80)}"`));
  await writeLogs(logs.slice(0, 200));

  return NextResponse.json({ userMsg, chloeAck }, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as {
    id?: string;
    text?: string;
    status?: ChloeChatMessage["status"];
  };
  if (!payload.id) {
    return NextResponse.json({ error: "id required." }, { status: 400 });
  }

  const messages = await readChloeChat();
  const updated = messages.map((m) =>
    m.id === payload.id
      ? {
          ...m,
          ...(payload.text !== undefined ? { text: payload.text } : {}),
          ...(payload.status !== undefined ? { status: payload.status } : {}),
        }
      : m,
  );
  await writeChloeChat(updated);

  const logs = await readLogs();
  logs.unshift(createLog("info", `Chloe response updated for message ${payload.id}.`));
  await writeLogs(logs.slice(0, 200));

  return NextResponse.json({ ok: true });
}
