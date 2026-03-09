import { NextRequest, NextResponse } from "next/server"
import { readCrmCompanies, writeCrmCompanies, type CrmCompany } from "@/lib/mission-store"

export async function GET() {
  const data = await readCrmCompanies()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = await readCrmCompanies()
  const newCompany: CrmCompany = {
    ...body,
    id: `co-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.companies.push(newCompany)
  data.updatedAt = new Date().toISOString()
  await writeCrmCompanies(data)
  return NextResponse.json(newCompany, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  const data = await readCrmCompanies()
  const idx = data.companies.findIndex((c) => c.id === id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
  data.companies[idx] = { ...data.companies[idx], ...updates, updatedAt: new Date().toISOString() }
  data.updatedAt = new Date().toISOString()
  await writeCrmCompanies(data)
  return NextResponse.json(data.companies[idx])
}
