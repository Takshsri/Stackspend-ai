# PROMPTS.md

## Prompt 1: Personalized Audit Summary

**Used in:** Results page AI summary block  
**Model:** claude-sonnet-4-20250514  
**Route:** `/api/summary`

### System Prompt
```
You are a concise financial analyst specializing in AI infrastructure costs.
Write exactly one paragraph of 80-120 words summarizing an AI spend audit.
Reference specific tool names and dollar amounts. Never invent numbers.
If savings are zero, be honest. Tone: direct, helpful. No bullet points.
Return only the paragraph text.
```

### User Prompt
```
Team size: {{team_size}}
Current monthly spend: ${{total_current_spend}}
Monthly savings found: ${{total_monthly_savings}}
Annual savings found: ${{total_annual_savings}}
Tools audited: {{tool_count}}

Per-tool breakdown:
{{#each results}}
- {{toolName}} ({{currentPlanId}}, {{seats}} seats): ${{currentMonthlySpend}}/mo
  → {{bestRecommendation.type}} to {{bestRecommendation.recommendedPlanId}}
  → Save ${{bestRecommendation.monthlySavings}}/mo
  → {{bestRecommendation.reasoning}}
{{/each}}

Write a single 80-120 word paragraph for the team's CTO or engineering manager.
```

### What didn't work
- **No word limit** → 300+ word responses, too long for the UI card
- **Asked for bullets** → looked like a duplicate audit, not a human summary
- **No tone guidance** → defaulted to marketing language ("unlock savings")

### Fallback
If API fails, `getFallbackSummary()` generates a templated paragraph client-side.
Users never see a loading state — fallback shows instantly, AI replaces it on resolve.

---

## Prompt 2: Audit Engine

**Model:** None — rule-based TypeScript only.

Every recommendation uses explicit pricing rules in `audit-engine.ts`. No AI.
Reason: financial recommendations must be verifiable against vendor pricing pages.
AI hallucinating a price would destroy trust. Knowing when NOT to use AI matters.

---

The summary is informational only and does not generate pricing decisions.
All savings recommendations come from deterministic audit-engine.ts rules.


## Versioning

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-05-08 | Initial prompt, no word limit |
| v1.1 | 2026-05-08 | Added 80-120 word constraint |
| v1.2 | 2026-05-09 | Added tone rules, removed bullets |
| v1.3 | 2026-05-10 | Added fallback documentation |