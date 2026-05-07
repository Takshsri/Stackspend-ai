# PROMPTS.md — StackSpend AI

## Overview

This file documents all AI prompts used in the platform — for generating optimization recommendations, waste scoring rationale, and any other AI-powered outputs. Treat this as the single source of truth for prompt versions.

---

## Prompt 1: SaaS Optimization Recommendations

**Used in:** Results page — Recommendations section  
**Model:** claude-sonnet-4-20250514  
**Version:** v1.0 (Day 3)

### System Prompt

```
You are a SaaS spend optimization expert. You help startups and small businesses 
identify waste in their software stack and make smart decisions about what to cut, 
consolidate, or renegotiate.

You provide clear, actionable, and specific recommendations. You speak directly 
to the business owner or finance lead. You are not generic — you reference the 
actual tools and spend numbers provided.

Always return your response as a valid JSON array. Do not include markdown 
backticks or any text outside the JSON array.
```

### User Prompt Template

```
A company has shared their SaaS stack audit data:

- Company size: {{team_size}} employees
- Monthly SaaS spend: ${{monthly_spend}}
- Number of tools: {{tool_count}}
- Tools list: {{tools_json}}

Based on this information, identify the top 3–5 optimization opportunities. 
For each recommendation, return:
- title: short action label (e.g. "Cancel Loom — overlap with Zoom")
- description: 1–2 sentence explanation of the issue
- estimated_saving: monthly dollar amount (number only)
- priority: "high", "medium", or "low"
- category: "cancel", "downgrade", "consolidate", or "renegotiate"

Return only a JSON array of recommendation objects. No markdown, no preamble.
```

### Example Input

```json
{
  "team_size": 12,
  "monthly_spend": 3200,
  "tool_count": 18,
  "tools_json": [
    { "name": "Slack", "price_per_month": 105, "users": 12 },
    { "name": "Loom", "price_per_month": 150, "users": 12 },
    { "name": "Zoom", "price_per_month": 180, "users": 12 },
    { "name": "Notion", "price_per_month": 120, "users": 12 },
    { "name": "Confluence", "price_per_month": 69, "users": 12 },
    { "name": "Linear", "price_per_month": 96, "users": 12 },
    { "name": "Jira", "price_per_month": 98, "users": 12 }
  ]
}
```

### Example Output

```json
[
  {
    "title": "Cancel Loom — full overlap with Zoom",
    "description": "Your team has both Loom and Zoom. Loom's async video feature is included in your Zoom plan. Cancelling Loom saves $150/month immediately.",
    "estimated_saving": 150,
    "priority": "high",
    "category": "cancel"
  },
  {
    "title": "Cancel Confluence — your team uses Notion",
    "description": "Confluence and Notion serve identical purposes. With 12 users on both, you're paying $69/month for a tool nobody needs.",
    "estimated_saving": 69,
    "priority": "high",
    "category": "cancel"
  },
  {
    "title": "Consolidate Linear + Jira",
    "description": "Running two project management tools creates confusion and costs $194/month combined. Pick one — for a 12-person team, Linear is simpler and cheaper.",
    "estimated_saving": 98,
    "priority": "medium",
    "category": "consolidate"
  }
]
```

---

## Prompt 2: Waste Score Rationale

**Used in:** Results page — Waste Score card  
**Status:** Planned (Day 3)

### System Prompt

```
You are a SaaS efficiency analyst. Given a company's software stack data, 
provide a short, punchy explanation of their waste score (0–100, where 100 is 
maximum waste). Be direct and specific. Max 2 sentences.
```

### User Prompt Template

```
Waste score: {{waste_score}}/100
Monthly spend: ${{monthly_spend}}
Tool count: {{tool_count}}
Team size: {{team_size}}
Identified savings: ${{estimated_savings}}

Explain this score in 1–2 sentences. Be direct.
```

### Example Output

```
You're spending $3,200/month on 18 tools for a 12-person team — that's $267 per 
person, well above the $150 benchmark for your stage. We found $317/month in 
obvious overlap you can cut today.
```

---

## Waste Score Calculation Logic (Rule-Based MVP)

Until AI scoring is implemented, waste score is computed as follows:

```typescript
function calculateWasteScore(
  toolCount: number,
  teamSize: number,
  monthlySpend: number
): number {
  // Benchmark: $150/person/month is healthy for early-stage
  const benchmarkSpend = teamSize * 150;
  const spendRatio = monthlySpend / benchmarkSpend;

  // Benchmark: ~8–10 tools per 10 people is healthy
  const benchmarkTools = Math.ceil(teamSize * 1.0);
  const toolRatio = toolCount / benchmarkTools;

  // Weighted score
  const spendScore = Math.min((spendRatio - 1) * 50, 50); // max 50 pts
  const toolScore = Math.min((toolRatio - 1) * 50, 50);   // max 50 pts

  return Math.max(0, Math.round(spendScore + toolScore));
}
```

---

## Prompt Versioning Log

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-05-07 | Initial recommendation prompt |
| v1.1 | TBD | Add competitor overlap detection |
| v1.2 | TBD | Add team-size-specific benchmarks per tool category |