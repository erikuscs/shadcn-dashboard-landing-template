"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, MapPin, AlertTriangle, ArrowUpIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export type FitScoreArea = {
  area: string
  score: number
  target: number
  state: string
}

export type FitScoreRow = {
  client: string
  sector: string
  overallScore: number
  delta: number
  areas?: FitScoreArea[]
}

export type RiskRow = {
  id: string
  title: string
  severity: "critical" | "high" | "medium" | "low"
  status: string
  owner: string
}

export type SignalSectorData = {
  sector: string
  regulatory: number
  threat: number
  market: number
}

const chartConfig = {
  regulatory: { label: "Regulatory", color: "var(--chart-1)" },
  threat: { label: "Threat", color: "var(--chart-2)" },
  market: { label: "Market", color: "var(--chart-3)" },
}

const severityColor: Record<string, string> = {
  critical: "text-red-600",
  high: "text-orange-600",
  medium: "text-amber-600",
  low: "text-green-600",
}

const statusVariant: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
  open: "destructive",
  in_progress: "secondary",
  closed: "outline",
}

export function ClientIntelligence({
  sectorData,
  fitScores,
  risks,
}: {
  sectorData: SignalSectorData[]
  fitScores: FitScoreRow[]
  risks: RiskRow[]
}) {
  const [activeTab, setActiveTab] = useState("signals")
  const router = useRouter()

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Client Intelligence</CardTitle>
        <CardDescription>Signals by sector, client fit scores, and open risks</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg h-12">
            <TabsTrigger
              value="signals"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Signals</span>
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger
              value="risks"
              className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Risks</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Signals by Sector */}
          <TabsContent value="signals" className="mt-8 space-y-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-10 gap-6">
                <div className="col-span-10 xl:col-span-7">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6">Signals by Sector</h3>
                  <ChartContainer config={chartConfig} className="h-93.75 w-full">
                    <BarChart data={sectorData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="sector" className="text-xs" tick={{ fontSize: 12 }} tickLine={{ stroke: "var(--border)" }} axisLine={{ stroke: "var(--border)" }} />
                      <YAxis className="text-xs" tick={{ fontSize: 12 }} tickLine={{ stroke: "var(--border)" }} axisLine={{ stroke: "var(--border)" }} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="regulatory" fill="var(--color-regulatory)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="threat" fill="var(--color-threat)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="market" fill="var(--color-market)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <div className="col-span-10 xl:col-span-3 space-y-5">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6">Key Metrics</h3>
                  <div className="grid grid-cols-3 gap-5">
                    {[
                      { label: "Total Signals", value: sectorData.reduce((s, d) => s + d.regulatory + d.threat + d.market, 0), note: "All tracked sectors", icon: TrendingUp },
                      { label: "Sectors Covered", value: sectorData.length, note: "Active intelligence areas", icon: MapPin },
                      { label: "Action Required", value: risks.filter((r) => r.status === "open").length, note: "Open risk items", icon: AlertTriangle },
                    ].map(({ label, value, note, icon: Icon }) => (
                      <div key={label} className="p-4 rounded-lg max-lg:col-span-3 xl:col-span-3 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <div className="text-2xl font-bold">{value}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <ArrowUpIcon className="h-3 w-3" />
                          {note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Client Fit Scores */}
          <TabsContent value="clients" className="mt-8">
            {fitScores.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No client fit scores available.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {fitScores.map((row, i) => {
                  const scoreColor = row.overallScore >= 70 ? "var(--chart-2)" : row.overallScore >= 50 ? "var(--chart-3)" : "var(--chart-1)"
                  const radialData = [{ value: row.overallScore, fill: scoreColor }]
                  return (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{row.client}</CardTitle>
                          <Badge variant="outline">{row.sector}</Badge>
                        </div>
                        <CardDescription>Overall Fit Score</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-6">
                          {/* Radial gauge */}
                          <div className="relative shrink-0">
                            <ChartContainer config={{ value: { label: "Score", color: scoreColor } }} className="h-30 w-30">
                              <RadialBarChart data={radialData} innerRadius={35} outerRadius={55} startAngle={90} endAngle={-270} barSize={14}>
                                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                <RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={8} />
                              </RadialBarChart>
                            </ChartContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold tabular-nums">{row.overallScore}</span>
                            </div>
                          </div>
                          {/* Area breakdown */}
                          {row.areas && row.areas.length > 0 ? (
                            <div className="flex-1 space-y-2 min-w-0">
                              {row.areas.map((area) => (
                                <div key={area.area} className="space-y-0.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground truncate">{area.area}</span>
                                    <span className="font-medium shrink-0 ml-2">{area.score}/{area.target}</span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{ width: `${Math.round((area.score / area.target) * 100)}%`, backgroundColor: scoreColor }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex-1">
                              <Progress value={row.overallScore} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{row.overallScore}/100</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => router.push("/intelligence")}>
                View Full Intelligence →
              </Button>
            </div>
          </TabsContent>

          {/* Tab: Risk Register */}
          <TabsContent value="risks" className="mt-8">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="py-5 px-6 font-semibold">Risk</TableHead>
                    <TableHead className="py-5 px-6 font-semibold">Severity</TableHead>
                    <TableHead className="py-5 px-6 font-semibold">Status</TableHead>
                    <TableHead className="py-5 px-6 font-semibold">Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium py-5 px-6 max-w-xs">
                        <span className="line-clamp-2">{row.title}</span>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <span className={`text-sm font-semibold capitalize ${severityColor[row.severity]}`}>{row.severity}</span>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <Badge variant={statusVariant[row.status] ?? "outline"} className="capitalize">
                          {row.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5 px-6 text-muted-foreground">{row.owner}</TableCell>
                    </TableRow>
                  ))}
                  {risks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No open risks.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => router.push("/intelligence")}>
                Manage Risks →
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
