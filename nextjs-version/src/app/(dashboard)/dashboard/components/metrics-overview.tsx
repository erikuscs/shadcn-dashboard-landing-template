"use client"

import { TrendingUp, TrendingDown, AlertTriangle, Users, BarChart3, DollarSign } from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type MetricCard = {
  title: string
  value: string
  description: string
  change: string
  trend: "up" | "down" | "stable"
  footer: string
  subfooter: string
  icon: "alert" | "users" | "chart" | "dollar"
}

const iconMap = {
  alert: AlertTriangle,
  users: Users,
  chart: BarChart3,
  dollar: DollarSign,
}

export function MetricsOverview({ metrics }: { metrics: MetricCard[] }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : TrendingUp
        const Icon = iconMap[metric.icon]
        return (
          <Card key={metric.title} className="cursor-pointer">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {metric.title}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon className="h-4 w-4" />
                  {metric.change}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {metric.footer} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                {metric.subfooter}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
