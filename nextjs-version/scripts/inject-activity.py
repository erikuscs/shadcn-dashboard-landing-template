#!/usr/bin/env python3
"""
inject-activity.py — Backfill realistic agent activity for March 8–12, 2026.
Writes new log entries into data/logs.json.
Updates lastRunAt on all Live tools in data/tools.json.
Nudges workload values in data/team-members.json to seem current.

Run from the nextjs-version/ directory:
  python3 scripts/inject-activity.py
"""

import json, random, time, hashlib
from datetime import datetime, timezone, timedelta
from pathlib import Path

DATA = Path(__file__).parent.parent / "data"
random.seed(42)  # reproducible — change to time.time() for random each run

# ── Agent log templates ───────────────────────────────────────────────────────
# Each entry: (agent_name, message_template)
LOG_TEMPLATES = [
    ("Ava Sterling",         "Executive filter processed {n} briefings — {k} flagged for immediate review"),
    ("Ava Sterling",         "Cross-agent standup summary distributed to Erik Herring"),
    ("Ava Sterling",         "Decision override count updated: {n} manual overrides this week"),
    ("Lyra Chen",            "Market signal scan complete — {n} new sustainability vectors identified"),
    ("Lyra Chen",            "Strategic roadmap alignment check: Q2 milestones on track"),
    ("Lyra Chen",            "Competitor intelligence brief prepared for executive review"),
    ("Marcus Hale",          "Governance audit for client #{n} passed — no critical findings"),
    ("Marcus Hale",          "NERC CIP compliance review in progress — {k} line items cleared"),
    ("Marcus Hale",          "Decision integrity log reconciled — {n} entries verified"),
    ("Elara Voss",           "Scenario model run complete — pipeline impact: ${n}M projected"),
    ("Elara Voss",           "Budget variance analysis flagged {k} cost overruns for review"),
    ("Elara Voss",           "Financial impact report generated for Q2 board pack"),
    ("Orion Blake",          "Threat feed scan: {n} emerging regulatory shifts catalogued"),
    ("Orion Blake",          "Intelligence digest distributed — top 5 risks highlighted"),
    ("Orion Blake",          "Sector analysis updated: energy transition signals elevated"),
    ("Sable Quinn",          "Vulnerability posture scored for {n} active clients"),
    ("Sable Quinn",          "Risk register updated — {k} items escalated to amber"),
    ("Sable Quinn",          "Risk resolution rate improved by {n}% this sprint"),
    ("Caden Rivers",         "Partner outreach sent to {n} prospects — {k} responses pending"),
    ("Caden Rivers",         "Pipeline review complete — {n} opportunities advanced to next stage"),
    ("Caden Rivers",         "Partnership alignment brief updated for NERC channel"),
    ("Nova Ashworth",        "Sprint velocity tracking — {n} story points completed this week"),
    ("Nova Ashworth",        "Capacity heatmap refreshed — {k} agents at or above 80% load"),
    ("Nova Ashworth",        "Cross-team dependency matrix updated"),
    ("Zephyr Cole",          "3-State Gap scores computed for {n} client profiles"),
    ("Zephyr Cole",          "Fit & Gap reconciliation: {k} critical gaps identified"),
    ("Zephyr Cole",          "Gap closure velocity report published — avg {n} days per closure"),
    ("Echo Reyes",           "Infrastructure health check passed — all {n} services nominal"),
    ("Echo Reyes",           "Data integrity verification complete — {k} anomalies resolved"),
    ("Echo Reyes",           "Pipeline ETL run completed — {n} records ingested successfully"),
    ("Iris Naledi",          "Cross-agent standup facilitated — action items logged"),
    ("Iris Naledi",          "Workflow coordination: {n} task handoffs processed"),
    ("Iris Naledi",          "Ops digest prepared — {k} blockers surfaced for resolution"),
    ("Dex Moreau",           "CMMC audit checklist {n}% complete — {k} controls verified"),
    ("Dex Moreau",           "Compliance gap report filed — {n} low-risk items cleared"),
    ("Dex Moreau",           "Regulatory update reviewed: {n} new NERC CIP advisories processed"),
]

LEVELS = ["info", "info", "info", "info", "warn"]  # mostly info


def rnd_int(lo, hi):
    return random.randint(lo, hi)


def render(template: str) -> str:
    n = rnd_int(3, 47)
    k = rnd_int(1, n)
    return template.format(n=n, k=k)


def make_timestamp(base: datetime, hour: int, minute: int) -> str:
    dt = base.replace(hour=hour, minute=minute, second=rnd_int(0, 59), microsecond=rnd_int(0, 999999))
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f") + "Z"


def make_id(ts: str, msg: str) -> str:
    h = hashlib.md5((ts + msg).encode()).hexdigest()[:8]
    return f"log-{h}"


# ── Build new log entries for March 8–12 ─────────────────────────────────────
START = datetime(2026, 3, 8, tzinfo=timezone.utc)
new_logs = []

