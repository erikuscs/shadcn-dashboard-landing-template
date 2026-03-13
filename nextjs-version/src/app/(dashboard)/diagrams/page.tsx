"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { ExternalLink, GitBranch, Users, Network, Workflow, BarChart3, Shield } from "lucide-react"
import type { TeamMember, IntelligenceSignal } from "@/lib/mission-store"

// ── Static diagrams ─────────────────────────────────────────────────

const INTELLIGENCE_FLOW = `flowchart TD
    A([🌐 External Sources]) --> B[Signal Intake]
    B --> C{Classify Signal}
    C -->|Regulatory| D[Regulatory Queue]
    C -->|Threat| E[Threat Queue]
    C -->|Market| F[Market Queue]
    D & E & F --> G[Intelligence Review\nAnika Rahman]
    G --> H{Severity?}
    H -->|Critical/High| I[🔴 Escalation Queue\nChloe O'Brian]
    H -->|Medium/Low| J[📋 Risk Register]
    I --> K[Erik Herring\nDecision Required]
    K --> L[Decision Logged]
    J --> M[Assign Owner]
    M --> N[Remediation Plan]
    N --> O{Resolved?}
    O -->|Yes| P[✅ Closed]
    O -->|No| Q[Monitor & Review]
    Q --> N
    L --> R[Update Pipeline / Client Record]
    style A fill:#f0f7f4,stroke:#0d5c3a
    style I fill:#fee2e2,stroke:#dc2626
    style K fill:#fef3c7,stroke:#d97706
    style P fill:#dcfce7,stroke:#16a34a`

const ENGAGEMENT_PROCESS = `flowchart LR
    A([🎯 Prospect Identified]) --> B[CRM — Fit Score]
    B --> C{Score ≥ 60?}
    C -->|No| D[Monitor / Nurture]
    C -->|Yes| E[Outreach\nChloe O'Brian]
    E --> F[Discovery Call]
    F --> G[Site Assessment\nElias Romero]
    G --> H[Gap Analysis Report]
    H --> I[Proposal\nElias Romero]
    I --> J{Approved?}
    J -->|No| K[Revise / Archive]
    J -->|Yes| L[Contract Signed]
    L --> M[Engagement Active\nChloe / Anika]
    M --> N[90-Day Hardening]
    N --> O[Deliverables]
    O --> P{Extension?}
    P -->|Yes| M
    P -->|No| Q[✅ Outcome Logged]
    Q --> R[Reference / Retainer]
    style A fill:#f0f7f4,stroke:#0d5c3a
    style L fill:#dcfce7,stroke:#16a34a
    style Q fill:#dbeafe,stroke:#2563eb`

const DATACENTER_WAVE = `flowchart TD
    A([📈 Datacenter Wave\nPattern Detected]) --> B[Market Signal\nAnalysis]
    B --> C[Identify Target Sites]
    C --> D[Regulatory Mapping\nFedRAMP · SOC2 · NIST]
    D --> E[CRM Outreach]
    E --> F{Decision Maker\nIdentified?}
    F -->|No| G[LinkedIn Research\nChloe O'Brian]
    G --> F
    F -->|Yes| H[Engagement Pathway]
    H --> I[Physical Security\nAssessment]
    H --> J[Cyber-Physical\nConvergence Audit]
    H --> K[Compliance Readiness\nGap Report]
    I & J & K --> L[Integrated\nDeliverables Package]
    L --> M[$25M TAM\nOpportunity]
    M --> N[Repeat Pattern\nAcross Portfolio]
    style A fill:#fef3c7,stroke:#d97706,color:#92400e
    style M fill:#dcfce7,stroke:#16a34a
    style N fill:#f0f7f4,stroke:#0d5c3a`

const RISK_TAXONOMY = `mindmap
  root((SG Risk\nFramework))
    Regulatory
      NERC CIP-014
        Physical Security
        OT Segmentation
      OSHA PSM
        Emergency Response
        Process Safety
      CFATS
        Chemical Facility
        Tier Classification
      TSA SD
        Pipeline Security
        Access Control
    Threat
      OT/ICS
        SCADA Exposure
        IT-OT Convergence
      Physical
        Perimeter Gaps
        Access Control
      Supply Chain
        Vendor Risk
        Third-Party Access
    Market
      Datacenter Wave
        Edge Sites
        Colocation
      Leadership Change
        New CISO
        Board Mandate
      Regulatory Lag
        Enforcement Gap
        Compliance Window`

const TECH_STACK = `flowchart TD
    subgraph Client["🖥️ Client — iPhone / Browser"]
        A[Next.js 15\nApp Router]
    end
    subgraph Platform["☁️ Azure App Service B1"]
        B[Node.js Server\nstandalone bundle]
        C[API Routes\n/api/*]
        D[JSON Data Store\n/data/*.json]
    end
    subgraph Integrations["🔗 Integrations"]
        E[Microsoft Graph\nMail.Send]
        F[Telegram Bot API\nAlerts]
        G[SG Pipeline\nDaemon PID]
    end
    subgraph Identity["🔐 Azure AD"]
        H[App Registration\nChloe O'Brian]
    end
    A -->|HTTPS| B
    B --> C
    C --> D
    G -->|cron loop| E
    G -->|alerts| F
    H -->|client_credentials| E
    C -->|reads/writes| D
    style Client fill:#f0f7f4,stroke:#0d5c3a
    style Platform fill:#dbeafe,stroke:#2563eb
    style Integrations fill:#fef3c7,stroke:#d97706
    style Identity fill:#fee2e2,stroke:#dc2626`

