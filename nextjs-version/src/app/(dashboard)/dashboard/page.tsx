import { readIntelligence, readTeamMembers } from "@/lib/mission-store"
import { MetricsOverview } from "./components/metrics-overview"
import type { MetricCard } from "./components/metrics-overview"
import { QuickActions } from "./components/quick-actions"
import { SignalActivity } from "./components/signal-activity"
import { RiskBreakdown } from "./components/risk-breakdown"
import { EscalationQueue } from "./components/escalation-queue"
import { PipelineDeals } from "./components/pipeline-deals"
import { ClientIntelligence } from "./components/client-intelligence"

export default async function OverviewPage() {
  const intel = await readIntelligence()
  const team = await readTeamMembers()

  // KPI metrics
  const openSignals = intel.signals.filter((s) => s.status !== "actioned").length
  const activeRisks = intel.riskRegister.filter((r) => r.status !== "closed").length
  const totalRevenue = intel.pipeline.reduce((sum, p) => sum + p.valueUsd, 0)
  const avgWorkload = team.length > 0
    ? Math.round(team.reduce((sum, m) => sum + m.workload, 0) / team.length)
    : 0
  const overloadedCount = team.filter((m) => m.workload > 80).length

  const metrics: MetricCard[] = [
    {
      title: "Open Signals",
      value: String(openSignals),
      description: "Active intelligence signals",
      change: openSignals > 3 ? "+High" : "Normal",
      trend: openSignals > 3 ? "up" : "stable",
      footer: openSignals > 3 ? "Action items pending" : "Signal volume normal",
      subfooter: "Signals not yet actioned",
      icon: "alert",
    },
    {
      title: "Active Risks",
      value: String(activeRisks),
      description: "Open risk register items",
      change: activeRisks > 3 ? "Elevated" : "Manageable",
      trend: activeRisks > 3 ? "up" : "down",
      footer: activeRisks > 0 ? `${activeRisks} risk(s) need attention` : "No active risks",
      subfooter: "Risks not yet closed",
      icon: "chart",
    },
    {
      title: "Pipeline Value",
      value: `$${(totalRevenue / 1_000_000).toFixed(1)}M`,
      description: "Total opportunity value",
      change: "+Active",
      trend: "up",
      footer: `${intel.pipeline.length} active deals`,
      subfooter: "Sum of all pipeline stages",
      icon: "dollar",
    },
    {
      title: "Team Utilization",
      value: `${avgWorkload}%`,
      description: "Average team workload",
      change: overloadedCount > 0 ? `${overloadedCount} overloaded` : "Balanced",
      trend: overloadedCount > 2 ? "up" : "down",
      footer: overloadedCount > 0 ? `${overloadedCount} member(s) above 80%` : "Team capacity healthy",
      subfooter: `${team.length} team members tracked`,
      icon: "users",
    },
  ]

  // Escalation queue
  const escalations = intel.signals
    .filter((s) => s.severity === "critical" || s.severity === "high")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      headline: s.headline,
      source: s.source,
      severity: s.severity,
      status: s.status,
      assignedTo: s.assignedTo ?? null,
      timestamp: s.timestamp,
    }))

  // Pipeline deals with stale calculation
  const now = Date.now()
  const pipelineDeals = intel.pipeline.map((p) => ({
    id: p.id,
    client: p.client,
    sector: p.sector,
    stage: p.stage,
    valueUsd: p.valueUsd,
    owner: p.owner || null,
    daysStale: p.lastActivity
      ? Math.floor((now - new Date(p.lastActivity).getTime()) / 86_400_000)
      : 0,
  }))

  // Risk severity breakdown
  const severities = ["critical", "high", "medium", "low"] as const
  const riskBreakdown = severities
    .map((sev) => ({
      severity: sev,
      count: intel.riskRegister.filter((r) => r.severity === sev && r.status !== "closed").length,
      label: sev.charAt(0).toUpperCase() + sev.slice(1),
    }))
    .filter((d) => d.count > 0)

  // Client intelligence — signals by sector
  const sectorMap: Record<string, { regulatory: number; threat: number; market: number }> = {}
  for (const sig of intel.signals) {
    if (!sectorMap[sig.sector]) sectorMap[sig.sector] = { regulatory: 0, threat: 0, market: 0 }
    if (sig.type === "regulatory") sectorMap[sig.sector].regulatory++
    else if (sig.type === "threat") sectorMap[sig.sector].threat++
    else sectorMap[sig.sector].market++
  }
  const sectorData = Object.entries(sectorMap).map(([sector, counts]) => ({ sector, ...counts }))

  // Fit scores
  const fitScores = intel.fitScores.map((f) => ({
    client: f.client,
    sector: f.sector,
    overallScore: f.overallFitScore,
    delta: 0,
  }))

  // Open risks for table
  const openRisks = intel.riskRegister
    .filter((r) => r.status !== "closed")
    .map((r) => ({
      id: r.id,
      title: r.title,
      severity: r.severity,
      status: r.status,
      owner: r.owner,
    }))

  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      {/* Header */}
      <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground">
            Mission Control — monitor intelligence, risks, and team performance in real-time
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Main Dashboard Grid */}
      <div className="@container/main space-y-6">
        {/* Row 1: KPI Cards */}
        <MetricsOverview metrics={metrics} />

        {/* Row 2: Charts */}
        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <SignalActivity />
          <RiskBreakdown data={riskBreakdown} />
        </div>

        {/* Row 3: Escalations + Pipeline */}
        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <EscalationQueue items={escalations} />
          <PipelineDeals deals={pipelineDeals} />
        </div>

        {/* Row 4: Client Intelligence (tabbed) */}
        <ClientIntelligence
          sectorData={sectorData}
          fitScores={fitScores}
          risks={openRisks}
        />
      </div>
    </div>
  )
}
