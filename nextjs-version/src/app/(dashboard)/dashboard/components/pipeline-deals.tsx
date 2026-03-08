"use client"

import { Eye, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

export type PipelineDeal = {
  id: string
  client: string
  sector: string
  stage: string
  valueUsd: number
  owner: string | null
  daysStale: number
}

const stageOrder: Record<string, number> = {
  prospect: 20,
  qualified: 35,
  discovery: 40,
  proposal: 60,
  engaged: 70,
  negotiation: 80,
  retained: 95,
  closed: 100,
}

export function PipelineDeals({ deals }: { deals: PipelineDeal[] }) {
  const router = useRouter()
  const maxValue = Math.max(...deals.map((d) => d.valueUsd), 1)

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Pipeline Deals</CardTitle>
          <CardDescription>Active client opportunities</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => router.push("/intelligence")}>
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {deals.map((deal, index) => {
          const stageProgress = stageOrder[deal.stage] ?? 50
          const isStale = deal.daysStale > 14
          return (
            <div key={deal.id} className={`flex items-center p-3 rounded-lg border gap-3 ${isStale ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20" : ""}`}>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                #{index + 1}
              </div>
              <div className="flex gap-2 items-center justify-between flex-1 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{deal.client}</p>
                    <Badge variant="outline" className="text-xs capitalize">{deal.sector}</Badge>
                    {isStale && <Badge variant="secondary" className="text-xs text-amber-700 bg-amber-100">Stale {deal.daysStale}d</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground capitalize">{deal.stage}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{deal.owner ?? "Unassigned"}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">${(deal.valueUsd / 1000).toFixed(0)}k</p>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stageProgress}%
                    </Badge>
                  </div>
                  <Progress value={stageProgress} className="w-20 h-1.5" />
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