// ── Dynamic org chart from team data ───────────────────────────────
function buildOrgChart(members: TeamMember[]): string {
  const lines: string[] = ["flowchart TD"]

  // Add Erik as root
  lines.push('    Erik(["👤 Erik Herring\nFounder & CEO"])')

  // Style map
  const workloadStyle = (m: TeamMember) => {
    if (m.status === "new_hire") return "fill:#dbeafe,stroke:#2563eb"
    if (m.workload >= 90) return "fill:#fee2e2,stroke:#dc2626"
    if (m.workload >= 80) return "fill:#fef3c7,stroke:#d97706"
    return "fill:#f0f7f4,stroke:#0d5c3a"
  }

  // Build nodes
  for (const m of members) {
    const nodeId = m.id.replace("-", "_")
    const emoji = m.status === "new_hire" ? "🆕" : m.workload >= 90 ? "🔴" : m.workload >= 80 ? "🟡" : "🟢"
    const label = `"${emoji} ${m.name}\n${m.role}\n${m.status === "new_hire" ? `Starts ${m.startDate?.slice(0, 10)}` : m.workload + "% load"}"`
    lines.push(`    ${nodeId}[${label}]`)
  }

  // Build edges
  for (const m of members) {
    const nodeId = m.id.replace("-", "_")
    const parentName = m.manager

    if (parentName === "Erik Herring") {
      lines.push(`    Erik --> ${nodeId}`)
    } else {
      const parent = members.find(p => p.name === parentName)
      if (parent) {
        const parentId = parent.id.replace("-", "_")
        lines.push(`    ${parentId} --> ${nodeId}`)
      }
    }
  }

  // Styles
  lines.push("    style Erik fill:#0d5c3a,color:#fff,stroke:#0a4a2e")
  for (const m of members) {
    const nodeId = m.id.replace("-", "_")
    lines.push(`    style ${nodeId} ${workloadStyle(m)}`)
  }

  return lines.join("\n")
}

// ── Pipeline flow from live data ───────────────────────────────────
function buildPipelineFlow(pipeline: Array<{ id: string; client: string; stage: string; valueUsd: number; sector: string }>): string {
  const stages = ["prospect", "qualified", "proposal", "engaged", "retained"]
  const byStage: Record<string, typeof pipeline> = {}
  for (const s of stages) byStage[s] = []
  for (const p of pipeline) {
    const s = p.stage?.toLowerCase() ?? "prospect"
    if (byStage[s]) byStage[s].push(p)
  }

  const stageEmoji: Record<string, string> = {
    prospect: "🔍", qualified: "✅", proposal: "📄", engaged: "🤝", retained: "⭐"
  }

  const lines = ["flowchart LR"]
  for (const stage of stages) {
    const items = byStage[stage]
    const emoji = stageEmoji[stage]
    const total = items.reduce((s, p) => s + p.valueUsd, 0)
    const nodeId = `stage_${stage}`
    lines.push(`    ${nodeId}(["${emoji} ${stage.charAt(0).toUpperCase() + stage.slice(1)}\n${items.length} deals\n$${(total / 1000).toFixed(0)}K"])`)
  }
  // Connect stages in order
  for (let i = 0; i < stages.length - 1; i++) {
    lines.push(`    stage_${stages[i]} --> stage_${stages[i + 1]}`)
  }
  // Add client sub-nodes for each stage
  for (const stage of stages) {
    for (const p of byStage[stage]) {
      const clientId = `client_${p.id.replace("-", "_")}`
      lines.push(`    ${clientId}["${p.client}\n$${(p.valueUsd / 1000).toFixed(0)}K"]`)
      lines.push(`    stage_${stage} -.-> ${clientId}`)
    }
  }
  lines.push("    style stage_retained fill:#dcfce7,stroke:#16a34a")
  lines.push("    style stage_prospect fill:#f1f5f9,stroke:#94a3b8")
  lines.push("    style stage_qualified fill:#dbeafe,stroke:#2563eb")
  lines.push("    style stage_proposal fill:#fef3c7,stroke:#d97706")
  lines.push("    style stage_engaged fill:#f0f7f4,stroke:#0d5c3a")
  return lines.join("\n")
}

