import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AppUsage = {
  name: string;
  category: string;
  runsPerDay: number;
  successRate: number;
  updatedAt: string;
};

const usagePath = path.join(process.cwd(), "data", "app-usage.json");

async function readUsage() {
  try {
    const raw = await fs.readFile(usagePath, "utf8");
    return JSON.parse(raw) as AppUsage[];
  } catch {
    return [] as AppUsage[];
  }
}

export async function GET() {
  const usage = await readUsage();
  return NextResponse.json({ usage });
}
