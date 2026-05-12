# USER_INTERVIEWS.md — StackSpend AI

## Objective

The purpose of these interviews was to understand:
- how people currently use AI tools
- whether they actively pay for subscriptions
- how they perceive AI pricing value
- whether AI subscription fatigue is becoming a real problem
- whether users would care about AI spend optimization

All interviews were conducted informally through direct conversations, Google Form responses, and follow-up discussions with students, builders, and startup-oriented users.

The goal was not statistical accuracy, but identifying repeated behavioral patterns and pricing frustrations.

---

# Interview 1 — Student Developer / Builder

## Profile
- Initials: R.K.
- Role: Student + freelance developer
- Team Size: Solo
- Monthly AI Spend: ₹0–500
- Tools Used:
  - ChatGPT
  - Gemini
  - GitHub Copilot

---

## Conversation Notes

The participant regularly uses AI tools for:
- coding help
- debugging
- learning concepts
- assignment assistance

However, they are currently not paying for most tools and rely heavily on free plans or bundled access.

One interesting detail was that they viewed ChatGPT as simultaneously the most useful tool and also the one that felt the most expensive relative to value.

They mentioned:
> “I use ChatGPT almost every day, but I still hesitate to pay monthly because there are so many free alternatives now.”

Another point:
> “Sometimes I open Gemini, Copilot, and ChatGPT for the same task because I want to compare answers.”

And:
> “I probably waste more time switching tools than I save.”

---

## Most Surprising Insight

The participant did not think of “AI spending” as a real category worth tracking yet, even though they actively use multiple AI products daily.

The mental model was:
- subscriptions feel small individually
- but collectively become difficult to evaluate

---

## What Changed in the Product

Originally, the product focused heavily on enterprise SaaS waste.

After this interview, the audit flow was adjusted to:
- support smaller teams and solo users
- include overlapping-tool recommendations
- emphasize “subscription fatigue” messaging instead of only cost-cutting

---

# Interview 2 — Small Startup Engineering Team

## Profile
- Initials: A.S.
- Role: Engineering Lead
- Company Stage: Seed-stage startup (~8 people)
- Monthly AI Spend: ~$300–500
- Tools Used:
  - Cursor Business
  - GitHub Copilot
  - ChatGPT Team
  - Perplexity

---

## Conversation Notes

This participant described AI tooling adoption as “incremental chaos.”

Different developers added tools independently over time without centralized planning.

They explained:
> “At first we added ChatGPT Team, then some people wanted Cursor, then Copilot, and suddenly we had three subscriptions doing almost the same thing.”

Another quote:
> “Nobody actually reviewed whether we still needed all of them.”

And:
> “The spending isn’t catastrophic, but it’s annoying because nobody owns it.”

A particularly useful insight was that the engineering lead cared less about exact dollar savings and more about visibility and justification during budget reviews.

They also mentioned that AI subscriptions often bypass formal approval because they are relatively cheap individually.

---

## Most Surprising Insight

The team did not necessarily want a complicated finance dashboard.

What they wanted was:
- a quick explanation
- clear recommendations
- visibility into duplicate tooling
- confidence during renewal discussions

This strongly reinforced the importance of keeping the product lightweight and fast.

---

## What Changed in the Product

This interview directly influenced:
- the “duplicate tooling” recommendations
- the overlap detection logic
- the “switch_tool” recommendation type
- the public shareable audit summary

The dashboard was intentionally simplified after this conversation because the participant preferred fast recommendations over procurement-style reporting.

---

# Interview 3 — Indie Hacker / Solo Founder

## Profile
- Initials: V.M.
- Role: Indie Hacker
- Team Size: Solo
- Monthly AI Spend: ~$40–100
- Tools Used:
  - ChatGPT Plus
  - Gemini Advanced
  - Perplexity
  - Claude

---

## Conversation Notes

This participant actively experiments with new AI tools and frequently switches between subscriptions depending on current hype cycles and feature releases.

One quote stood out:
> “Every month there’s another AI subscription I convince myself I need.”

Another:
> “I don’t even know which tool is actually giving me the most value anymore.”

And:
> “Perplexity became free through Airtel, so now I keep it even though I barely use it.”

The participant also admitted they had canceled and reactivated subscriptions multiple times depending on workload and cash flow.

Interestingly, they did not necessarily want cheaper AI tools — they wanted clarity around which tools were actually worth keeping.

---

## Most Surprising Insight

The strongest frustration was not pricing itself.

It was uncertainty.

The participant felt overwhelmed by:
- rapidly changing pricing
- new model launches
- overlapping features
- unclear differentiation between plans

This reinforced the idea that the product should focus on decision clarity rather than only cost reduction.

---

## What Changed in the Product

After this conversation:
- the audit summary language became more recommendation-focused
- the UI emphasized “why” recommendations exist
- the product messaging shifted from “cost cutting” to “AI stack optimization”
- support for mixed-tool environments became more important

---

# Repeated Themes Across Interviews

Several patterns appeared consistently:

## 1. AI Subscription Sprawl
Users frequently subscribe to multiple overlapping AI tools without clearly understanding whether each subscription is justified.

---

## 2. Low Spend Visibility
Most participants could estimate spending roughly, but very few actively tracked AI subscriptions month-to-month.

---

## 3. Duplicate Tool Usage
Many users open multiple AI products for the same workflow:
- ChatGPT + Gemini
- Cursor + Copilot
- Claude + ChatGPT

This creates unnecessary overlap and decision fatigue.

---

## 4. Pricing Fatigue
Even users who liked AI products often felt:
- overwhelmed by pricing changes
- unsure which plan is “correct”
- confused by rapidly evolving AI offerings

---

## 5. Users Want Simplicity
Nobody interviewed wanted:
- complex procurement workflows
- large enterprise dashboards
- heavy onboarding

The strongest preference was:
- fast audits
- clear recommendations
- understandable savings explanations
- lightweight UX

---

# Overall Conclusion

The interviews validated that AI-tool spending is becoming a meaningful operational category even for small teams and solo builders.

The core problem is not simply “high pricing.”

The bigger issue is:
- unclear value
- overlapping subscriptions
- low visibility into spend
- uncertainty around which tools are actually worth keeping

This validated the decision to position StackSpend AI as:
- a lightweight optimization tool
- focused on clarity and actionable recommendations
- rather than a heavy enterprise procurement platform.