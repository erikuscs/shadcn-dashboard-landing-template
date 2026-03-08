"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export type RiskSeverityData = {
  severity: string
  count: number
  label: string
}

const chartConfig = {
  risk: { label: "Risks" },
  count: { label: "Count" },
  critical: { label: "Critical", color: "var(--chart-1)" },
  high: { label: "High", color: "var(--chart-2)" },
  medium: { label: "Medium", color: "var(--chart-3)" },
  low: { label: "Low", color: "var(--chart-4)" },
}

export function RiskBreakdown({ data }: { data: RiskSeverityData[] }) {
  const id = "risk-breakdown"
  const router = useRouter()
  const chartData = data.map((d) => ({
    ...d,
    fill: `var(--color-${d.severity})`,
  }))

  const [activeSeverity, setActiveSeverity] = React.useState(chartData[0]?.severity ?? "critical")

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.severity === activeSeverity),
    [activeSeverity, chartData]
  )

  const total = React.useMemo(() => chartData.reduce((sum, d) => sum + d.count, 0), [chartData])

  return (
    <Card data-chart={id} className="flex flex-col cursor-pointer">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
        <div>
          <CardTitle>Risk Register</CardTitle>
          <CardDescription>Open risks by severity level</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={activeSeverity} onValueChange={setActiveSeverity}>
            <SelectTrigger className="w-[150px] rounded-lg cursor-pointer" aria-label="Select severity">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-lg">
              {chartData.map((item) => (
                <SelectItem key={item.severity} value={item.severity} className="rounded-md [&_span]:flex cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: `var(--color-${item.severity})` }} />
                    {item.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="cursor-pointer" onClick={() => router.push("/intelligence")}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="flex justify-center">
            <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="severity"
                  innerRadius={60}
                  strokeWidth={5}
                  activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 10} />
                      <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                    </g>
                  )}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">{total}</tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-sm">open risks</tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            {chartData.map((item, index) => {
              const isActive = index === activeIndex
              return (
                <div
                  key={item.severity}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${isActive ? "bg-muted" : "hover:bg-muted/50"}`}
                  onClick={() => setActiveSeverity(item.severity)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: `var(--color-${item.severity})` }} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.count}</div>
                    <div className="text-sm text-muted-foreground">{total > 0 ? Math.round((item.count / total) * 100) : 0}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
