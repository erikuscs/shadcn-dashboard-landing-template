"use client"

import { useEffect, useState } from "react"
import type { Decision } from "@/lib/mission-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronRight, Search, ClipboardList, CheckCircle, Clock, XCircle } from "lucide-react"

const categoryColors: Record<string, string> = {
  client:    "bg-blue-100 text-blue-700",
  hiring:    "bg-green-100 text-green-700",
  risk:      "bg-red-100 text-red-700",
  strategy:  "bg-purple-100 text-purple-700",
  policy:    "bg-orange-100 text-orange-700",
  platform:  "bg-slate-100 text-slate-700",
}

const outcomeIcon: Record<string, JSX.Element> = {
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  failed:  <XCircle className="h-4 w-4 text-red-500" />,
}

function DecisionRow({ decision }: { decision: Decision }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setOpen(o => !o)}>
        <TableCell className="w-8 pr-0">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(decision.timestamp).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <p className="text-sm font-medium leading-snug">{decision.title}</p>
        </TableCell>
        <TableCell>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${categoryColors[decision.category] ?? "bg-slate-100 text-slate-600"}`}>
            {decision.category}
          </span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
            {outcomeIcon[decision.outcome] ?? <Clock className="h-4 w-4 text-muted-foreground" />}
            <span className="text-xs capitalize">{decision.outcome}</span>
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground capitalize">{decision.decidedBy?.replace(".", " ")}</TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-0">
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Context</p>
                <p className="text-sm text-muted-foreground">{decision.context}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Decision</p>
                <p className="text-sm">{decision.decision}</p>
              </div>
              {decision.outcomeNotes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Outcome Notes</p>
                  <p className="text-sm text-muted-foreground">{decision.outcomeNotes}</p>
                </div>
              )}
              <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                {decision.linkedRiskId && <Badge variant="outline">Risk: {decision.linkedRiskId}</Badge>}
                {decision.linkedClientId && <Badge variant="outline">Client: {decision.linkedClientId}</Badge>}
                {decision.linkedSignalId && <Badge variant="outline">Signal: {decision.linkedSignalId}</Badge>}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [outcomeFilter, setOutcomeFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/decisions").then(r => r.json()).then(d => { setDecisions((d.decisions ?? []).reverse()); setLoading(false) })
  }, [])

  const filtered = decisions.filter(d => {
    const q = search.toLowerCase()
    const matchQ = !q || d.title.toLowerCase().includes(q) || d.context?.toLowerCase().includes(q) || d.decision?.toLowerCase().includes(q)
    const matchC = categoryFilter === "all" || d.category === categoryFilter
    const matchO = outcomeFilter === "all" || d.outcome === outcomeFilter
    return matchQ && matchC && matchO
  })

  const pending = decisions.filter(d => d.outcome === "pending").length
  const successes = decisions.filter(d => d.outcome === "success").length
  const categories = [...new Set(decisions.map(d => d.category))].filter(Boolean)

  if (loading) return <div className="px-6 py-10 text-muted-foreground text-sm">Loading decisions...</div>

  return (
    <div className="px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6 w-6" /> Decision Log
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">All strategic decisions — logged, reasoned, and tracked</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Decisions</div>
          <p className="text-2xl font-bold">{decisions.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Pending Outcome</div>
          <p className="text-2xl font-bold">{pending}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" />Successful</div>
          <p className="text-2xl font-bold">{successes}</p>
        </CardContent></Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search decisions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-37.5"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-35"><SelectValue placeholder="Outcome" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Date</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Decided By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0
              ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No decisions match your filters</TableCell></TableRow>
              : filtered.map(d => <DecisionRow key={d.id} decision={d} />)
            }
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
