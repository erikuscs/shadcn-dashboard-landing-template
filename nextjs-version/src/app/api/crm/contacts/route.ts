import { NextRequest, NextResponse } from "next/server"
import { readCrmContacts, writeCrmContacts, type CrmContact } from "@/lib/mission-store"

export async function GET() {
  const data = await readCrmContacts()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = await readCrmContacts()
  const newContact: CrmContact = {
    ...body,
    id: `contact-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  data.contacts.push(newContact)
  data.updatedAt = new Date().toISOString()
  await writeCrmContacts(data)
  return NextResponse.json(newContact, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  const data = await readCrmContacts()
  const idx = data.contacts.findIndex((c) => c.id === id)
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
  data.contacts[idx] = { ...data.contacts[idx], ...updates }
  data.updatedAt = new Date().toISOString()
  await writeCrmContacts(data)
  return NextResponse.json(data.contacts[idx])
}