// ── Page ─────────────────────────────────────────────────────────
export default function DiagramsPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [pipeline, setPipeline] = useState<Array<{ id: string; client: string; stage: string; valueUsd: number; sector: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/team").then(r => r.json()),
      fetch("/api/intelligence").then(r => r.json()),
    ]).then(([teamData, intelData]) => {
      setTeam(teamData.teamMembers ?? teamData.members ?? teamData ?? [])
      setPipeline(intelData.pipeline ?? [])
      setLoading(false)
    })
  }, [])

  const orgChart = team.length > 0 ? buildOrgChart(team) : ""
  const pipelineFlow = pipeline.length > 0 ? buildPipelineFlow(pipeline) : ""

  const newHires = team.filter(m => m.status === "new_hire").length
  const overloaded = team.filter(m => m.workload >= 80 && m.status !== "new_hire").length

  return (
    <div className="px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GitBranch className="h-6 w-6" /> Diagrams
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live system diagrams — org chart, process flows, pipeline, and architecture
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open("https://mermaid.live", "_blank", "noopener,noreferrer")}>
          <ExternalLink className="h-3.5 w-3.5" />
          Open in Mermaid.ai
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />Normal load</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />High load (80%+)</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />Critical load (90%+)</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" />New hire</span>
        {overloaded > 0 && <Badge variant="destructive" className="text-xs">{overloaded} overloaded</Badge>}
        {newHires > 0 && <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">{newHires} new hires onboarding</Badge>}
      </div>

      <Tabs defaultValue="org">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="org" className="gap-1.5"><Users className="h-3.5 w-3.5" />Org Chart</TabsTrigger>
          <TabsTrigger value="intel" className="gap-1.5"><Workflow className="h-3.5 w-3.5" />Intelligence Flow</TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5"><Network className="h-3.5 w-3.5" />Engagement Process</TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Pipeline Flow</TabsTrigger>
          <TabsTrigger value="datacenter" className="gap-1.5"><Shield className="h-3.5 w-3.5" />Datacenter Wave</TabsTrigger>
          <TabsTrigger value="risk" className="gap-1.5">Risk Taxonomy</TabsTrigger>
          <TabsTrigger value="stack" className="gap-1.5">Tech Stack</TabsTrigger>
        </TabsList>

        {/* Org Chart */}
        <TabsContent value="org" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" />Organizational Chart</CardTitle>
              <CardDescription>Live team hierarchy — generated from current team data. Node color = workload status.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading
                ? <div className="h-40 flex items-center justify-center text-muted-foreground text-sm animate-pulse">Loading team data...</div>
                : <MermaidDiagram chart={orgChart} />
              }
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intelligence Flow */}
        <TabsContent value="intel" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Workflow className="h-4 w-4" />Intelligence Signal Flow</CardTitle>
              <CardDescription>How external signals are classified, escalated, and resolved through Mission Control.</CardDescription>
            </CardHeader>
            <CardContent>
              <MermaidDiagram chart={INTELLIGENCE_FLOW} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Process */}
        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Network className="h-4 w-4" />Client Engagement Process</CardTitle>
              <CardDescription>End-to-end journey from prospect identification through contract signature and delivery.</CardDescription>
            </CardHeader>
            <CardContent>
              <MermaidDiagram chart={ENGAGEMENT_PROCESS} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Flow */}
        <TabsContent value="pipeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Live Pipeline Flow</CardTitle>
              <CardDescription>Current pipeline deals organized by stage — generated from live intelligence data.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading
                ? <div className="h-40 flex items-center justify-center text-muted-foreground text-sm animate-pulse">Loading pipeline data...</div>
                : pipeline.length > 0
                  ? <MermaidDiagram chart={pipelineFlow} />
                  : <p className="text-sm text-muted-foreground text-center py-8">No pipeline data available</p>
              }
            </CardContent>
          </Card>
        </TabsContent>

        {/* Datacenter Wave */}
        <TabsContent value="datacenter" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" />Datacenter Wave Strategy</CardTitle>
              <CardDescription>Strategic playbook for capturing the $25M datacenter security opportunity pattern.</CardDescription>
            </CardHeader>
            <CardContent>
              <MermaidDiagram chart={DATACENTER_WAVE} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Taxonomy */}
        <TabsContent value="risk" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Taxonomy — Mind Map</CardTitle>
              <CardDescription>Full classification of risk types and regulatory frameworks across the SG engagement portfolio.</CardDescription>
            </CardHeader>
            <CardContent>
              <MermaidDiagram chart={RISK_TAXONOMY} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tech Stack */}
        <TabsContent value="stack" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Architecture</CardTitle>
              <CardDescription>Mission Control infrastructure — Next.js on Azure, SG pipeline, M365 Graph, and Telegram integrations.</CardDescription>
            </CardHeader>
            <CardContent>
              <MermaidDiagram chart={TECH_STACK} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mermaid.ai link */}
      <Card className="border-dashed">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Edit & export in Mermaid.ai</p>
            <p className="text-xs text-muted-foreground mt-0.5">Copy any diagram source, paste into mermaid.live or mermaid.ai to edit, share, or export as PNG/SVG. Your Plus plan gives you private diagram storage and AI-assisted generation.</p>
          </div>
          <Button variant="outline" className="shrink-0 gap-1.5" onClick={() => window.open("https://mermaid.ai", "_blank", "noopener,noreferrer")}>
            <ExternalLink className="h-3.5 w-3.5" />
            mermaid.ai
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
