import { NextResponse } from "next/server";
import {
  createLog,
  createSuggestion,
  readLogs,
  readSuggestions,
  writeLogs,
  writeSuggestions,
} from "@/lib/mission-store";

export const runtime = "nodejs";

export async function GET() {
  const suggestions = await readSuggestions();
  return NextResponse.json({ suggestions: suggestions.slice(0, 30) });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { author?: string; message?: string };

  if (!payload.author?.trim() || !payload.message?.trim()) {
    return NextResponse.json(
      { error: "Author and suggestion message are required." },
      { status: 400 },
    );
  }

  const suggestions = await readSuggestions();
  const suggestion = createSuggestion(payload.author, payload.message);
  suggestions.unshift(suggestion);
  await writeSuggestions(suggestions.slice(0, 200));

  const logs = await readLogs();
  logs.unshift(createLog("info", `Suggestion submitted by ${suggestion.author}.`));
  await writeLogs(logs.slice(0, 200));

  return NextResponse.json({ suggestion }, { status: 201 });
}
