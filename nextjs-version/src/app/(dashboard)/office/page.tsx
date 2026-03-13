import { readTeamMembers } from "@/lib/mission-store"
import { readFileSync } from "fs"
import { join } from "path"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { OfficeRefresh } from "./office-client"

// Multiple activity strings per role — picked by hour so they rotate naturally
const ROLE_ACTIVITIES: Record<string, string[]> = {
  "Chief of Staff": [
    "Reviewing executive summaries & routing decisions",
    "Triaging cross-agent outputs for Erik Herring",
    "Preparing morning briefing — flagging 3 immediate items",
    "Processing decision override queue",
    "Coordinating strategic review scheduling",
  ],
  "Director of Strategy": [
    "Analyzing market signals and growth vectors",
    "Mapping sustainability opportunity landscape",
    "Drafting Q2 strategic alignment brief",
    "Reviewing competitor intelligence digest",
    "Scoring scenario probability distributions",
  ],
  "Decision Integrity Officer": [
    "Governance audit in progress",
    "Reconciling decision log — verifying 28 entries",
    "NERC CIP compliance cross-reference underway",
    "Reviewing override policy adherence",
    "Flagging governance anomalies for review",
  ],
  "Financial Impact Analyst": [
    "Running scenario models on pipeline",
    "Updating pipeline impact projections",
    "Budget variance analysis — 4 items escalated",
    "Preparing Q2 board financial pack",
    "Modeling risk-adjusted revenue scenarios",
  ],
  "Chief Intelligence Officer": [
    "Scanning threat feeds & regulatory shifts",
    "Cataloguing emerging energy-sector signals",
    "Publishing daily intelligence digest",
    "Cross-referencing NERC advisories with client risk",
    "Escalating 2 high-priority threat indicators",
  ],
  "Risk & Vulnerability Analyst": [
    "Scoring client vulnerability posture",
    "Updating risk register — amber flag raised",
    "Running resolution rate analysis by sector",
    "Reviewing control effectiveness metrics",
    "Preparing risk heat map for strategy team",
  ],
  "Partnership Development Director": [
    "Pipeline review & partner outreach",
    "Advancing 3 NERC-channel opportunities",
    "Drafting partnership alignment brief",
    "Following up on pending partner responses",
    "Scoring new prospect fit against ICPs",
  ],
  "Internal PM & Capacity Monitor": [
    "Capacity planning across active sprints",
    "Refreshing capacity heat map — 4 agents at 80%+",
    "Tracking cross-team dependencies",
    "Velocity tracking — 22 story points this week",
    "Surfacing sprint blockers for resolution",
  ],
  "Fit & Gap Scoring Architect": [
    "Computing 3-State Gap scores for clients",
    "Reconciling fit & gap across 7 profiles",
    "Publishing gap closure velocity report",
    "Identifying critical gaps for escalation",
    "Scoring new intake against gap framework",
  ],
  "DevOps & Data Integrity Engineer": [
    "Infrastructure health & data integrity checks",
    "ETL pipeline completed — 1,240 records ingested",
    "Resolving 2 data anomalies from nightly run",
    "Monitoring service health across 11 endpoints",
    "Verifying backup integrity — all nominal",
  ],
  "Executive Operations Coordinator": [
    "Coordinating cross-agent standups",
    "Processing 14 task handoffs between agents",
    "Assembling ops digest — 2 blockers surfaced",
    "Scheduling executive review sessions",
    "Routing completed deliverables for sign-off",
  ],
  "Junior Compliance Analyst": [
    "Reviewing NERC CIP & CMMC line items",
    "Clearing low-risk compliance items — 12 done",
    "Processing new regulatory advisories",
    "Drafting compliance gap summary report",
    "Cross-checking audit trail completeness",
  ],
}

// Pick activity based on server-side hour so it rotates naturally each hour
function pickActivity(role: string, memberIdx: number): string {
  const options = ROLE_ACTIVITIES[role] ?? ["On duty"]
  const hour = new Date().getUTCHours()
  return options[(hour + memberIdx) % options.length]
}

// Relative time from ISO string
function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "never"
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 2) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Read log entries, return last N sorted by timestamp desc
function readRecentLogs(n = 12) {
  try {
    const raw = readFileSync(join(process.cwd(), "data", "logs.json"), "utf8")
    const all = JSON.parse(raw) as { id: string; timestamp: string; level: string; message: string }[]
    return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, n)
  } catch {
    return []
  }
}

const DEPT_LABEL: Record<string, string> = {
  "Executive Office": "Executive Floor",
  "Strategy": "Strategy Wing",
  "Governance": "Governance Desk",
  "Finance": "Finance Desk",
  "Intelligence": "Intelligence Hub",
  "Risk": "Risk Operations",
  "Partnerships": "Partnership Suite",
  "Operations": "Ops Floor",
  "Analytics": "Analytics Lab",
  "Infrastructure": "Infrastructure Bay",
  "Command": "Command Center",
}

