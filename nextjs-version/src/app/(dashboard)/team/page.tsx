"use client"

import { useEffect, useState, useMemo } from "react"
import type { TeamMember } from "@/lib/mission-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Search, AlertTriangle, Users, ShieldAlert } from "lucide-react"

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function avatarColor(name: string): string {
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-teal-500", "bg-red-500", "bg-indigo-500"]
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function workloadBg(pct: number): string {
  if (pct >= 90) return "bg-red-500"
  if (pct >= 75) return "bg-amber-500"
  return "bg-green-500"
}

function workloadText(pct: number): string {
  if (pct >= 90) return "text-red-600"
  if (pct >= 75) return "text-amber-600"
  return "text-green-600"
}

const chartConfig = {
  workload: { label: "Workload %", color: "var(--chart-1)" },
}

export default function TeamPageClient() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dept, setDept] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "workload">("workload")

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => setMembers(Array.isArray(d) ? d : Array.isArray(d?.teamMembers) ? d.teamMembers : []))
      .finally(() => setLoading(false))
  }, [])

  const departments = useMemo(() => [...new Set(members.map((m) => m.department))], [members])

  const filtered = useMemo(() => {
    return members
      .filter((m) => {
        const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase())
        const matchDept = dept === "all" || m.department === dept
        return matchSearch && matchDept
      })
      .sort((a, b) => sortBy === "workload" ? b.workload - a.workload : a.name.localeCompare(b.name))
  }, [members, search, dept, sortBy])

  const overloaded = members.filter((m) => m.workload >= 80)
  const avgWorkload = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.workload, 0) / members.length) : 0

  const accessGaps = useMemo(() => members.map((m) => {
    const missing = m.requiredTools.filter((t) => !m.grantedTools.includes(t))
    return { member: m, missing }
  }).filter((g) => g.missing.length > 0), [members])

  if (loading) return <div className="px-6 py-12 text-muted-foreground flex items-center gap-2"><div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" /> Loading team…</div>

  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">{members.length} team members across {departments.length} departments</p>
      </div>

      {/* Stat chips */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Members", value: members.length, sub: `${departments.length} departments`, icon: Users, color: "text-blue-600" },
          { label: "Avg Workload", value: `${avgWorkload}%`, sub: avgWorkload > 80 ? "Above healthy threshold" : "Within healthy range", icon: AlertTriangle, color: avgWorkload > 80 ? "text-red-600" : "text-green-600" },
          { label: "Access Gaps", value: accessGaps.length, sub: accessGaps.length > 0 ? "Members missing tools" : "All tools assigned", icon: ShieldAlert, color: accessGaps.length > 0 ? "text-amber-600" : "text-green-600" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="flex flex-row items-center gap-4 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Workload chart */}
      <Card>
        <CardHeader>
          <CardTitle>Team Workload</CardTitle>
          <CardDescription>Workload percentage per team member — red line at 80% capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={[...members].sort((a, b) => b.workload - a.workload)} margin={{ top: 10, right: 10, left: 0, bottom: 60 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={130} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`${v}%`, "Workload"]} />} />
              <ReferenceLine x={80} stroke="var(--destructive)" strokeDasharray="4 4" strokeWidth={1.5} />
              <Bar dataKey="workload" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {[...members].sort((a, b) => b.workload - a.workload).map((m) => (
                  <Cell key={m.id} fill={m.workload >= 90 ? "var(--chart-1)" : m.workload >= 75 ? "var(--chart-3)" : "var(--chart-2)"} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search team…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "name" | "workload")}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="workload">Sort: Workload</SelectItem>
            <SelectItem value="name">Sort: Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Roster */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => {
          const missing = m.requiredTools.filter((t) => !m.grantedTools.includes(t))
          return (
            <Card key={m.id} className={m.workload >= 90 ? "border-red-200 dark:border-red-900" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={`${avatarColor(m.name)} text-white text-sm font-semibold`}>
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <span className={`text-sm font-bold tabular-nums shrink-0 ${workloadText(m.workload)}`}>{m.workload}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{m.department}</Badge>
                      {m.workload >= 80 && <Badge variant="secondary" className="text-xs text-amber-700 bg-amber-100">High load</Badge>}
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${workloadBg(m.workload)}`} style={{ width: `${m.workload}%` }} />
                      </div>
                    </div>
                    {missing.length > 0 && (
                      <p className="text-xs text-amber-600 mt-1.5">⚠ Missing: {missing.join(", ")}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tool access gaps */}
      {accessGaps.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Tool Access Gaps ({accessGaps.length})
            </CardTitle>
            <CardDescription>Team members missing required tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accessGaps.map(({ member, missing }) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50 gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className={`${avatarColor(member.name)} text-white text-xs font-semibold`}>{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{member.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {missing.map((t) => <Badge key={t} variant="secondary" className="text-xs text-amber-700 bg-amber-100">{t}</Badge>)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
