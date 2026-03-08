"use client"

import { useEffect, useState } from "react"
import type { IntelligenceData, IntelligenceSignal, RiskEntry, PipelineEntry } from "@/lib/mission-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronRight } from "lucide-react"

const signalTypeBadge: Record<string, string> = {
  regulatory: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  threat: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  leadership_change: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  growth: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  market: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
}

const severityVariant: Record<string, "destructive" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

function SignalRow({ signal }: { signal: IntelligenceSignal }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setOpen((o) => !o)}
      >
        <TableCell>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </TableCell>
        <TableCell>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${signalTypeBadge[signal.type] ?? ""}`}
          >
            {signal.type.replace("_", " ")}
          </span>
        </TableCell>
        <TableCell className="max-w-xs">
          <p className="text-sm font-medium line-clamp-2">{signal.headline}</p>
          <p className="text-xs text-muted-foreground">{signal.source}</p>
        </TableCell>
        <TableCell>
          <Badge variant={severityVariant[signal.severity] ?? "outline"}>{signal.severity}</Badge>
        </TableCell>
        <TableCell>
          {signal.assignedTo ? (
            <span className="text-sm">{signal.assignedTo}</span>
          ) : (
            <span className="text-xs text-amber-600 font-medium">Unassigned</span>
          )}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize">
            {signal.status}
          </Badge>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 px-6 py-3">
            <div className="space-y-2">
              {signal.notes && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Notes: </span>
                  {signal.notes}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline">Mark Reviewed</Button>
                <Button size="sm" variant="outline">Mark Actioned</Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function IntelligencePage() {
  const [data, setData] = useState<IntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/intelligence")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="px-4 lg:px-6 py-8 text-muted-foreground">Loading intelligence…</div>
    )
  }

  if (!data) {
    return (
      <div className="px-4 lg:px-6 py-8 text-destructive">Failed to load intelligence data.</div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Intelligence</h1>
        <p className="text-muted-foreground">Signals, risks, and pipeline overview</p>
      </div>

      {/* Signals */}
      <Card>
        <CardHeader>
          <CardTitle>Signals ({data.signals.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Type</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.signals.map((s) => (
                <SignalRow key={s.id} signal={s} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Risk Register */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Register ({data.riskRegister.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.riskRegister.map((r: RiskEntry) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium max-w-xs">
                    <p className="line-clamp-2 text-sm">{r.title}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityVariant[r.severity] ?? "outline"}>{r.severity}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.client}</TableCell>
                  <TableCell className="text-sm">{r.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {r.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.owner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline ({data.pipeline.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Value (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pipeline.map((p: PipelineEntry) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.client}</TableCell>
                  <TableCell>{p.sector}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{p.stage}</Badge>
                  </TableCell>
                  <TableCell>{p.owner}</TableCell>
                  <TableCell className="text-right">
                    ${p.valueUsd.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