for day_offset in range(5):           # March 8 → 12
    base = START + timedelta(days=day_offset)
    # 6–10 activity entries per day at realistic business hours
    hours = sorted(random.sample(range(8, 20), k=min(8, rnd_int(6, 10))))
    for hour in hours:
        template_entry = random.choice(LOG_TEMPLATES)
        agent_name, template = template_entry
        msg = render(template)
        ts = make_timestamp(base, hour, rnd_int(0, 59))
        new_logs.append({
            "id": make_id(ts, msg),
            "timestamp": ts,
            "level": random.choice(LEVELS),
            "message": f"[{agent_name}] {msg}",
        })

# Sort chronologically
new_logs.sort(key=lambda x: x["timestamp"])

# ── Load, merge, write logs.json ──────────────────────────────────────────────
logs_path = DATA / "logs.json"
existing = json.loads(logs_path.read_text())

# Avoid duplicate ids
existing_ids = {e["id"] for e in existing}
to_add = [l for l in new_logs if l["id"] not in existing_ids]

merged = existing + to_add
merged.sort(key=lambda x: x["timestamp"])

logs_path.write_text(json.dumps(merged, indent=2))
print(f"logs.json: added {len(to_add)} entries (total {len(merged)})")

# ── Update tools.json lastRunAt ───────────────────────────────────────────────
tools_path = DATA / "tools.json"
tools = json.loads(tools_path.read_text())

# Spread tool runs realistically across the past 5 days
tool_run_dates = []
for d in range(5):
    dt = START + timedelta(days=d, hours=rnd_int(8, 18), minutes=rnd_int(0, 59), seconds=rnd_int(0, 59))
    tool_run_dates.append(dt.strftime("%Y-%m-%dT%H:%M:%S.%f") + "Z")

live_tools = [t for t in tools if t.get("state") == "Live"]
for i, tool in enumerate(live_tools):
    # All live tools got run at least once in the past 5 days
    tool["lastRunAt"] = tool_run_dates[i % len(tool_run_dates)]

tools_path.write_text(json.dumps(tools, indent=2))
print(f"tools.json: updated lastRunAt on {len(live_tools)} Live tools")

# ── Nudge workload values in team-members.json ────────────────────────────────
members_path = DATA / "team-members.json"
members = json.loads(members_path.read_text())

for m in members:
    old = m.get("workload", 50)
    # Small realistic drift ±5, clamped 20–98
    drift = random.randint(-5, 8)
    m["workload"] = max(20, min(98, old + drift))

members_path.write_text(json.dumps(members, indent=2))
print(f"team-members.json: workload nudged for {len(members)} members")

# ── Advance token-usage.json to today ────────────────────────────────────────
token_path = DATA / "token-usage.json"
token_data = json.loads(token_path.read_text())

today = datetime.now(timezone.utc)
token_data["updatedAt"] = today.strftime("%Y-%m-%dT%H:%M:%SZ")

# Count business days since last update to scale the token/session increments
last_updated = datetime.fromisoformat(
    token_data.get("updatedAt", "2026-03-09T00:00:00Z").replace("Z", "+00:00")
)
# We already overwrote updatedAt, so compute from the previous value stored in records
if token_data["records"]:
    last_activity_strs = [r["lastActivity"] for r in token_data["records"] if r.get("lastActivity")]
    if last_activity_strs:
        most_recent = max(last_activity_strs)
        last_dt = datetime.fromisoformat(most_recent.replace("Z", "+00:00"))
        days_elapsed = max(1, (today - last_dt).days)
    else:
        days_elapsed = 3
else:
    days_elapsed = 3

for record in token_data["records"]:
    # Skip pending/not-started agents
    if record.get("complianceFlag") == "pending_onboard":
        continue
    if record.get("sessions", 0) == 0:
        continue

    # Realistic daily session rates based on existing session count
    daily_sessions = max(1, round(record["sessions"] / 9))  # 9 days in billing period so far
    new_sessions = random.randint(
        max(1, daily_sessions - 2), daily_sessions + 3
    ) * days_elapsed

    # Token growth proportional to new sessions and avg session size
    avg = record.get("avgSessionTokens", 15000)
    new_input_tokens_k  = round((new_sessions * avg * 0.72) / 1000, 1)
    new_output_tokens_k = round((new_sessions * avg * 0.28) / 1000, 1)

    record["tokensInputK"]  = round(record["tokensInputK"]  + new_input_tokens_k,  1)
    record["tokensOutputK"] = round(record["tokensOutputK"] + new_output_tokens_k, 1)
    record["sessions"]      = record["sessions"] + new_sessions

    # Recompute cost (rough model pricing per 1K tokens)
    model = record.get("model", "gpt-4o")
    rate_per_k = {"claude-3-5-sonnet": 0.0045, "gpt-4o": 0.0035, "gpt-4o-mini": 0.00035}.get(model, 0.0035)
    record["costUsd"] = round(
        (record["tokensInputK"] + record["tokensOutputK"]) * rate_per_k, 2
    )

    # Update lastActivity to a realistic time today or yesterday
    offset_hours = random.randint(0, days_elapsed * 8)
    new_last = today - timedelta(hours=offset_hours)
    record["lastActivity"] = new_last.strftime("%Y-%m-%dT%H:%M:%SZ")

token_path.write_text(json.dumps(token_data, indent=2))
print(f"token-usage.json: advanced {days_elapsed} day(s) of activity for {sum(1 for r in token_data['records'] if r.get('sessions',0)>0)} active agents")

print("\nDone ✓  Re-build Mission Control to reflect changes.")
