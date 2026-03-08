"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Representative signal activity data (monthly trend)
const signalData = [
  { month: "Sep", regulatory: 2, threat: 1, market: 1 },
  { month: "Oct", regulatory: 3, threat: 2, market: 2 },
  { month: "Nov", regulatory: 2, threat: 3, market: 1 },
  { month: "Dec", regulatory: 4, threat: 2, market: 3 },
  { month: "Jan", regulatory: 3, threat: 4, market: 2 },
  { month: "Feb", regulatory: 5, threat: 3, market: 4 },
  { month: "Mar", regulatory: 6, threat: 4, market: 3 },
]

const chartConfig = {
  regulatory: { label: "Regulatory", color: "var(--chart-1)" },
  threat: { label: "Threat", color: "var(--chart-2)" },
  market: { label: "Market", color: "var(--chart-3)" },
}

export function SignalActivity() {
  const [timeRange, setTimeRange] = useState("6m")
  const router = useRouter()
  const filtered = timeRange === "3m" ? signalData.slice(-3) : timeRange === "6m" ? signalData.slice(-6) : signalData

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Signal Activity</CardTitle>
          <CardDescription>Intelligence signals by type over time</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m" className="cursor-pointer">Last 3 months</SelectItem>
              <SelectItem value="6m" className="cursor-pointer">Last 6 months</SelectItem>
              <SelectItem value="7m" className="cursor-pointer">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="cursor-pointer" onClick={() => router.push("/intelligence")}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="px-6 pb-6">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart data={filtered} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-regulatory)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-regulatory)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-threat)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-threat)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-market)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-market)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} className="text-xs" tick={{ fontSize: 12 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="regulatory" stroke="var(--color-regulatory)" fill="url(#colorReg)" strokeWidth={2} />
              <Area type="monotone" dataKey="threat" stroke="var(--color-threat)" fill="url(#colorThreat)" strokeWidth={2} />
              <Area type="monotone" dataKey="market" stroke="var(--color-market)" fill="url(#colorMarket)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
