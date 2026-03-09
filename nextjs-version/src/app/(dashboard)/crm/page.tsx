"use client"

import { useEffect, useState } from "react"
import type { CrmCompany, CrmContact, CrmCompanyStatus } from "@/lib/mission-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2, Users, DollarSign, Search, Plus,
  ExternalLink, MoreHorizontal, ChevronRight, ChevronDown,
  Target, Globe, Lightbulb
} from "lucide-react"

// ── Helpers ────────────────────────────────────────────────────────
const statusColors: Record<CrmCompanyStatus, string> = {
  identified: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  researched: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  converted: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  disqualified: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

const influenceColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-purple-100 text-purple-700",
  decision: "bg-orange-100 text-orange-700",
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function fmtK(n: number) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

// ── Search button component ────────────────────────────────────────
function SearchButton({ keywords, label }: { keywords: string[]; label?: string }) {
  const query = keywords.join(" ")
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1 text-xs"
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
    >
      <Search className="h-3 w-3" />
      {label ?? "Search"}
    </Button>
  )
}

// ── Inject Finding Dialog ──────────────────────────────────────────
function InjectFindingDialog({ companyId, companyName, onSaved }: {
  companyId: string
  companyName: string
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ headline: "", source: "", notes: "", severity: "medium", type: "market" })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const payload = {
      id: `sig-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: form.source || `Manual research — ${companyName}`,
      sector: "General",
      type: form.type,
      headline: form.headline,
      severity: form.severity,
      actionable: true,
      status: "new",
      assignedTo: null,
      notes: form.notes,
      linkedCompanyId: companyId,
    }
    await fetch("/api/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    await fetch("/api/crm/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: companyId, status: "researched" }),
    })
    setSaving(false)
    setOpen(false)
    setForm({ headline: "", source: "", notes: "", severity: "medium", type: "market" })
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="h-7 gap-1 text-xs">
          <Lightbulb className="h-3 w-3" />
          Inject Finding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Inject Research Finding</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">Add intelligence from your research on <strong>{companyName}</strong> to the signal database for team assignment.</p>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Headline / Finding</Label>
            <Input className="mt-1" placeholder="What did you discover?" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="threat">Threat</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="leadership_change">Leadership Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Source / URL</Label>
            <Input className="mt-1" placeholder="Website, article, LinkedIn, etc." value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
          </div>
          <div>
            <Label>Notes / Context</Label>
            <Textarea className="mt-1" rows={3} placeholder="Detail your finding..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <Button className="w-full" onClick={save} disabled={saving || !form.headline}>
            {saving ? "Saving..." : "Inject into Intelligence Feed"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Add Company Dialog ─────────────────────────────────────────────
function AddCompanyDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "", website: "", sector: "", marketSegment: "", hq: "",
    employees: "", annualRevenueUsd: "", trailingSecuritySpendUsd: "",
    regulatoryExposure: "", sourceKeywords: "", notes: "", status: "identified",
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await fetch("/api/crm/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        employees: parseInt(form.employees) || 0,
        annualRevenueUsd: parseFloat(form.annualRevenueUsd) || 0,
        trailingSecuritySpendUsd: parseFloat(form.trailingSecuritySpendUsd) || 0,
        regulatoryExposure: form.regulatoryExposure.split(",").map(s => s.trim()).filter(Boolean),
        sourceKeywords: form.sourceKeywords.split(",").map(s => s.trim()).filter(Boolean),
        fitScore: 0,
        source: "Manual entry",
        assignedTo: null,
        tags: [],
      }),
    })
    setSaving(false)
    setOpen(false)
    setForm({ name: "", website: "", sector: "", marketSegment: "", hq: "", employees: "", annualRevenueUsd: "", trailingSecuritySpendUsd: "", regulatoryExposure: "", sourceKeywords: "", notes: "", status: "identified" })
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add Company</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Company to CRM</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="col-span-2">
            <Label>Company Name *</Label>
            <Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Website</Label>
            <Input className="mt-1" placeholder="https://" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </div>
          <div>
            <Label>Headquarters</Label>
            <Input className="mt-1" placeholder="City, State" value={form.hq} onChange={e => setForm(f => ({ ...f, hq: e.target.value }))} />
          </div>
          <div>
            <Label>Sector</Label>
            <Input className="mt-1" placeholder="Energy, Manufacturing..." value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} />
          </div>
          <div>
            <Label>Market Segment</Label>
            <Input className="mt-1" placeholder="e.g. Utility / ICS" value={form.marketSegment} onChange={e => setForm(f => ({ ...f, marketSegment: e.target.value }))} />
          </div>
          <div>
            <Label>Employees</Label>
            <Input className="mt-1" type="number" value={form.employees} onChange={e => setForm(f => ({ ...f, employees: e.target.value }))} />
          </div>
          <div>
            <Label>Annual Revenue (USD)</Label>
            <Input className="mt-1" type="number" value={form.annualRevenueUsd} onChange={e => setForm(f => ({ ...f, annualRevenueUsd: e.target.value }))} />
          </div>
          <div>
            <Label>Trailing Security Spend (USD)</Label>
            <Input className="mt-1" type="number" value={form.trailingSecuritySpendUsd} onChange={e => setForm(f => ({ ...f, trailingSecuritySpendUsd: e.target.value }))} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="identified">Identified</SelectItem>
                <SelectItem value="researched">Researched</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Regulatory Exposure (comma-separated)</Label>
            <Input className="mt-1" placeholder="NERC-CIP, OSHA PSM, CFATS..." value={form.regulatoryExposure} onChange={e => setForm(f => ({ ...f, regulatoryExposure: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <Label>Search Keywords (comma-separated)</Label>
            <Input className="mt-1" placeholder="Keywords for internet research on this company" value={form.sourceKeywords} onChange={e => setForm(f => ({ ...f, sourceKeywords: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea className="mt-1" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <Button className="w-full" onClick={save} disabled={saving || !form.name}>
              {saving ? "Saving..." : "Add to CRM"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Company row with expand ────────────────────────────────────────
function CompanyRow({ company, contacts, onUpdate, onRefresh }: {
  company: CrmCompany
  contacts: CrmContact[]
  onUpdate: () => void
  onRefresh: () => void
}) {
  const [open, setOpen] = useState(false)
  const compContacts = contacts.filter(c => c.companyId === company.id)

  const updateStatus = async (status: string) => {
    await fetch("/api/crm/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: company.id, status }),
    })
    onUpdate()
  }

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setOpen(o => !o)}>
        <TableCell className="w-8 pr-0">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </TableCell>
        <TableCell>
          <p className="text-sm font-medium">{company.name}</p>
          <p className="text-xs text-muted-foreground">{company.hq}</p>
        </TableCell>
        <TableCell className="text-sm">{company.sector}</TableCell>
        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">{company.marketSegment}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <div className={`h-2 rounded-full ${company.fitScore >= 80 ? "bg-green-500" : company.fitScore >= 60 ? "bg-yellow-500" : "bg-slate-400"}`} style={{ width: `${Math.max(8, company.fitScore)}px` }} />
            <span className="text-sm font-medium">{company.fitScore}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[company.status]}`}>{company.status}</span>
        </TableCell>
        <TableCell className="text-sm">{fmt(company.annualRevenueUsd)}</TableCell>
        <TableCell className="text-sm">{fmt(company.trailingSecuritySpendUsd)}</TableCell>
        <TableCell onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateStatus("researched")}>Mark Researched</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("contacted")}>Mark Contacted</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("qualified")}>Mark Qualified</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("converted")}>Mark Converted</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("disqualified")}>Disqualify</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={9} className="bg-muted/30 p-0">
            <div className="p-4 space-y-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Globe className="h-3 w-3" />{company.website}
                      </a>
                    )}
                    {company.regulatoryExposure.map(r => (
                      <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{company.notes}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <SearchButton keywords={company.sourceKeywords.length ? company.sourceKeywords : [company.name + " security"]} />
                  <SearchButton keywords={[company.name + " CISO security leadership LinkedIn"]} label="Search Contacts" />
                  <InjectFindingDialog companyId={company.id} companyName={company.name} onSaved={onRefresh} />
                </div>
              </div>

              {/* Financial row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Annual Revenue</p>
                  <p className="text-lg font-semibold">{fmt(company.annualRevenueUsd)}</p>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Trailing Security Spend</p>
                  <p className="text-lg font-semibold">{fmt(company.trailingSecuritySpendUsd)}</p>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Employees</p>
                  <p className="text-lg font-semibold">{fmtK(company.employees)}</p>
                </div>
              </div>

              {/* Contacts */}
              {compContacts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Stakeholders & Decision Makers</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {compContacts.map(contact => (
                      <div key={contact.id} className="flex items-start justify-between rounded-md border bg-background p-3 gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{contact.name}</span>
                            {contact.isDecisionMaker && (
                              <Badge className="text-[10px] h-4 px-1 bg-orange-100 text-orange-700 hover:bg-orange-100">Decision Maker</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{contact.title}</p>
                          {contact.email && <p className="text-xs text-blue-600 mt-0.5">{contact.email}</p>}
                          {contact.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{contact.notes}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${influenceColors[contact.influenceLevel]}`}>{contact.influenceLevel}</span>
                          {contact.linkedin && (
                            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><ExternalLink className="h-3 w-3" /></Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {company.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {company.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function CrmPage() {
  const [companies, setCompanies] = useState<CrmCompany[]>([])
  const [contacts, setContacts] = useState<CrmContact[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    const [co, ct] = await Promise.all([
      fetch("/api/crm/companies").then(r => r.json()),
      fetch("/api/crm/contacts").then(r => r.json()),
    ])
    setCompanies(co.companies ?? [])
    setContacts(ct.contacts ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const sectors = [...new Set(companies.map(c => c.sector))].sort()

  const filtered = companies.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.marketSegment.toLowerCase().includes(q) || c.hq.toLowerCase().includes(q)
    const matchStatus = statusFilter === "all" || c.status === statusFilter
    const matchSector = sectorFilter === "all" || c.sector === sectorFilter
    return matchSearch && matchStatus && matchSector
  })

  const totalTAM = companies.reduce((s, c) => s + c.trailingSecuritySpendUsd, 0)
  const qualified = companies.filter(c => ["qualified", "converted"].includes(c.status)).length
  const decisionMakers = contacts.filter(c => c.isDecisionMaker).length

  if (loading) return <div className="px-6 py-10 text-muted-foreground text-sm">Loading CRM...</div>

  return (
    <div className="px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6" /> CRM
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Prospect companies, stakeholders, and market intelligence</p>
        </div>
        <AddCompanyDialog onSaved={fetchAll} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Building2 className="h-3.5 w-3.5" />Total Prospects</div>
            <p className="text-2xl font-bold">{companies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Target className="h-3.5 w-3.5" />Qualified</div>
            <p className="text-2xl font-bold">{qualified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><DollarSign className="h-3.5 w-3.5" />Total Trailing Spend TAM</div>
            <p className="text-2xl font-bold">{fmt(totalTAM)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Users className="h-3.5 w-3.5" />Decision Makers Mapped</div>
            <p className="text-2xl font-bold">{decisionMakers}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
          <TabsTrigger value="contacts">Stakeholders ({contacts.length})</TabsTrigger>
        </TabsList>

        {/* Companies tab */}
        <TabsContent value="companies" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="identified">Identified</SelectItem>
                <SelectItem value="researched">Researched</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="disqualified">Disqualified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Sector" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Company</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Market Segment</TableHead>
                  <TableHead>Fit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Security Spend</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8 text-sm">No companies match your filters</TableCell>
                  </TableRow>
                ) : (
                  filtered.map(company => (
                    <CompanyRow
                      key={company.id}
                      company={company}
                      contacts={contacts}
                      onUpdate={fetchAll}
                      onRefresh={fetchAll}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Contacts/Stakeholders tab */}
        <TabsContent value="contacts" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Role Type</TableHead>
                  <TableHead>Influence</TableHead>
                  <TableHead>Decision Maker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map(contact => {
                  const company = companies.find(c => c.id === contact.companyId)
                  return (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{contact.name}</p>
                          {contact.email && <p className="text-xs text-muted-foreground">{contact.email}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{company?.name ?? contact.companyId}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contact.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">{contact.roleType}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${influenceColors[contact.influenceLevel]}`}>
                          {contact.influenceLevel}
                        </span>
                      </TableCell>
                      <TableCell>
                        {contact.isDecisionMaker
                          ? <Badge className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-100">✓ Yes</Badge>
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[contact.status as CrmCompanyStatus]}`}>{contact.status}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {contact.lastContactDate ? new Date(contact.lastContactDate).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
