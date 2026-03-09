"use client"

import { useEffect, useState } from "react"
import type { Client } from "@/lib/mission-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronRight, Search, Building2, DollarSign, AlertTriangle, Activity } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const statusColors: Record<string, string> = {
  active:    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  engaged:   "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  upcoming:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  prospect:  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  inactive:  "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function ClientRow({ client }: { client: Client }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setOpen(o => !o)}>
        <TableCell className="w-8 pr-0">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </TableCell>
        <TableCell>
          <p className="text-sm font-medium">{client.name}</p>
          <p className="text-xs text-muted-foreground">{client.sector} · {client.type}</p>
        </TableCell>
        <TableCell>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[client.status] ?? ""}`}>{client.status}</span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Progress value={client.healthScore} className="w-16 h-1.5" />
            <span className="text-sm tabular-nums">{client.healthScore}</span>
          </div>
        </TableCell>
        <TableCell className="text-sm">{fmt(client.contractValueUsd)}</TableCell>
        <TableCell>
          {client.openRisks > 0
            ? <Badge variant="destructive" className="text-xs">{client.openRisks} risks</Badge>
            : <span className="text-xs text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground capitalize">{client.owner?.replace(".", " ")}</TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {client.lastTouchpoint ? new Date(client.lastTouchpoint).toLocaleDateString() : "—"}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 p-0">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Contact</p>
                {client.primaryContact ? (
                  <div>
                    <p className="text-sm font-medium">{client.primaryContact.name}</p>
                    <p className="text-xs text-muted-foreground">{client.primaryContact.title}</p>
                    <p className="text-xs text-blue-600">{client.primaryContact.email}</p>
                  </div>
                ) : <p className="text-sm text-muted-foreground">—</p>}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contract</p>
                <p className="text-sm">{client.contractStart ? new Date(client.contractStart).toLocaleDateString() : "TBD"} → {client.contractEnd ? new Date(client.contractEnd).toLocaleDateString() : "TBD"}</p>
                <p className="text-sm font-semibold">{fmt(client.contractValueUsd)}</p>
              </div>
              {client.notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{client.notes}</p>
                </div>
              )}
              {client.tags?.length > 0 && (
                <div className="sm:col-span-2 flex gap-1 flex-wrap">
                  {client.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(d => { setClients(d.clients ?? []); setLoading(false) })
  }, [])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q)
    const matchS = statusFilter === "all" || c.status === statusFilter
    return matchQ && matchS
  })

  const totalARR = clients.reduce((s, c) => s + (c.contractValueUsd ?? 0), 0)
  const activeCount = clients.filter(c => ["active", "engaged"].includes(c.status)).length
  const avgHealth = clients.length ? Math.round(clients.reduce((s, c) => s + (c.healthScore ?? 0), 0) / clients.length) : 0
  const openRisks = clients.reduce((s, c) => s + (c.openRisks ?? 0), 0)

  if (loading) return <div className="px-6 py-10 text-muted-foreground text-sm">Loading clients...</div>

  return (
    <div className="px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-6 w-6" /> Clients
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Active engagements, contracts, and client health</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />Total Clients</div>
          <p className="text-2xl font-bold">{clients.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Activity className="h-3.5 w-3.5" />Active / Engaged</div>
          <p className="text-2xl font-bold">{activeCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />Total Contract Value</div>
          <p className="text-2xl font-bold">{fmt(totalARR)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Open Risks</div>
          <p className="text-2xl font-bold">{openRisks}</p>
        </CardContent></Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="engaged">Engaged</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Contract Value</TableHead>
              <TableHead>Risks</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last Touchpoint</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0
              ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8 text-sm">No clients match your filters</TableCell></TableRow>
              : filtered.map(c => <ClientRow key={c.id} client={c} />)
            }
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
