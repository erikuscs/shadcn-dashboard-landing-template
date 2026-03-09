"use client"

import { useEffect, useState } from "react"
import type { TokenUsageRecord, TokenUsageData, TeamMember } from "@/lib/mission-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  ChevronDown, ChevronRight, Search, DollarSign, Zap, Users,
  AlertTriangle, CheckCircle, Clock, Wrench, BarChart3
} from "lucide-react"

// ── Helpers ────────────────────────────────────────────────────────
function fmtCost(n: number) {
  return n < 1 ? `$${n.toFixed(3)}` : `$${n.toFixed(2)}`
}
function fmtK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}M`
  return `${n}K`
}

const modelColors: Record<string, string> = {
  "claude-3-5-sonnet": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "gpt-4o":            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "gpt-4o-mini":       "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "gpt-4":             "bg-teal-100 text-teal-700",
}

const flagColors: Record<string, string> = {
  high_volume:              "bg-orange-100 text-orange-700",
  model_downgrade_suggested:"bg-yellow-100 text-yellow-700",
  pending_onboard:          "bg-slate-100 text-slate-600",
  tool_gap:                 "bg-red-100 text-red-700",
}

const flagLabels: Record<string, string> = {
  high_volume:               "High Volume",
  model_downgrade_suggested: "Model Review",
  pending_onboard:           "Pending Onboard",
  tool_gap:                  "Tool Gap",
}

// ── Tool gap detection ─────────────────────────────────────────────
function detectToolGaps(record: TokenUsageRecord, member: TeamMember | undefined): string[] {
  if (!member) return []
  const granted = new Set(member.grantedTools)
  const required = member.requiredTools ?? []
  return required.filter(t => !granted.has(t))
}

// ── Staff row ──────────────────────────────────────────────────────
function StaffRow({ record, member, totalBudget }: {
  record: TokenUsageRecord
  member: TeamMember | undefined
  totalBudget: number
}) {
  const [open, setOpen] = useState(false)
  const toolGaps = detectToolGaps(record, member)
  const effectiveFlag = toolGaps.length > 0 ? "tool_gap" : record.complianceFlag

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setOpen(o => !o)}>
        <TableCell className="w-8 pr-0">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </TableCell>
        <TableCell>
          <p className="text-sm font-medium">{record.memberName}</p>
          <p className="text-xs text-muted-foreground">{record.department}</p>
        </TableCell>
        <TableCell>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${modelColors[record.model] ?? "bg-slate-100 text-slate-700"}`}>
            {record.model}
          </span>
        </TableCell>
        <TableCell className="text-sm tabular-nums">{record.sessions > 0 ? record.sessions.toLocaleString() : "—"}</TableCell>
        <TableCell className="text-sm tabular-nums">
          {record.tokensInputK > 0 ? fmtK(record.tokensInputK) : "—"}
          {record.tokensOutputK > 0 && <span className="text-muted-foreground"> / {fmtK(record.tokensOutputK)}</span>}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold tabular-nums ${record.costUsd > 20 ? "text-orange-600" : "text-foreground"}`}>
              {fmtCost(record.costUsd)}
            </span>
            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${record.costUsd / totalBudget > 0.15 ? "bg-orange-500" : "bg-primary"}`}
                style={{ width: `${Math.min(100, (record.costUsd / Math.max(totalBudget * 0.25, 1)) * 100)}%` }}
              />
            </div>
          </div>
        </TableCell>
        <TableCell>
          {effectiveFlag
            ? <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${flagColors[effectiveFlag] ?? ""}`}>{flagLabels[effectiveFlag] ?? effectiveFlag}</span>
            : <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />OK</span>}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {record.lastActivity ? new Date(record.lastActivity).toLocaleDateString() : "—"}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 p-0">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Use Case</p>
                <p className="text-sm">{record.primaryUseCase}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Token Breakdown</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Input</span><span>{fmtK(record.tokensInputK)} tokens</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Output</span><span>{fmtK(record.tokensOutputK)} tokens</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Avg per session</span><span>{record.avgSessionTokens > 0 ? record.avgSessionTokens.toLocaleString() : "—"}</span></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools Actively Used</p>
                <div className="flex gap-1 flex-wrap">
                  {record.toolsUsed.length > 0
                    ? record.toolsUsed.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)
                    : <span className="text-xs text-muted-foreground">None recorded</span>}
                </div>
              </div>
              {member && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Granted Tools</p>
                  <div className="flex gap-1 flex-wrap">
                    {member.grantedTools.map(t => (
                      <Badge
                        key={t}
                        variant={record.toolsUsed.includes(t) ? "default" : "outline"}
                        className={`text-xs ${!record.toolsUsed.includes(t) && record.sessions > 0 ? "opacity-50" : ""}`}
                      >
                        {t}
                        {!record.toolsUsed.includes(t) && record.sessions > 0 && " ⚠"}
                      </Badge>
                    ))}
                  </div>
                  {toolGaps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 mt-2">Missing Required Tools</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {toolGaps.map(t => <Badge key={t} className="text-xs bg-red-100 text-red-700 hover:bg-red-100">{t}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {record.complianceFlag === "model_downgrade_suggested" && (
                <div className="sm:col-span-2 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3">
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">💡 Model Review Suggested</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    This role primarily handles communication and coordination — tasks well-suited for gpt-4o-mini at ~10x lower cost.
                    Consider confirming current model is appropriate for the complexity of outputs required.
                  </p>
                </div>
              )}
              {record.complianceFlag === "high_volume" && (
                <div className="sm:col-span-2 rounded-md bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-3">
                  <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">📊 High Volume Usage</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Token consumption is above average for this role. Review session logs to confirm all usage is on-task.
                    Consider batching similar requests or using cached context where applicable.
                  </p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

// ── Tool compliance summary ────────────────────────────────────────
function ToolComplianceRow({ member, usedTools }: { member: TeamMember; usedTools: string[] }) {
  const required = member.requiredTools ?? []
  const granted = member.grantedTools ?? []
  const gaps = required.filter(t => !granted.includes(t))
  const unused = granted.filter(t => member.status !== "new_hire" && !usedTools.includes(t))
  const compliant = gaps.length === 0

  return (
    <TableRow>
      <TableCell>
        <p className="text-sm font-medium">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.department}</p>
      </TableCell>
      <TableCell>
        {member.status === "new_hire"
          ? <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">🆕 Pending</Badge>
          : compliant
            ? <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Compliant</span>
            : <span className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{gaps.length} gap(s)</span>}
      </TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
          {granted.map(t => (
            <Badge
              key={t}
              variant={usedTools.includes(t) ? "default" : "outline"}
              className={`text-xs ${unused.includes(t) ? "opacity-50" : ""}`}
            >
              {t}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        {unused.length > 0
          ? <div className="flex gap-1 flex-wrap">{unused.map(t => <Badge key={t} variant="outline" className="text-xs opacity-60">{t} ⚠</Badge>)}</div>
          : <span className="text-xs text-muted-foreground">—</span>}
      </TableCell>
    </TableRow>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default function TokenUsagePage() {
  const [data, setData] = useState<TokenUsageData | null>(null)
  const [team, setTeam] = useState<TeamMember[]>([])
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    const [tu, tm] = await Promise.all([
      fetch("/api/token-usage").then(r => r.json()),
      fetch("/api/team").then(r => r.json()),
    ])
    setData(tu)
    setTeam(tm.teamMembers ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  if (loading || !data) return <div className="px-6 py-10 text-muted-foreground text-sm">Loading token data...</div>

  const records = data.records
  const totalCost = records.reduce((s, r) => s + r.costUsd, 0)
  const totalTokensInput = records.reduce((s, r) => s + r.tokensInputK, 0)
  const totalSessions = records.reduce((s, r) => s + r.sessions, 0)
  const flagged = records.filter(r => r.complianceFlag && r.complianceFlag !== "pending_onboard").length
  const budgetPct = (totalCost / data.budgetUsd) * 100

  const departments = [...new Set(records.map(r => r.department))].sort()

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    const matchQ = !q || r.memberName.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)
    const matchD = deptFilter === "all" || r.department === deptFilter
    return matchQ && matchD
  }).sort((a, b) => b.costUsd - a.costUsd)

  return (
    <div className="px-4 md:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-6 w-6" /> Token Spend & Tools
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Billing period: {data.billingPeriod} · Budget: ${data.budgetUsd.toLocaleString()}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />Total Spend</div>
            <p className="text-2xl font-bold">{fmtCost(totalCost)}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetPct.toFixed(1)}% of budget</span>
                <span>${data.budgetUsd.toLocaleString()}</span>
              </div>
              <Progress value={budgetPct} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />Total Sessions</div>
            <p className="text-2xl font-bold">{totalSessions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{fmtK(totalTokensInput)} input tokens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Users className="h-3.5 w-3.5" />Active Staff</div>
            <p className="text-2xl font-bold">{records.filter(r => r.sessions > 0).length}</p>
            <p className="text-xs text-muted-foreground mt-1">{records.filter(r => r.complianceFlag === "pending_onboard").length} pending onboard</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-orange-500" />Review Flags</div>
            <p className="text-2xl font-bold">{flagged}</p>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="spend">
        <TabsList>
          <TabsTrigger value="spend" className="gap-1.5"><DollarSign className="h-3.5 w-3.5" />Token Spend</TabsTrigger>
          <TabsTrigger value="tools" className="gap-1.5"><Wrench className="h-3.5 w-3.5" />Tool Compliance</TabsTrigger>
        </TabsList>

        {/* Token Spend Tab */}
        <TabsContent value="spend" className="mt-4 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Tokens (in / out)</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0
                  ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8 text-sm">No records match</TableCell></TableRow>
                  : filtered.map(r => (
                      <StaffRow
                        key={r.memberId}
                        record={r}
                        member={team.find(m => m.id === r.memberId)}
                        totalBudget={data.budgetUsd}
                      />
                    ))
                }
              </TableBody>
            </Table>
          </div>

          {/* Model cost breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cost by Model</CardTitle>
              <CardDescription>Spend distribution across AI models this billing period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(["claude-3-5-sonnet", "gpt-4o", "gpt-4o-mini"] as const).map(model => {
                  const modelRecords = records.filter(r => r.model === model)
                  const modelCost = modelRecords.reduce((s, r) => s + r.costUsd, 0)
                  const modelSessions = modelRecords.reduce((s, r) => s + r.sessions, 0)
                  const pct = totalCost > 0 ? (modelCost / totalCost) * 100 : 0
                  return (
                    <div key={model}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${modelColors[model]}`}>{model}</span>
                          <span className="text-muted-foreground text-xs">{modelRecords.length} staff · {modelSessions.toLocaleString()} sessions</span>
                        </span>
                        <span className="font-medium tabular-nums">{fmtCost(modelCost)} <span className="text-muted-foreground text-xs">({pct.toFixed(0)}%)</span></span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tool Compliance Tab */}
        <TabsContent value="tools" className="mt-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Green badges</strong> = tool granted and actively used.&nbsp;
                <strong className="text-foreground">Outline badges</strong> = granted but not yet used this period.&nbsp;
                <strong className="text-foreground">⚠ suffix</strong> = tool unused despite being granted.
              </p>
            </CardContent>
          </Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Tool Status</TableHead>
                  <TableHead>Granted Tools</TableHead>
                  <TableHead>Unused This Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.sort((a, b) => a.name.localeCompare(b.name)).map(member => {
                  const usage = records.find(r => r.memberId === member.id)
                  return (
                    <ToolComplianceRow
                      key={member.id}
                      member={member}
                      usedTools={usage?.toolsUsed ?? []}
                    />
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