function getStatus(workload: number) {
  if (workload >= 80) return { label: "Busy", dot: "bg-amber-500", pulse: true }
  if (workload >= 50) return { label: "Active", dot: "bg-green-500", pulse: true }
  return { label: "Available", dot: "bg-slate-400", pulse: false }
}

function getWorkloadColor(workload: number) {
  if (workload >= 80) return "[&>div]:bg-amber-500"
  if (workload >= 60) return "[&>div]:bg-blue-500"
  return "[&>div]:bg-green-500"
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-lime-100 text-lime-700",
]

export default async function OfficePage() {
  const members = await readTeamMembers()
  const recentLogs = readRecentLogs(12)

  // Build a per-member "last active" map from logs mentioning their name
  const memberLastActive: Record<string, string> = {}
  for (const log of recentLogs) {
    for (const m of members) {
      const firstName = m.name.split(" ")[0]
      if (log.message.includes(m.name) || log.message.includes(`[${firstName}`)) {
        if (!memberLastActive[m.id]) memberLastActive[m.id] = log.timestamp
      }
    }
  }

  const byDept = members.reduce(
    (acc, m, i) => {
      if (!acc[m.department]) acc[m.department] = []
      acc[m.department].push({ ...m, _colorIdx: i, _memberIdx: i })
      return acc
    },
    {} as Record<string, (typeof members[number] & { _colorIdx: number; _memberIdx: number })[]>
  )

  const totalBusy = members.filter((m) => m.workload >= 80).length
  const totalActive = members.filter((m) => m.workload >= 50 && m.workload < 80).length
  const totalAvailable = members.filter((m) => m.workload < 50).length
  const avgWorkload = Math.round(members.reduce((s, m) => s + m.workload, 0) / members.length)

  return (
    <div className="space-y-8 px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Office</h1>
          <p className="text-muted-foreground">
            Live view — {members.length} agents on duty · avg workload {avgWorkload}%
          </p>
        </div>
        <OfficeRefresh />
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div>
              <p className="text-2xl font-bold">{totalBusy}</p>
              <p className="text-xs text-muted-foreground">Busy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse shrink-0" />
            <div>
              <p className="text-2xl font-bold">{totalActive}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="h-3 w-3 rounded-full bg-slate-400 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{totalAvailable}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main layout: desk cards + activity feed */}
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        {/* Departments */}
        <div className="min-w-0 flex-1 space-y-8">
          {Object.entries(byDept).map(([dept, staff]) => (
            <div key={dept}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {DEPT_LABEL[dept] ?? dept}
                </h2>
                <div className="flex-1 border-t" />
                <span className="text-xs text-muted-foreground">{staff.length} agent{staff.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {staff.map((member) => {
                  const status = getStatus(member.workload)
                  const activity = pickActivity(member.role, member._memberIdx)
                  const avatarColor = AVATAR_COLORS[member._colorIdx % AVATAR_COLORS.length]
                  const lastActive = memberLastActive[member.id]
                    ? relativeTime(memberLastActive[member.id])
                    : null

                  return (
                    <Card key={member.id} className="relative overflow-hidden transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${avatarColor}`}
                            >
                              {initials(member.name)}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${status.dot} ${
                                status.pulse ? "animate-pulse" : ""
                              }`}
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <p className="truncate font-medium text-sm">{member.name}</p>
                              <Badge
                                variant={status.label === "Busy" ? "default" : "secondary"}
                                className="shrink-0 text-xs"
                              >
                                {status.label}
                              </Badge>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{member.role}</p>
                            {lastActive && (
                              <p className="text-[10px] text-muted-foreground/60">active {lastActive}</p>
                            )}
                            <p className="mt-1 truncate text-xs italic text-muted-foreground/70">
                              {activity}
                            </p>

                            {/* Workload */}
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Workload</span>
                                <span>{member.workload}%</span>
                              </div>
                              <Progress
                                value={member.workload}
                                className={`h-1.5 ${getWorkloadColor(member.workload)}`}
                              />
                            </div>

                            {/* Tools */}
                            {member.grantedTools.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {member.grantedTools.slice(0, 2).map((tool) => (
                                  <Badge key={tool} variant="outline" className="py-0 text-[10px]">
                                    {tool}
                                  </Badge>
                                ))}
                                {member.grantedTools.length > 2 && (
                                  <Badge variant="outline" className="py-0 text-[10px]">
                                    +{member.grantedTools.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Model */}
                            {member.model && (
                              <p className="mt-1.5">
                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                  {member.model}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="w-full xl:w-80 shrink-0">
          <div className="sticky top-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Live Activity
              </h2>
            </div>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {recentLogs.length === 0 && (
                    <li className="p-4 text-xs text-muted-foreground">No recent activity</li>
                  )}
                  {recentLogs.map((log) => (
                    <li key={log.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                            log.level === "warn"
                              ? "bg-amber-400"
                              : log.level === "error"
                              ? "bg-red-500"
                              : "bg-blue-400"
                          }`}
                        />
                        <p className="flex-1 text-xs leading-snug text-foreground">
                          {log.message}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">
                          {relativeTime(log.timestamp)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

