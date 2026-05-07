# METRICS.md — StackSpend AI

## North Star Metric

**Audits completed per week**

This single metric captures product value delivery, user engagement, and growth in one number. An audit completed = a user who understood the product, trusted it with their data, and went all the way through.

---

## Acquisition Metrics

| Metric | Description | Target (Month 1) |
|---|---|---|
| Unique visitors | Landing page traffic | 500 |
| Signup conversion rate | Visitors → signups | > 10% |
| Total signups | Cumulative registered users | 50 |
| Acquisition channel breakdown | Organic / referral / direct | Track all |

---

## Activation Metrics

| Metric | Description | Target (Month 1) |
|---|---|---|
| Audit start rate | Signups who start an audit | > 70% |
| Audit completion rate | Started → completed | > 60% |
| Time to first audit | Signup → first completed audit | < 10 min |
| Steps dropped at | Which wizard step loses most users | Monitor daily |

---

## Engagement Metrics

| Metric | Description | Target |
|---|---|---|
| Audits per user (monthly) | Average audits completed/user | > 1.5 |
| Return visit rate | Users who return within 7 days | > 30% |
| Dashboard page views per session | Depth of engagement | > 3 |
| Recommendations acted on | Self-reported in follow-up survey | Track |

---

## Retention Metrics

| Metric | Description | Target |
|---|---|---|
| Week 1 retention | Users who return in first 7 days | > 40% |
| Month 1 retention | Users active in month 1 | > 25% |
| Monthly churn (paid) | Paid subscribers who cancel | < 5% |

---

## Revenue Metrics

| Metric | Description | Target (Month 2) |
|---|---|---|
| MRR | Monthly recurring revenue | $290 (10 Starter) |
| Paying customer count | Users on paid plan | 10 |
| Free → Paid conversion | Free users upgrading | > 5% |
| ARPU | Average revenue per user | $40+ |
| LTV estimate | ARPU / monthly churn | Track |

---

## Product Quality Metrics

| Metric | Description | How to Measure |
|---|---|---|
| Avg estimated savings surfaced | Dollar value shown per audit | Supabase query |
| Avg waste score | 0–100 score per audit | Supabase query |
| Recommendation relevance | User rates each rec 1–5 | In-app survey |
| Support requests / complaints | Auth issues, broken flows | Manual log |

---

## Tracking Plan

### Day 1 (MVP)
- Supabase `audits` table captures: user_id, created_at, tool_count, monthly_spend, estimated_savings, waste_score
- Manual monitoring via Supabase dashboard

### Day 3–5 (Next)
- Add simple analytics (Plausible or PostHog free tier)
- Track: landing page visit, signup, audit_start, audit_complete, dashboard_view

### Week 2+
- Funnel dashboard built in the app
- Weekly metrics email to self (or Slack notification via Supabase webhooks)

---

## Weekly Check-In Template

```
Week of: ___________

Signups this week: ___
Audits completed: ___
Audit completion rate: ___%
New paying customers: ___
MRR: $___
Top drop-off point in wizard: Step ___
Biggest piece of user feedback: ___
One thing to fix next week: ___
```