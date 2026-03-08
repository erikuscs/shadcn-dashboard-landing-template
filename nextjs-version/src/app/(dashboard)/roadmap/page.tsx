import { readRoadmap } from "@/lib/mission-store"
import type { RoadmapPhase, RoadmapMilestone } from "@/lib/mission-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const statusColors: Record<string, string> = {
  complete: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  pending: "bg-muted text-muted-foreground",
}

function phaseCompletion(phase: RoadmapPhase): number {
  if (phase.milestones.length === 0) return 0
  const done = phase.milestones.filter((m: RoadmapMilestone) => m.status === "complete").length
  return Math.round((done / phase.milestones.length) * 100)
}

export default async function RoadmapPage() {
  const roadmap = await readRoadmap()

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roadmap</h1>
        <p className="text-muted-foreground">
          {roadmap.owner} · {roadmap.ownerRole}
        </p>
      </div>

      {roadmap.engagements.map((engagement) => (
        <div key={engagement.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{engagement.client}</h2>
            <Badge variant="outline" className="capitalize">{engagement.status}</Badge>
            <span className="text-sm text-muted-foreground">{engagement.sector}</span>
          </div>

          {/* KPIs */}
          {engagement.kpis.length > 0 && (
            <div className="flex gap-4 flex-wrap">
              {engagement.kpis.map((kpi, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{kpi.value}</span>{" "}
                  <span className="text-muted-foreground">{kpi.unit}</span>{" "}
                  <span className="text-muted-foreground">— {kpi.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Phases */}
          <div className="relative space-y-4">
            {engagement.phases.map((phase: RoadmapPhase) => {
              const pct = phaseCompletion(phase)
              return (
                <Card key={phase.phase}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">
                          Phase {phase.phase}: {phase.label}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Days {phase.days}</p>
                      </div>
                      <div className="flex items-center gap-2 min-w-32">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {phase.milestones.map((m: RoadmapMilestone, mi: number) => (
                        <div key={mi} className="flex items-start gap-3">
                          <span className="text-xs text-muted-foreground w-12 shrink-0 pt-0.5">
                            Wk {m.week}
                          </span>
                          <p className="text-sm flex-1">{m.task}</p>
                          <span className="text-xs text-muted-foreground shrink-0">{m.owner}</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize shrink-0 ${statusColors[m.status] ?? ""}`}
                          >
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
