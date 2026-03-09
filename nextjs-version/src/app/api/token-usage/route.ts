import { NextRequest, NextResponse } from "next/server"
import { readTokenUsage, writeTokenUsage } from "@/lib/mission-store"

export async function GET() {
  const data = await readTokenUsage()
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { memberId, ...updates } = body
  const data = await readTokenUsage()
  const idx = data.records.findIndex((r) => r.memberId === memberId)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
  data.records[idx] = { ...data.records[idx], ...updates }
  data.updatedAt = new Date().toISOString()
  await writeTokenUsage(data)
  return NextResponse.json(data.records[idx])
}
