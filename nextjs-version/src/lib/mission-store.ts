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
  status?: string;
  startDate?: string;
  hireReason?: string;
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

// ── New extended types ────────────────────────────────────────────────────────

export type ClientContact = {
  name: string;
  title: string;
  email: string;
};

export type Client = {
  id: string;
  name: string;
  sector: string;
  type: string;
  status: "active" | "prospect" | "upcoming" | "engaged" | "churned";
  engagementId: string | null;
  primaryContact: ClientContact;
  contractValueUsd: number;
  contractStart: string | null;
  contractEnd: string | null;
  healthScore: number;
  lastTouchpoint: string;
  openRisks: number;
  openSignals: number;
  fitScore: number;
  notes: string;
  owner: string;
  tags: string[];
};

export type Decision = {
  id: string;
  timestamp: string;
  decidedBy: string;
  category: "client" | "team" | "market" | "operations" | "strategy";
  title: string;
  context: string;
  decision: string;
  outcome: "pending" | "actioned" | "reversed" | "failed";
  outcomeNotes: string;
  linkedRiskId: string | null;
  linkedClientId: string | null;
  linkedSignalId: string | null;
};

export type Opportunity = {
  id: string;
  name: string;
  sector: string;
  type: "regulatory" | "market" | "emerging" | "service_expansion";
  source: string;
  description: string;
  estimatedAddressableUsd: number;
  estimatedEngagementsInRange: number;
  status: "idea" | "researching" | "qualified" | "horizon";
  priority: "medium" | "high" | "critical" | "strategic";
  owner: string;
  identifiedAt: string;
  targetActionDate: string;
  linkedClientIds: string[];
  notes: string;
};

export type InfraGap = {
  id: string;
  area: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  linkedRiskId: string | null;
  remediationOwner: string;
  targetCloseDate: string;
};

export type InfrastructureSite = {
  id: string;
  name: string;
  clientId: string | null;
  sector: string;
  type: "generation" | "manufacturing" | "datacenter" | "distribution" | "office";
  address: string;
  capacityMW: number | null;
  regulatoryScope: string[];
  assessmentStatus: "prospect" | "scheduled" | "in_progress" | "complete";
  assessmentPhase: string | null;
  lastAssessedAt: string | null;
  nextReviewAt: string | null;
  owner: string;
  criticalGaps: InfraGap[];
  infrastructureNotes: string;
  powerRedundancy: string;
  connectivityType: string;
  coolingType: string;
  staffOnSite: number;
};

export type Pattern = {
  id: string;
  name: string;
  status: "emerging" | "confirmed" | "horizon" | "resolved";
  firstObservedAt: string;
  lastUpdatedAt: string;
  strength: "low" | "medium" | "high" | "critical" | "strategic";
  description: string;
  evidenceSources: string[];
  implication: string;
  recommendedAction: string;
  owner: string;
  linkedOpportunityId: string | null;
};

export type Deliverable = {
  id: string;
  title: string;
  status: "not_started" | "in_progress" | "delayed" | "complete";
  owner: string;
  dueAt: string;
};

export type EngagementOutcome = {
  id: string;
  clientId: string;
  clientName: string;
  engagementId: string | null;
  closedAt: string | null;
  status: "in_progress" | "complete" | "at_risk";
  deliverables: Deliverable[];
  baselineScores: Record<string, number>;
  targetScores: Record<string, number>;
  finalScores: Record<string, number> | null;
  measuredImpact: string | null;
  clientSatisfaction: number | null;
  referralGenerated: boolean;
  lessonsLearned: string[];
};

const dataDir = path.join(process.cwd(), "data");
const toolsPath = path.join(dataDir, "tools.json");
const logsPath = path.join(dataDir, "logs.json");
const suggestionsPath = path.join(dataDir, "suggestions.json");
const teamPath = path.join(dataDir, "team-members.json");
const benchmarksPath = path.join(dataDir, "benchmarks.json");
const intelligencePath = path.join(dataDir, "intelligence.json");
const roadmapPath = path.join(dataDir, "roadmap.json");
const clientsPath = path.join(dataDir, "clients.json");
const decisionsPath = path.join(dataDir, "decisions.json");
const opportunitiesPath = path.join(dataDir, "opportunities.json");
const infrastructurePath = path.join(dataDir, "infrastructure.json");
const patternsPath = path.join(dataDir, "patterns.json");
const outcomesPath = path.join(dataDir, "outcomes.json");

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

// ── New dataset accessors ─────────────────────────────────────────────────────

export async function readClients() {
  await ensureFile(clientsPath, '{"updatedAt":"","clients":[]}\n');
  const raw = await fs.readFile(clientsPath, "utf8");
  return JSON.parse(raw) as { updatedAt: string; clients: Client[] };
}

