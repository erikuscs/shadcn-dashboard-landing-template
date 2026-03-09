"use client"

import { useEffect, useState } from "react"
import type { InfrastructureSite } from "@/lib/mission-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronRight, Search, Server, AlertTriangle, CheckCircle, Clock } from "lucide-react"

const assessmentColors: Record<string, string> = {
  complete:     "bg-green-100 text-green-700",
  in_progress:  "bg-blue-100 text-blue-700",
  scheduled:    "bg-yellow-100 text-yellow-700",
  not_started:  "bg-slate-100 text-slate-600",
}

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high:     "bg-orange-100 text-orange-700",
  medium:   "bg-yellow-100 text-yellow-700",
  low:      "bg-slate-100 text-slate-600",
}

type Gap = {
  id: string
  area: string
  description: string
  severity: string
  linkedRiskId?: string
  remediationOwner?: string
  targetCloseDate?: string
}

function SiteRow({ site }: { site: InfrastructureSite & { criticalGaps?: Gap[] } }) {
  const [open, setOpen] = useState(false)
  const gaps: Gap[] = site.criticalGaps ?? []
  const criticalCount = gaps.filter(g => g.severity === "critical").length
  const highCount = gaps.filter(g => g.severity === "high").length

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setOpen(o => !o)}>
        <TableCell className="w-8 pr-0">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </TableCell>
        <TableCell>
          <p className="text-sm font-medium leading-snug">{site.name}</p>
          <p className="text-xs text-muted-foreground">{site.address ?? ""}</p>
        </TableCell>
        <TableCell className="text-sm">{site.sector}</TableCell>
        <TableCell>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${assessmentColors[site.assessmentStatus] ?? "bg-slate-100 text-slate-600"}`}>
            {site.assessmentStatus?.replace("_", " ")}
          </span>
        </TableCell>
        <TableCell>
          {gaps.length > 0 ? (
            <div className="flex gap-1">
              {criticalCount > 0 && <Badge variant="destructive" className="text-xs">{criticalCount} critical</Badge>}
              {highCount > 0 && <Badge className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-100">{highCount} high</Badge>}
              {criticalCount === 0 && highCount === 0 && <Badge variant="outline" className="text-xs">{gaps.length} gaps</Badge>}
            </div>
          ) : <span className="text-xs text-green-600">✓ No gaps</span>}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground capitalize">{site.owner?.replace(".", " ")}</TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {site.nextReviewAt ? new Date(site.nextReviewAt).toLocaleDateString() : "—"}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/30 p-0">
            <div className="p-4 space-y-4">
              {/* Regulatory scope */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Regulatory Scope</p>
                <div className="flex gap-1 flex-wrap">
                  {(site.regulatoryScope ?? []).map((r: string) => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}
                </div>
              </div>

              {/* Notes */}
              {site.infrastructureNotes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{site.infrastructureNotes}</p>
                </div>
              )}

              {/* Gaps */}
              {gaps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Critical Gaps ({gaps.length})</p>
                  <div className="space-y-2">
                    {gaps.map(gap => (
                      <div key={gap.id} className="rounded-md border bg-background p-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-medium">{gap.area}</span>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${severityColors[gap.severity] ?? ""}`}>{gap.severity}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{gap.description}</p>
                          {gap.remediationOwner && (
                            <p className="text-xs text-muted-foreground mt-1">Owner: <span className="capitalize">{gap.remediationOwner.replace(".", " ")}</span></p>
                          )}
                        </div>
                        {gap.targetCloseDate && (
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">Target</p>
                            <p className="text-xs font-medium">{new Date(gap.targetCloseDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function InfrastructurePage() {
  const [sites, setSites] = useState<(InfrastructureSite & { criticalGaps?: Gap[] })[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/infrastructure").then(r => r.json()).then(d => { setSites(d.sites ?? []); setLoading(false) })
  }, [])

  const filtered = sites.filter(s => {
    const q = search.toLowerCase()
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.sector?.toLowerCase().includes(q)
    const matchS = statusFilter === "all" || s.assessmentStatus === statusFilter
    return matchQ && matchS
  })

  const totalGaps = sites.reduce((n, s) => n + (s.criticalGaps?.length ?? 0), 0)
  const criticalGaps = sites.reduce((n, s) => n + (s.criticalGaps?.filter(g => g.severity === "critical").length ?? 0), 0)
  const inProgress = sites.filter(s => s.assessmentStatus === "in_progress").length

  if (loading) return <div className="px-6 py-10 text-muted-foreground text-sm">Loading infrastructure...</div>

  return (
    <div className="px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Server className="h-6 w-6" /> Infrastructure
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Client site assessments, gap tracking, and remediation status</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Server className="h-3.5 w-3.5" />Total Sites</div>
          <p className="text-2xl font-bold">{sites.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-red-500" />Critical Gaps</div>
          <p className="text-2xl font-bold">{criticalGaps}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Assessments In Progress</div>
          <p className="text-2xl font-bold">{inProgress}</p>
        </CardContent></Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search sites..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Assessment Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Site</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Gaps</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Next Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0
              ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8 text-sm">No sites match your filters</TableCell></TableRow>
              : filtered.map(s => <SiteRow key={s.id} site={s} />)
            }
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
