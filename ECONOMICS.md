# ECONOMICS.md — StackSpend AI

## The Core Value Proposition

Companies overspend on SaaS. The average company wastes 30–40% of its software budget on unused licenses, redundant tools, and forgotten subscriptions. StackSpend AI surfaces that waste and tells you exactly where to cut.

**Value = (Estimated savings surfaced) >> (Cost of subscription)**

---

## Revenue Model

### Pricing Tiers (Planned)

| Tier | Price | Target | Limits |
|---|---|---|---|
| Free | $0/mo | Solo founders, freelancers | 1 audit, basic insights |
| Starter | $29/mo | Small teams (< 20 people) | 5 audits/mo, email report |
| Growth | $79/mo | Startups (20–100 people) | Unlimited audits, AI insights, CSV export |
| Business | $199/mo | Scale-ups (100–500 people) | Multi-user, team dashboard, Slack alerts |

### Monetization Logic

If a customer spends $10,000/mo on SaaS and we identify $2,000 in waste, charging $79/mo is a no-brainer. The ROI sells itself.

---

## Unit Economics (Projections)

### Cost Side

| Item | Estimated Monthly Cost |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| Claude API (recommendations) | ~$0.01–0.05 per audit |
| Domain + email | ~$5 |
| **Total infra at 0 customers** | **~$50/mo** |

At 100 Starter customers: infra cost ≈ $100/mo, revenue = $2,900/mo → **~97% gross margin**

### Revenue Projections

| Customers | Avg Plan | MRR | Infra Cost | Gross Profit |
|---|---|---|---|---|
| 10 | $29 | $290 | $60 | $230 |
| 50 | $50 | $2,500 | $80 | $2,420 |
| 200 | $65 | $13,000 | $200 | $12,800 |
| 500 | $79 | $39,500 | $500 | $39,000 |

---

## Customer Acquisition

### Acquisition Channels (Planned)

| Channel | CAC Estimate | Notes |
|---|---|---|
| Product Hunt launch | ~$0 | One-time spike |
| Twitter/X organic | ~$0 | Founder-led content |
| SEO ("SaaS audit tool") | ~$20–50 | Long-term, 3–6 month lag |
| Indie Hackers | ~$0 | Community-driven |
| Cold outreach (LinkedIn) | ~$30–80 | Finance/ops leads |
| Paid ads (later) | ~$80–150 | Only after PMF |

### Target CAC at Scale: < $50

---

## LTV Assumptions

- Average churn: 5% monthly (early stage)
- Implied LTV at $29/mo: $29 / 0.05 = **$580**
- LTV:CAC target: > 3x (currently: 580/50 = **11.6x** — very healthy if churn holds)

---

## The "Why Now" Economics

- SaaS spend is out of control post-2021 hiring boom
- Companies are now in cost-cutting mode (2024–2026)
- CFOs and Finance Ops are actively looking for this
- No dominant low-cost player in the SMB segment (Zylo/Torii are enterprise, $$$)

---

## Break-Even Analysis

Fixed monthly costs: ~$50 (infra)
Break-even on Free tier: N/A
Break-even on Starter ($29): **2 paying customers**

Getting to ramen profitable: **5–7 Starter customers**

---

## Risks

- **Low willingness to pay** — users expect free tools; mitigate with clear ROI framing
- **Churn if insights feel generic** — AI quality must be high enough to feel personalised
- **Competition from Notion/spreadsheet DIY** — compete on speed and automation
- **Supabase/Vercel cost creep** — monitor at 1000+ audits/month


---

## Expansion Revenue Opportunities

Beyond subscription revenue, StackSpend AI could expand monetization through:

### Enterprise Procurement Audits
Custom consulting-style audits for larger organizations with complex SaaS environments.

### Affiliate / Referral Revenue
Referral partnerships with SaaS vendors offering discounted migration paths or optimized plans.

### Benchmarking Reports
Industry-level SaaS spending benchmarks sold as premium reports for startups and finance teams.

### Team Collaboration Add-ons
Additional seats, admin controls, and approval workflows for larger organizations.

### API Access
Expose audit and optimization endpoints for integration into finance dashboards or procurement platforms.


---

## Long-Term Defensibility

The long-term moat for StackSpend AI would come from:
- Historical SaaS spend datasets
- Optimization benchmarking across companies
- AI recommendation quality improvements over time
- Workflow integrations into finance operations
- Shareable audit reports creating organic distribution

As more audit data is collected, recommendation quality and pricing intelligence become harder for competitors to replicate quickly.


---

## Key Economic Assumptions

Several assumptions influence these projections:

- AI API costs remain relatively low per audit
- Users perceive identified savings as significantly higher than subscription cost
- Most early users come from organic distribution rather than paid acquisition
- Churn decreases as integrations and automation improve
- SMB customers prioritize simplicity over enterprise procurement complexity

These assumptions may change as real customer behavior and retention data become available.