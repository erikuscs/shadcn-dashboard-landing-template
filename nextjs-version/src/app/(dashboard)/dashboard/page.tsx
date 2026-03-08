import { readIntelligence, readTeamMembers } from "@/lib/mission-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"

export default async function OverviewPage() {
  const intel = await readIntelligence()
  const team = await readTeamMembers()

  const totalClients = intel.pipeline.length
  const totalRevenue = intel.pipeline.reduce((sum, p) => sum + p.valueUsd, 0)
  const avgFitScore =
    intel.fitScores.length > 0
      ? Math.round(
          intel.fitScores.reduce((sum, f) => sum + f.overallFitScore, 0) /
            intel.fitScores.length
        )
      : 0
  const openRisks = intel.riskRegister.filter((r) => r.status !== "closed").length

  const escalations = intel.signals
    .filter((s) => s.severity === "critical" || s.severity === "high")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  const severityColor: Record<string, string> = {
    critical: "destructive",
    high: "destructive",
    medium: "secondary",
    low: "outline",
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Mission Control — Sustainable Gaps</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Portfolio</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Active pipeline clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 1_000_000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Sum of pipeline value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Net Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFitScore}</div>
            <p className="text-xs text-muted-foreground">Average client fit score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRisks}</div>
            <p className="text-xs text-muted-foreground">Open risk register items</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Escalations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Escalations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {escalations.map((s) => (
                <div key={s.id} className="flex items-start gap-3">
                  <Badge variant={severityColor[s.severity] as "destructive" | "secondary" | "outline"}>
                    {s.severity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-2">{s.headline}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.source} · {new Date(s.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {escalations.length === 0 && (
                <p className="text-sm text-muted-foreground">No active escalations.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Health Table */}
        <Card>
          <CardHeader>
            <CardTitle>Client Health</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intel.pipeline.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.client}</TableCell>
                    <TableCell>{p.sector}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {p.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${(p.valueUsd / 1000).toFixed(0)}k
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