export async function writeClients(data: { updatedAt: string; clients: Client[] }) {
  await fs.writeFile(clientsPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readDecisions() {
  await ensureFile(decisionsPath, '{"updatedAt":"","decisions":[]}\n');
  const raw = await fs.readFile(decisionsPath, "utf8");
  return JSON.parse(raw) as { updatedAt: string; decisions: Decision[] };
}

export async function writeDecisions(data: { updatedAt: string; decisions: Decision[] }) {
  await fs.writeFile(decisionsPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readOpportunities() {
  await ensureFile(opportunitiesPath, '{"updatedAt":"","opportunities":[]}\n');
  const raw = await fs.readFile(opportunitiesPath, "utf8");
  return JSON.parse(raw) as { updatedAt: string; opportunities: Opportunity[] };
}

export async function writeOpportunities(data: { updatedAt: string; opportunities: Opportunity[] }) {
  await fs.writeFile(opportunitiesPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readInfrastructure() {
  await ensureFile(infrastructurePath, '{"updatedAt":"","sites":[]}\n');
  const raw = await fs.readFile(infrastructurePath, "utf8");
  return JSON.parse(raw) as { updatedAt: string; sites: InfrastructureSite[] };
}

export async function writeInfrastructure(data: { updatedAt: string; sites: InfrastructureSite[] }) {
  await fs.writeFile(infrastructurePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readPatterns() {
  await ensureFile(patternsPath, '{"updatedAt":"","patterns":[]}\n');
  const raw = await fs.readFile(patternsPath, "utf8");
  return JSON.parse(raw) as { updatedAt: string; patterns: Pattern[] };
}

export async function writePatterns(data: { updatedAt: string; patterns: Pattern[] }) {
  await fs.writeFile(patternsPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readOutcomes() {
  await ensureFile(outcomesPath, '{"updatedAt":"","outcomes":[]}\n');
  const raw = await fs.readFile(outcomesPath, "utf8");
  return JSON.parse(raw) as { updatedAt: string; outcomes: EngagementOutcome[] };
}

export async function writeOutcomes(data: { updatedAt: string; outcomes: EngagementOutcome[] }) {
  await fs.writeFile(outcomesPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

// ── CRM Types ──────────────────────────────────────────────────────
export type CrmCompanyStatus = "identified" | "researched" | "contacted" | "qualified" | "converted" | "disqualified"

export type CrmCompany = {
  id: string
  name: string
  website: string
  sector: string
  marketSegment: string
  employees: number
  annualRevenueUsd: number
  trailingSecuritySpendUsd: number
  hq: string
  regulatoryExposure: string[]
  status: CrmCompanyStatus
  fitScore: number
  source: string
  sourceKeywords: string[]
  notes: string
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  tags: string[]
}

export type CrmContactStatus = "identified" | "researched" | "contacted" | "qualified" | "converted"
export type CrmInfluenceLevel = "low" | "medium" | "high" | "decision"
export type CrmRoleType = "technical" | "executive" | "financial" | "champion" | "blocker"

export type CrmContact = {
  id: string
  companyId: string
  name: string
  title: string
  email: string | null
  phone: string | null
  linkedin: string | null
  roleType: CrmRoleType
  isDecisionMaker: boolean
  influenceLevel: CrmInfluenceLevel
  lastContactDate: string | null
  notes: string
  status: CrmContactStatus
  createdAt: string
}

// ── CRM Paths ──────────────────────────────────────────────────────
const crmCompaniesPath = path.join(dataDir, "crm-companies.json")
const crmContactsPath = path.join(dataDir, "crm-contacts.json")

// ── CRM Read/Write ─────────────────────────────────────────────────
export async function readCrmCompanies() {
  await ensureFile(crmCompaniesPath, '{"updatedAt":"","companies":[]}\n')
  const raw = await fs.readFile(crmCompaniesPath, "utf8")
  return JSON.parse(raw) as { updatedAt: string; companies: CrmCompany[] }
}

export async function writeCrmCompanies(data: { updatedAt: string; companies: CrmCompany[] }) {
  await fs.writeFile(crmCompaniesPath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

export async function readCrmContacts() {
  await ensureFile(crmContactsPath, '{"updatedAt":"","contacts":[]}\n')
  const raw = await fs.readFile(crmContactsPath, "utf8")
  return JSON.parse(raw) as { updatedAt: string; contacts: CrmContact[] }
}

export async function writeCrmContacts(data: { updatedAt: string; contacts: CrmContact[] }) {
  await fs.writeFile(crmContactsPath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

// ── Token Usage Types ──────────────────────────────────────────────
export type TokenUsageRecord = {
  memberId: string
  memberName: string
  department: string
  model: string
  tokensInputK: number
  tokensOutputK: number
  costUsd: number
  sessions: number
  avgSessionTokens: number
  primaryUseCase: string
  toolsUsed: string[]
  complianceFlag: string | null
  lastActivity: string | null
}

export type TokenUsageData = {
  updatedAt: string
  billingPeriod: string
  budgetUsd: number
  records: TokenUsageRecord[]
}

// ── Token Usage Path ───────────────────────────────────────────────
const tokenUsagePath = path.join(dataDir, "token-usage.json")

// ── Token Usage Read/Write ─────────────────────────────────────────
export async function readTokenUsage() {
  await ensureFile(tokenUsagePath, '{"updatedAt":"","billingPeriod":"","budgetUsd":0,"records":[]}\n')
  const raw = await fs.readFile(tokenUsagePath, "utf8")
  return JSON.parse(raw) as TokenUsageData
}

export async function writeTokenUsage(data: TokenUsageData) {
  await fs.writeFile(tokenUsagePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

// ── Ava Chat ───────────────────────────────────────────────────────
export type AvaChatMessage = {
  id: string
  timestamp: string
  from: "user" | "ava"
  text: string
  status?: "pending" | "complete" | "error"
}

const avaChatPath = path.join(dataDir, "ava-chat.json")

export async function readAvaChat() {
  await ensureFile(avaChatPath, "[]\n")
  const raw = await fs.readFile(avaChatPath, "utf8")
  return JSON.parse(raw) as AvaChatMessage[]
}

export async function writeAvaChat(messages: AvaChatMessage[]) {
  await fs.writeFile(avaChatPath, `${JSON.stringify(messages, null, 2)}\n`, "utf8")
}

export function createAvaChatMessage(
  from: AvaChatMessage["from"],
  text: string,
  status?: AvaChatMessage["status"],
): AvaChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    from,
    text,
    status,
  }
}
