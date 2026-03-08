import { readTools } from "@/lib/mission-store"
import type { MissionTool, ToolState } from "@/lib/mission-store"
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

const stateVariant: Record<ToolState, "default" | "secondary" | "outline"> = {
  Live: "default",
  Beta: "secondary",
  Draft: "outline",
}

export default async function ToolsPage() {
  const tools = await readTools()

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tools</h1>
        <p className="text-muted-foreground">{tools.length} configured tools</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Last Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((t: MissionTool) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      {t.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{t.notes}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stateVariant[t.state]}>{t.state}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{t.owner}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{t.trigger}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.lastRunAt
                      ? new Date(t.lastRunAt).toLocaleDateString()
                      : "Never"}
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
