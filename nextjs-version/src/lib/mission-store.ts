import { promises as fs } from "node:fs";
import path from "node:path";

export type ToolState = "Live" | "Beta" | "Draft";
export type ToolTrigger = "manual" | "webhook" | "schedule";

export type MissionTool = {
  id: string;
  name: string;
  owner: string;
  state: ToolState;
  trigger: ToolTrigger;
  notes: string;
  createdAt: string;
  lastRunAt: string | null;
};

export type MissionLog = {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
};

export type MissionSuggestion = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  prompt?: string;
  category?: string;
  status?: "pending" | "actioned" | "dismissed";
};

export type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  manager: string;
  workload: number;
  requiredTools: string[];
  grantedTools: string[];
};

export type BenchmarkKpi = {
  id: string;
  label: string;
  description: string;
  owner: string;
  ownerKey: string;
  current: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  trendDelta: number;
  period: string;
  thresholds: { warn: number; critical: number };
};

export type AdjustmentRule = {
  kpiId: string;
  condition: "above" | "below";
  threshold: number;
  severity: "warn" | "critical";
  action: string;
};

export type IntelligenceSignal = {
  id: string;
  timestamp: string;
  source: string;
  sector: string;
  type: "regulatory" | "threat" | "leadership_change" | "growth" | "market";
  headline: string;
  severity: "critical" | "high" | "medium" | "low";
  actionable: boolean;
  status: "new" | "reviewed" | "actioned" | "monitored";
  assignedTo: string | null;
  notes: string;
};

export type FitScoreArea = {
  area: string;
  state: "beginning" | "current" | "desired";
  score: number;
  target: number;
};

export type FitScore = {
  engagementId: string;
  client: string;
  sector: string;
  scoreDate: string;
  overallFitScore: number;
  areas: FitScoreArea[];
};

export type RiskEntry = {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  client: string;
  openedAt: string;
  targetCloseDate: string;
  status: "open" | "in_progress" | "closed";
  owner: string;
  mitigationPlan: string;
};

export type PipelineEntry = {
  id: string;
  client: string;
  sector: string;
  stage: "prospect" | "qualified" | "proposal" | "engaged" | "retained";
  valueUsd: number;
  enteredAt: string;
  lastActivity: string;
  owner: string;
  notes: string;
};

export type IntelligenceData = {
  signals: IntelligenceSignal[];
  fitScores: FitScore[];
  riskRegister: RiskEntry[];
  pipeline: PipelineEntry[];
  updatedAt: string;
};

export type RoadmapMilestone = {
  week: number;
  task: string;
  owner: string;
  status: "complete" | "in-progress" | "pending";
};

export type RoadmapPhase = {
  phase: number;
  label: string;
  days: string;
  milestones: RoadmapMilestone[];
};

export type RoadmapKpi = {
  label: string;
  value: number;
  unit: string;
};

export type RoadmapEngagement = {
  id: string;
  client: string;
  sector: string;
  contractType: string;
  startDate: string;
  status: "active" | "upcoming" | "complete";
  phases: RoadmapPhase[];
  kpis: RoadmapKpi[];
};

export type RoadmapData = {
  updatedAt: string;
  owner: string;
  ownerRole: string;
  engagements: RoadmapEngagement[];
};

const dataDir = path.join(process.cwd(), "data");
const toolsPath = path.join(dataDir, "tools.json");
const logsPath = path.join(dataDir, "logs.json");
const suggestionsPath = path.join(dataDir, "suggestions.json");
const teamPath = path.join(dataDir, "team-members.json");
const benchmarksPath = path.join(dataDir, "benchmarks.json");
const intelligencePath = path.join(dataDir, "intelligence.json");
const roadmapPath = path.join(dataDir, "roadmap.json");

async function ensureFile(filePath: string, initial: string) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, initial, "utf8");
  }
}

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function readTools() {
  await ensureFile(toolsPath, "[]\n");
  const raw = await fs.readFile(toolsPath, "utf8");
  return JSON.parse(raw) as MissionTool[];
}

export async function writeTools(tools: MissionTool[]) {
  await fs.writeFile(toolsPath, `${JSON.stringify(tools, null, 2)}\n`, "utf8");
}

export async function readLogs() {
  await ensureFile(logsPath, "[]\n");
  const raw = await fs.readFile(logsPath, "utf8");
  return JSON.parse(raw) as MissionLog[];
}

export async function writeLogs(logs: MissionLog[]) {
  await fs.writeFile(logsPath, `${JSON.stringify(logs, null, 2)}\n`, "utf8");
}

export async function readSuggestions() {
  await ensureFile(suggestionsPath, "[]\n");
  const raw = await fs.readFile(suggestionsPath, "utf8");
  return JSON.parse(raw) as MissionSuggestion[];
}

export async function writeSuggestions(suggestions: MissionSuggestion[]) {
  await fs.writeFile(suggestionsPath, `${JSON.stringify(suggestions, null, 2)}\n`, "utf8");
}

export async function readTeamMembers() {
  await ensureFile(teamPath, "[]\n");
  const raw = await fs.readFile(teamPath, "utf8");
  return JSON.parse(raw) as TeamMember[];
}

export async function writeTeamMembers(teamMembers: TeamMember[]) {
  await fs.writeFile(teamPath, `${JSON.stringify(teamMembers, null, 2)}\n`, "utf8");
}

export function createToolId(name: string) {
  return `${safeSlug(name)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createLog(level: MissionLog["level"], message: string): MissionLog {
  return {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level,
    message,
  };
}

export async function readBenchmarks() {
  await ensureFile(benchmarksPath, '{"kpis":[],"adjustmentRules":[],"updatedAt":""}\n');
  const raw = await fs.readFile(benchmarksPath, "utf8");
  return JSON.parse(raw) as { kpis: BenchmarkKpi[]; adjustmentRules: AdjustmentRule[]; updatedAt: string };
}

export async function writeBenchmarks(data: { kpis: BenchmarkKpi[]; adjustmentRules: AdjustmentRule[]; updatedAt: string }) {
  await fs.writeFile(benchmarksPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readIntelligence() {
  await ensureFile(intelligencePath, '{"signals":[],"fitScores":[],"riskRegister":[],"pipeline":[],"updatedAt":""}\n');
  const raw = await fs.readFile(intelligencePath, "utf8");
  return JSON.parse(raw) as IntelligenceData;
}

export async function writeIntelligence(data: IntelligenceData) {
  await fs.writeFile(intelligencePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readRoadmap() {
  await ensureFile(roadmapPath, '{"updatedAt":"","owner":"","ownerRole":"","engagements":[]}\n');
  const raw = await fs.readFile(roadmapPath, "utf8");
  return JSON.parse(raw) as RoadmapData;
}

export function createSuggestion(author: string, message: string, prompt = "", category = "other"): MissionSuggestion {
  return {
    id: `sug-${Date.now()}`,
    author: author.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
    prompt,
    category,
    status: "pending",
  };
}

export function createTeamMember(input: Omit<TeamMember, "id">): TeamMember {
  return {
    id: `tm-${Date.now()}`,
    ...input,
  };
}
