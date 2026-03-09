"use client"

import { useEffect, useState, useMemo } from "react"
import type { IntelligenceData, IntelligenceSignal, RiskEntry, PipelineEntry } from "@/lib/mission-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronRight, AlertTriangle, Search, MoreHorizontal, TrendingUp, Shield, DollarSign, ArrowUpDown } from "lucide-react"

// ── Color helpers ──────────────────────────────────────────────────
const signalTypeBadge: Record<string, string> = {
  regulatory:       "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  threat:           "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  leadership_change:"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  growth:           "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  market:           "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
}
const severityVariant: Record<string, "destructive" | "secondary" | "outline"> = {
  critical: "destructive", high: "destructive", medium: "secondary", low: "outline",
}
const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
const stageOrder: Record<string, number> = { prospect: 1, qualified: 2, proposal: 3, engaged: 4, retained: 5 }

// ── Signal row with expand + API actions ───────────────────────────
function SignalRow({ signal, onUpdate }: { signal: IntelligenceSignal; onUpdate: (id: string, status: string) => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const updateStatus = async (status: string) => {
    setSaving(true)
    await fetch("/api/intelligence", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signalId: signal.id, status }),
    })
    onUpdate(signal.id, status)
    setSaving(false)
  }

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setOpen((o) => !o)}>
        <TableCell className="w-8 pr-0">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </TableCell>
        <TableCell>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${signalTypeBadge[signal.type] ?? ""}`}>
            {signal.type.replace("_", " ")}
          </span>
        </TableCell>
        <TableCell className="max-w-sm">
          <p className="text-sm font-medium leading-snug line-clamp-2">{signal.headline}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{signal.source} · {new Date(signal.timestamp).toLocaleDateString()}</p>
        </TableCell>
        <TableCell>
          <Badge variant={severityVariant[signal.severity] ?? "outline"} className="capitalize">{signal.severity}</Badge>
        </TableCell>
        <TableCell>
          {signal.assignedTo
            ? <span className="text-sm capitalize">{signal.assignedTo.replace(".", " ")}</span>
            : <span className="text-xs text-amber-600 font-medium">⚠ Unassigned</span>}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize">{signal.status}</Badge>
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={saving}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateStatus("reviewed")} className="cursor-pointer">Mark Reviewed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("actioned")} className="cursor-pointer">Mark Actioned</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("monitored")} className="cursor-pointer">Monitor</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("new")} className="cursor-pointer">Reset to New</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/20 px-8 py-4 border-b">
            <div className="space-y-3">
              {signal.notes && (
                <div className="rounded-lg bg-background border p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Why it made the board</p>
                  <p className="text-sm">{signal.notes}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <span><span className="text-muted-foreground">Sector: </span>{signal.sector}</span>
                <span><span className="text-muted-foreground">Actionable: </span>{signal.actionable ? "Yes" : "No"}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["reviewed", "actioned", "monitored"] as const).map((s) => (
                  <Button key={s} size="sm" variant={signal.status === s ? "default" : "outline"}
                    disabled={saving || signal.status === s} onClick={() => updateStatus(s)} className="capitalize">
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function IntelligencePage() {
  const [data, setData] = useState<IntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)

  // Signal filters
  const [sigSearch, setSigSearch] = useState("")
  const [sigSeverity, setSigSeverity] = useState("all")
  const [sigStatus, setSigStatus] = useState("all")
  const [sigType, setSigType] = useState("all")
  const [sigSort, setSigSort] = useState<"severity" | "date">("severity")

  // Risk filters
  const [riskSearch, setRiskSearch] = useState("")
  const [riskSeverity, setRiskSeverity] = useState("all")
  const [riskStatus, setRiskStatus] = useState("all")
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null)

  // Pipeline filters
  const [pipeSearch, setPipeSearch] = useState("")
  const [pipeStage, setPipeStage] = useState("all")
  const [pipeSector, setPipeSector] = useState("all")

  useEffect(() => {
    fetch("/api/intelligence").then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  const handleSignalUpdate = (id: string, status: string) => {
    setData((prev) => {
      if (!prev) return prev
      return { ...prev, signals: prev.signals.map((s) => s.id === id ? { ...s, status: status as IntelligenceSignal["status"] } : s) }
    })
  }

  // Filtered + sorted signals
  const filteredSignals = useMemo(() => {
    if (!data) return []
    return data.signals
      .filter((s) => {
        const matchSearch = !sigSearch || s.headline.toLowerCase().includes(sigSearch.toLowerCase()) || s.source.toLowerCase().includes(sigSearch.toLowerCase())
        const matchSev = sigSeverity === "all" || s.severity === sigSeverity
        const matchStatus = sigStatus === "all" || s.status === sigStatus
        const matchType = sigType === "all" || s.type === sigType
        return matchSearch && matchSev && matchStatus && matchType
      })
      .sort((a, b) => sigSort === "severity"
        ? (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9)
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [data, sigSearch, sigSeverity, sigStatus, sigType, sigSort])

  // Filtered risks
  const filteredRisks = useMemo(() => {
    if (!data) return []
    return data.riskRegister.filter((r) => {
      const matchSearch = !riskSearch || r.title.toLowerCase().includes(riskSearch.toLowerCase()) || r.client.toLowerCase().includes(riskSearch.toLowerCase())
      const matchSev = riskSeverity === "all" || r.severity === riskSeverity
      const matchStatus = riskStatus === "all" || r.status === riskStatus
      return matchSearch && matchSev && matchStatus
    }).sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))
  }, [data, riskSearch, riskSeverity, riskStatus])

  // Filtered pipeline
  const filteredPipeline = useMemo(() => {
    if (!data) return []
    return data.pipeline.filter((p) => {
      const matchSearch = !pipeSearch || p.client.toLowerCase().includes(pipeSearch.toLowerCase())
      const matchStage = pipeStage === "all" || p.stage === pipeStage
      const matchSector = pipeSector === "all" || p.sector === pipeSector
      return matchSearch && matchStage && matchSector
    }).sort((a, b) => (stageOrder[b.stage] ?? 0) - (stageOrder[a.stage] ?? 0))
  }, [data, pipeSearch, pipeStage, pipeSector])

  if (loading) return <div className="px-6 py-12 text-muted-foreground flex items-center gap-2"><div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" /> Loading intelligence…</div>
  if (!data) return <div className="px-6 py-8 text-destructive">Failed to load intelligence data.</div>

  const openSignals = data.signals.filter((s) => s.status !== "actioned").length
  const openRisks = data.riskRegister.filter((r) => r.status !== "closed").length
  const totalPipelineValue = data.pipeline.reduce((sum, p) => sum + p.valueUsd, 0)
  const pipelineSectors = [...new Set(data.pipeline.map((p) => p.sector))]

  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Intelligence</h1>
        <p className="text-muted-foreground">Signals, risk register, and pipeline overview</p>
      </div>

      {/* Stat chips */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Open Signals", value: openSignals, sub: `${data.signals.length} total tracked`, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Active Risks", value: openRisks, sub: `${data.riskRegister.length} total in register`, icon: Shield, color: "text-red-600" },
          { label: "Pipeline Value", value: `$${(totalPipelineValue / 1000).toFixed(0)}k`, sub: `${data.pipeline.length} active deals`, icon: DollarSign, color: "text-green-600" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="flex flex-row items-center gap-4 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="bg-muted/50 h-11">
          <TabsTrigger value="signals" className="cursor-pointer gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <AlertTriangle className="h-4 w-4" /> Signals ({filteredSignals.length})
          </TabsTrigger>
          <TabsTrigger value="risks" className="cursor-pointer gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" /> Risk Register ({filteredRisks.length})
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="cursor-pointer gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <TrendingUp className="h-4 w-4" /> Pipeline ({filteredPipeline.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Signals tab ── */}
        <TabsContent value="signals" className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search signals…" className="pl-9" value={sigSearch} onChange={(e) => setSigSearch(e.target.value)} />
            </div>
            <Select value={sigSeverity} onValueChange={setSigSeverity}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sigStatus} onValueChange={setSigStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
                <SelectItem value="monitored">Monitored</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sigType} onValueChange={setSigType}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="regulatory">Regulatory</SelectItem>
                <SelectItem value="threat">Threat</SelectItem>
                <SelectItem value="leadership_change">Leadership Change</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="market">Market</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setSigSort(s => s === "severity" ? "date" : "severity")} className="gap-1">
              <ArrowUpDown className="h-4 w-4" /> {sigSort === "severity" ? "By date" : "By severity"}
            </Button>
            {(sigSearch || sigSeverity !== "all" || sigStatus !== "all" || sigType !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSigSearch(""); setSigSeverity("all"); setSigStatus("all"); setSigType("all") }}>
                Clear filters
              </Button>
            )}
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Type</TableHead>
                    <TableHead>Headline</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignals.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No signals match the current filters.</TableCell></TableRow>
                  ) : filteredSignals.map((s) => (
                    <SignalRow key={s.id} signal={s} onUpdate={handleSignalUpdate} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Risk Register tab ── */}
        <TabsContent value="risks" className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search risks…" className="pl-9" value={riskSearch} onChange={(e) => setRiskSearch(e.target.value)} />
            </div>
            <Select value={riskSeverity} onValueChange={setRiskSeverity}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskStatus} onValueChange={setRiskStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            {(riskSearch || riskSeverity !== "all" || riskStatus !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setRiskSearch(""); setRiskSeverity("all"); setRiskStatus("all") }}>Clear filters</Button>
            )}
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRisks.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No risks match the current filters.</TableCell></TableRow>
                  ) : filteredRisks.map((r: RiskEntry) => (
                    <>
                      <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedRisk(expandedRisk === r.id ? null : r.id)}>
                        <TableCell className="w-8 pr-0">
                          {expandedRisk === r.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell className="max-w-xs"><p className="text-sm font-medium line-clamp-2">{r.title}</p><p className="text-xs text-muted-foreground">{r.category}</p></TableCell>
                        <TableCell className="text-sm">{r.client}</TableCell>
                        <TableCell><Badge variant={severityVariant[r.severity] ?? "outline"} className="capitalize">{r.severity}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{r.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-sm capitalize">{r.owner.replace(".", " ")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(r.targetCloseDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                      {expandedRisk === r.id && (
                        <TableRow key={`${r.id}-expand`}>
                          <TableCell colSpan={7} className="bg-muted/20 px-8 py-4 border-b">
                            <div className="rounded-lg bg-background border p-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Mitigation Plan</p>
                              <p className="text-sm">{r.mitigationPlan}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Pipeline tab ── */}
        <TabsContent value="pipeline" className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search clients…" className="pl-9" value={pipeSearch} onChange={(e) => setPipeSearch(e.target.value)} />
            </div>
            <Select value={pipeStage} onValueChange={setPipeStage}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="engaged">Engaged</SelectItem>
                <SelectItem value="retained">Retained</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pipeSector} onValueChange={setPipeSector}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Sector" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sectors</SelectItem>
                {pipelineSectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {(pipeSearch || pipeStage !== "all" || pipeSector !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setPipeSearch(""); setPipeStage("all"); setPipeSector("all") }}>Clear filters</Button>
            )}
          </div>
          <div className="space-y-3">
            {filteredPipeline.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No deals match the current filters.</CardContent></Card>
            ) : filteredPipeline.map((p: PipelineEntry, idx) => {
              const progress = stageOrder[p.stage] ? Math.round((stageOrder[p.stage] / 5) * 100) : 0
              const daysSince = Math.floor((Date.now() - new Date(p.lastActivity).getTime()) / 86_400_000)
              const isStale = daysSince > 14
              return (
                <Card key={p.id} className={isStale ? "border-amber-200 bg-amber-50/30 dark:bg-amber-950/20" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{p.client}</p>
                            <Badge variant="outline" className="text-xs">{p.sector}</Badge>
                            <Badge variant="outline" className="text-xs capitalize">{p.stage}</Badge>
                            {isStale && <Badge variant="secondary" className="text-xs text-amber-700 bg-amber-100">Stale {daysSince}d</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Owner: {p.owner} · Last activity: {new Date(p.lastActivity).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold">${p.valueUsd.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          <Progress value={progress} className="w-20 h-1.5" />
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <Card>
            <CardContent className="p-4 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{filteredPipeline.length} deals</span>
              <span className="font-bold">Total: ${filteredPipeline.reduce((s, p) => s + p.valueUsd, 0).toLocaleString()}</span>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
