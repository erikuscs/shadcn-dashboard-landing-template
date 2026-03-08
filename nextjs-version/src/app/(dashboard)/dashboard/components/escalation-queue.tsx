"use client"

import { Eye, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export type EscalationItem = {
  id: string
  headline: string
  source: string
  severity: "critical" | "high" | "medium" | "low"
  status: string
  assignedTo: string | null
  timestamp: string
}

const severityVariant: Record<string, "destructive" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

export function EscalationQueue({ items }: { items: EscalationItem[] }) {
  const router = useRouter()
  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Escalation Queue</CardTitle>
          <CardDescription>High-priority signals requiring action</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => router.push("/intelligence")}>
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No active escalations.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex p-3 rounded-lg border gap-3">
            <div className="flex flex-col items-center justify-start pt-0.5 gap-1 shrink-0">
              <Badge variant={severityVariant[item.severity] ?? "outline"} className="text-xs capitalize">
                {item.severity}
              </Badge>
            </div>
            <div className="flex flex-1 items-start flex-wrap justify-between gap-1 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug line-clamp-2">{item.headline}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.source} · {new Date(item.timestamp).toLocaleDateString()}
                </p>
                {!item.assignedTo && (
                  <p className="text-xs text-amber-600 font-medium mt-0.5">⚠ Unassigned</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs capitalize">{item.status}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/intelligence")}>
                      View in Intelligence
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/team")}>
                      Assign to Team Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
