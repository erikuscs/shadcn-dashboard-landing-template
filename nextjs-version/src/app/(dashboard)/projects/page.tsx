import { readRoadmap } from "@/lib/mission-store"
import type { RoadmapMilestone } from "@/lib/mission-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type KanbanItem = {
  task: string
  owner: string
  engagement: string
  phase: string
  week: number
}

const statusConfig = {
  complete: { label: "Done", col: "done" },
  "in-progress": { label: "In Progress", col: "inprogress" },
  pending: { label: "Todo", col: "todo" },
} as const

const colStyles: Record<string, string> = {
  todo: "border-t-2 border-t-muted",
  inprogress: "border-t-2 border-t-blue-500",
  done: "border-t-2 border-t-green-500",
}

export default async function ProjectsPage() {
  const roadmap = await readRoadmap()

  const columns: Record<"todo" | "inprogress" | "done", KanbanItem[]> = {
    todo: [],
    inprogress: [],
    done: [],
  }

  for (const engagement of roadmap.engagements) {
    for (const phase of engagement.phases) {
      for (const m of phase.milestones as RoadmapMilestone[]) {
        const config = statusConfig[m.status]
        const col = config?.col ?? "todo"
        columns[col as "todo" | "inprogress" | "done"].push({
          task: m.task,
          owner: m.owner,
          engagement: engagement.client,
          phase: phase.label,
          week: m.week,
        })
      }
    }
  }

  const colDefs: { key: "todo" | "inprogress" | "done"; label: string }[] = [
    { key: "todo", label: "Todo" },
    { key: "inprogress", label: "In Progress" },
    { key: "done", label: "Done" },
  ]

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Milestone board across all engagements</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {colDefs.map(({ key, label }) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm">{label}</h2>
              <Badge variant="outline">{columns[key].length}</Badge>
            </div>
            <div className={`rounded-lg bg-muted/40 p-3 min-h-48 space-y-2 ${colStyles[key]}`}>
              {columns[key].map((item, i) => (
                <Card key={i} className="shadow-none">
                  <CardContent className="p-3 space-y-1">
                    <p className="text-sm font-medium leading-snug">{item.task}</p>
                    <p className="text-xs text-muted-foreground">{item.engagement}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.phase}</span>
                      <span className="text-xs text-muted-foreground">Wk {item.week} · {item.owner}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {columns[key].length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Nothing here</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
