import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const alertsPath = path.join(process.cwd(), "data", "alerts.json");

async function readAlerts() {
  try {
    const raw = await fs.readFile(alertsPath, "utf8");
    return JSON.parse(raw) as { updatedAt: string; alerts: unknown[] };
  } catch {
    return { updatedAt: new Date().toISOString(), alerts: [] };
  }
}

export async function GET() {
  const data = await readAlerts();
  return NextResponse.json(data);
}
