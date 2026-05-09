// audit-engine.ts
// Pure functions only — no UI, no side effects, fully testable.
// All pricing numbers match pricing.ts and PRICING_DATA.md.

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "gemini_api"
  | "windsurf";

export type AuditInput = {
  toolId: ToolId;
  planId: string;
  monthlySpend: number; // what they actually pay today (USD)
  seats: number;        // number of users/seats on this tool
  useCase: UseCase;     // primary use case for this tool
  teamSize: number;     // total team size (may differ from seats)
};

export type RecommendationType =
  | "downgrade_plan"       // cheaper plan from same vendor
  | "upgrade_plan"         // they need a higher plan (prevent future overage)
  | "reduce_seats"         // paying for more seats than team size
  | "switch_tool"          // cheaper alternative tool for same job
  | "already_optimal"      // nothing to change
  | "consider_credits";    // Credex credits opportunity

export type Recommendation = {
  type: RecommendationType;
  recommendedToolId?: ToolId;   // if switch_tool
  recommendedPlanId: string;
  recommendedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string; // finance-literate: specific numbers and conditions
  confidence: "high" | "medium" | "low";
};

export type AuditResult = {
  toolId: ToolId;
  toolName: string;
  currentPlanId: string;
  currentMonthlySpend: number;
  seats: number;
  useCase: UseCase;
  recommendations: Recommendation[];   // ordered best-savings first
  bestRecommendation: Recommendation;  // top pick
  wasteScore: number;                  // 0–100: 0 = optimal, 100 = maximum waste
  summary: string;                     // one sentence shown in results card
};

// ─── PRICING CONSTANTS ────────────────────────────────────────────────────────
// Source: pricing.ts / PRICING_DATA.md
// Inline here so audit engine is self-contained and testable without imports.

const PRICES: Record<string, Record<string, number>> = {
  cursor: {
    hobby: 0,
    pro: 20,
    business: 40,
    enterprise: 100,
  },
  github_copilot: {
    individual: 10,
    business: 19,
    enterprise: 39,
  },
  claude: {
    free: 0,
    pro: 20,
    max: 100,
    team: 30,       // per seat, min 5 seats
    enterprise: 60, // estimate, contact sales
  },
  chatgpt: {
    free: 0,
    plus: 20,
    team: 30,       // $25/seat/mo billed annually
    enterprise: 60, // estimate, contact sales
  },
  anthropic_api: {
    direct: 0, // usage-based; user enters actual spend
  },
  openai_api: {
    direct: 0, // usage-based; user enters actual spend
  },
  gemini: {
    free: 0,
    advanced: 19.99,
    business: 30,
  },
  gemini_api: {
    direct: 0, // usage-based
  },
  windsurf: {
    free: 0,
    pro: 15,
    teams: 30,
  },
};

const TOOL_NAMES: Record<ToolId, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  gemini_api: "Gemini API",
  windsurf: "Windsurf",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function monthlyPlanCost(toolId: ToolId, planId: string, seats: number): number {
  const price = PRICES[toolId]?.[planId] ?? 0;
  return price * seats;
}

function savings(current: number, recommended: number): number {
  return Math.max(0, current - recommended);
}

function wasteScoreFromSavings(monthlySavings: number, currentSpend: number): number {
  if (currentSpend <= 0) return 0;
  const ratio = monthlySavings / currentSpend;
  // Scale: 0% waste = 0, 100% waste = 100
  return Math.round(Math.min(100, ratio * 100));
}

function optimal(planId: string, spend: number): Recommendation {
  return {
    type: "already_optimal",
    recommendedPlanId: planId,
    recommendedMonthlySpend: spend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning:
      "Your current plan is the most cost-efficient option for your team size and use case. No changes recommended.",
    confidence: "high",
  };
}

// ─── TOOL-SPECIFIC AUDIT LOGIC ────────────────────────────────────────────────

function auditCursor(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { planId, seats, monthlySpend, useCase } = input;

  // Business plan for ≤3 seats: Pro covers the same models, no SSO needed
  if (planId === "business" && seats <= 3) {
    const recommended = monthlyPlanCost("cursor", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "pro",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `Cursor Business costs $40/seat/mo; Pro costs $20/seat/mo. Both include unlimited requests and the same model set (GPT-4o, Claude 3.5 Sonnet). Business adds SSO and centralized billing — unnecessary for ${seats} seats. Switching saves $${saved}/mo ($${saved * 12}/yr) with no capability loss.`,
      confidence: "high",
    });
  }

  // Enterprise for <20 seats: minimum seat threshold makes it uneconomical
  if (planId === "enterprise" && seats < 20) {
    const recommended = monthlyPlanCost("cursor", "business", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "business",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `Cursor Enterprise is designed for 20+ seat orgs needing audit logs and dedicated support. At ${seats} seats, Business plan ($40/seat/mo) provides SSO and admin controls — the features you likely need — at roughly half the cost. Estimated savings: $${saved}/mo.`,
      confidence: "medium",
    });
  }

  // Non-coding use case on Cursor: wrong tool category
  if (useCase !== "coding" && planId !== "hobby") {
    const recommended = monthlyPlanCost("claude", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    if (saved > 0) {
      recs.push({
        type: "switch_tool",
        recommendedToolId: "claude",
        recommendedPlanId: "pro",
        recommendedMonthlySpend: recommended,
        monthlySavings: saved,
        annualSavings: saved * 12,
        reasoning: `Cursor is a coding-specific IDE assistant — paying for it primarily for ${useCase} tasks means you're buying a feature set you don't need. Claude Pro ($20/seat/mo) is purpose-built for ${useCase} workflows and would cost $${recommended}/mo for ${seats} seats vs your current $${monthlySpend}/mo. Switch if coding is not a primary use.`,
        confidence: "medium",
      });
    }
  }

  // Windsurf alternative for cost-sensitive coding teams
  if ((planId === "pro" || planId === "business") && seats >= 5) {
    const windsurfPlan = planId === "business" ? "teams" : "pro";
    const recommended = monthlyPlanCost("windsurf", windsurfPlan, seats);
    const saved = savings(monthlySpend, recommended);
    if (saved > 0) {
      recs.push({
        type: "switch_tool",
        recommendedToolId: "windsurf",
        recommendedPlanId: windsurfPlan,
        recommendedMonthlySpend: recommended,
        monthlySavings: saved,
        annualSavings: saved * 12,
        reasoning: `Windsurf Pro costs $15/seat/mo vs Cursor Pro at $20/seat/mo — same underlying models (GPT-4o, Claude 3.5 Sonnet), similar agentic coding features. For ${seats} seats this is a $${saved}/mo ($${saved * 12}/yr) difference. Worth a 2-week trial before fully switching.`,
        confidence: "low",
      });
    }
  }

  return recs;
}

function auditGithubCopilot(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { planId, seats, monthlySpend } = input;

  // Enterprise for <5 seats: Business has admin controls, Enterprise adds fine-tuning
  if (planId === "enterprise" && seats < 5) {
    const recommended = monthlyPlanCost("github_copilot", "business", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "business",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `Copilot Enterprise ($39/seat/mo) adds custom model fine-tuning on your codebase and Bing search integration — valuable for 20+ person eng teams with large proprietary codebases. For ${seats} seats, Copilot Business ($19/seat/mo) covers policy management, SSO, and audit logs. That's a $${saved}/mo saving with no loss for typical small teams.`,
      confidence: "high",
    });
  }

  // Business for 1 developer: Individual is half the price
  if (planId === "business" && seats === 1) {
    const recommended = monthlyPlanCost("github_copilot", "individual", 1);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "individual",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `Copilot Business costs $19/seat/mo but its value — SSO, policy controls, audit logs — only matters for teams. Individual plan ($10/mo) covers the same code completion and chat for a single developer. Save $${saved}/mo ($${saved * 12}/yr).`,
      confidence: "high",
    });
  }

  // Cursor as alternative for heavy coding teams
  if (seats <= 10 && planId !== "individual") {
    const recommended = monthlyPlanCost("cursor", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    if (saved > 5) {
      recs.push({
        type: "switch_tool",
        recommendedToolId: "cursor",
        recommendedPlanId: "pro",
        recommendedMonthlySpend: recommended,
        monthlySavings: saved,
        annualSavings: saved * 12,
        reasoning: `Cursor Pro ($20/seat/mo) provides deeper agentic coding (multi-file edits, terminal integration, Composer) vs Copilot's autocomplete-first approach. For teams doing complex feature work rather than line-level suggestions, Cursor often delivers more per dollar. Evaluate based on your workflow intensity.`,
        confidence: "low",
      });
    }
  }

  return recs;
}

function auditClaude(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { planId, seats, monthlySpend, useCase } = input;

  // Max plan for writing/research: Pro has same models, Max only adds higher rate limits
  if (planId === "max" && (useCase === "writing" || useCase === "research")) {
    const recommended = monthlyPlanCost("claude", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "pro",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `Claude Max ($100/seat/mo) vs Pro ($20/seat/mo): both access the same models (Opus 4, Sonnet 4). Max is designed for users who hit Pro's rate limits daily — typically people running long automated pipelines, not ${useCase} workflows. Unless you're consistently hitting "usage limit" messages before end-of-day, Pro is sufficient. Savings: $${saved}/mo ($${saved * 12}/yr).`,
      confidence: "high",
    });
  }

  // Team plan for <5 seats: minimum seat requirement means you're paying for unused slots
  if (planId === "team" && seats < 5) {
    const recommended = monthlyPlanCost("claude", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "pro",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `Claude Team has a 5-seat minimum at $30/seat/mo. With ${seats} seats, you're either paying for ${5 - seats} unused seat(s) or on a non-standard arrangement. Claude Pro ($20/seat/mo) has no minimum and costs $${recommended}/mo for ${seats} actual users — saving $${saved}/mo unless you specifically need Team's shared project workspaces and admin billing.`,
      confidence: "high",
    });
  }

  // Claude for coding: Cursor may be better value
  if (useCase === "coding" && (planId === "pro" || planId === "max")) {
    const recommended = monthlyPlanCost("cursor", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    if (saved > 0) {
      recs.push({
        type: "switch_tool",
        recommendedToolId: "cursor",
        recommendedPlanId: "pro",
        recommendedMonthlySpend: recommended,
        monthlySavings: saved,
        annualSavings: saved * 12,
        reasoning: `For coding use cases, Cursor Pro ($20/seat/mo) integrates directly in your editor with multi-file context, terminal access, and agentic workflows — Claude's strong suit delivered in a coding-optimized environment. Claude Pro through the web UI for coding costs the same but lacks the IDE integration. If Claude is your primary coding interface rather than a general assistant, Cursor delivers more per dollar.`,
        confidence: "low",
      });
    }
  }

  return recs;
}

function auditChatGPT(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { planId, seats, monthlySpend, useCase } = input;

  // Team for ≤2 seats: Plus is cheaper and functionally equivalent
  if (planId === "team" && seats <= 2) {
    const recommended = monthlyPlanCost("chatgpt", "plus", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "plus",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `ChatGPT Team ($30/seat/mo) adds shared workspace, admin controls, and higher message limits vs Plus ($20/seat/mo). For ${seats} users, admin controls provide no real value — you don't need a user management console for a 2-person team. Savings: $${saved}/mo ($${saved * 12}/yr). Revisit when your team grows past 5.`,
      confidence: "high",
    });
  }

  // Enterprise for <20 seats: Team plan covers it
  if (planId === "enterprise" && seats < 20) {
    const recommended = monthlyPlanCost("chatgpt", "team", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "team",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `ChatGPT Enterprise (est. $60/seat/mo) is built for 150+ seat orgs needing SOC 2, SSO, dedicated account management, and custom data retention. At ${seats} seats, ChatGPT Team ($30/seat/mo) provides admin controls and no training on your data — the key Enterprise benefits for smaller orgs — at half the price. Estimated savings: $${saved}/mo.`,
      confidence: "medium",
    });
  }

  // Coding use case: ChatGPT is suboptimal vs Cursor
  if (useCase === "coding" && planId !== "free") {
    const recommended = monthlyPlanCost("cursor", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    if (saved > 0) {
      recs.push({
        type: "switch_tool",
        recommendedToolId: "cursor",
        recommendedPlanId: "pro",
        recommendedMonthlySpend: recommended,
        monthlySavings: saved,
        annualSavings: saved * 12,
        reasoning: `ChatGPT's coding capability is strong but delivered through a browser chat interface. Cursor Pro ($20/seat/mo) uses the same underlying models (GPT-4o) with full IDE integration: multi-file edits, codebase-aware context, and terminal. For teams whose primary use case is coding, Cursor provides the same AI at comparable cost with dramatically better developer experience.`,
        confidence: "medium",
      });
    }
  }

  // Claude as alternative for writing/research
  if ((useCase === "writing" || useCase === "research") && planId === "plus") {
    const recommended = monthlyPlanCost("claude", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    if (saved === 0) {
      // Same price — flag the capability difference
      recs.push({
        type: "switch_tool",
        recommendedToolId: "claude",
        recommendedPlanId: "pro",
        recommendedMonthlySpend: recommended,
        monthlySavings: 0,
        annualSavings: 0,
        reasoning: `For ${useCase} workflows, Claude Pro ($20/seat/mo) is widely regarded as superior to ChatGPT Plus at the same price point. Claude Opus/Sonnet 4 models score higher on long-form writing benchmarks and handle nuance better. Cost-neutral switch with likely quality improvement.`,
        confidence: "low",
      });
    }
  }

  return recs;
}

function auditAnthropicAPI(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { monthlySpend, useCase } = input;

  // High spend on API: check if a flat plan would be cheaper
  if (monthlySpend >= 100) {
    const claudeProCost = monthlyPlanCost("claude", "pro", input.seats);
    const saved = savings(monthlySpend, claudeProCost);
    if (saved > 20) {
      recs.push({
        type: "switch_tool",
        recommendedToolId: "claude",
        recommendedPlanId: "pro",
        recommendedMonthlySpend: claudeProCost,
        monthlySavings: saved,
        annualSavings: saved * 12,
        reasoning: `You're spending $${monthlySpend}/mo on Anthropic API direct. Claude Pro ($20/seat/mo) is a flat-rate plan that includes unlimited Claude Opus/Sonnet 4 access for individuals. If your use case is interactive (not automated pipelines), the flat plan is almost always cheaper above ~$25/mo of API usage. For automated workloads, the API remains necessary — but consider caching responses and batching requests to cut token costs by 30–50%.`,
        confidence: "medium",
      });
    }
  }

  // Gemini API as cheaper alternative for high-volume, cost-sensitive workloads
  if (monthlySpend >= 200 && useCase === "data") {
    recs.push({
      type: "switch_tool",
      recommendedToolId: "gemini_api",
      recommendedPlanId: "direct",
      recommendedMonthlySpend: monthlySpend * 0.4, // Gemini Flash is ~60% cheaper
      monthlySavings: monthlySpend * 0.6,
      annualSavings: monthlySpend * 0.6 * 12,
      reasoning: `Gemini 2.0 Flash API costs $0.10/1M input tokens vs Claude Sonnet 4 at $3/1M input tokens — roughly 30x cheaper for high-volume data processing tasks. For data pipeline workloads (extraction, classification, summarization at scale), Gemini Flash often matches quality at a fraction of the cost. Estimated 50–60% cost reduction. Requires testing output quality on your specific data.`,
      confidence: "low",
    });
  }

  return recs;
}

function auditOpenAIAPI(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { monthlySpend, useCase } = input;

  // Flat ChatGPT plan cheaper for interactive use
  if (monthlySpend >= 80) {
    const chatgptCost = monthlyPlanCost("chatgpt", "plus", input.seats);
    const saved = savings(monthlySpend, chatgptCost);
    if (saved > 20) {
      recs.push({
        type: "switch_tool",
        recommendedToolId: "chatgpt",
        recommendedPlanId: "plus",
        recommendedMonthlySpend: chatgptCost,
        monthlySavings: saved,
        annualSavings: saved * 12,
        reasoning: `Spending $${monthlySpend}/mo on OpenAI API direct. ChatGPT Plus ($20/seat/mo) gives unlimited GPT-4o access for interactive use cases. If your workload is human-in-the-loop rather than automated batch processing, the flat subscription saves $${saved}/mo. For automated workloads, stay on API but consider switching high-volume tasks to GPT-4o-mini ($0.15/1M input tokens) instead of GPT-4o ($2.50/1M).`,
        confidence: "medium",
      });
    }
  }

  // Anthropic API for writing/research workloads
  if (useCase === "writing" || useCase === "research") {
    recs.push({
      type: "switch_tool",
      recommendedToolId: "anthropic_api",
      recommendedPlanId: "direct",
      recommendedMonthlySpend: monthlySpend * 0.85,
      monthlySavings: monthlySpend * 0.15,
      annualSavings: monthlySpend * 0.15 * 12,
      reasoning: `For ${useCase} workloads, Claude Sonnet 4 via Anthropic API ($3/1M input tokens) often outperforms GPT-4o ($2.50/1M input tokens) on long-form quality benchmarks at comparable pricing. For writing-heavy pipelines, the output quality improvement can reduce editing time and retry costs. Estimated 10–20% net cost reduction after factoring in fewer retries.`,
      confidence: "low",
    });
  }

  return recs;
}

function auditGemini(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { planId, seats, monthlySpend, useCase } = input;

  // Business plan for non-Workspace teams: likely overpaying for Google integration
  if (planId === "business" && seats <= 5) {
    const recommended = monthlyPlanCost("gemini", "advanced", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "advanced",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `Gemini Business ($30/seat/mo) bundles AI features with Google Workspace — worth it only if your team deeply uses Docs, Sheets, and Gmail with AI assist. For ${seats} users primarily using Gemini as a standalone assistant, Advanced ($19.99/seat/mo) provides the same Gemini 2.0 Pro model access. Save $${saved}/mo ($${saved * 12}/yr) unless Workspace integration is a primary workflow.`,
      confidence: "high",
    });
  }

  // Claude/ChatGPT as better writing/research alternatives at same price
  if (planId === "advanced" && (useCase === "writing" || useCase === "research")) {
    recs.push({
      type: "switch_tool",
      recommendedToolId: "claude",
      recommendedPlanId: "pro",
      recommendedMonthlySpend: monthlyPlanCost("claude", "pro", seats),
      monthlySavings: 0,
      annualSavings: 0,
      reasoning: `Gemini Advanced and Claude Pro are similarly priced (~$20/seat/mo). For ${useCase} workflows, Claude consistently scores higher on nuanced writing and long-document comprehension benchmarks. Cost-neutral switch with likely quality improvement. Keep Gemini if you're heavily invested in Google Workspace integration.`,
      confidence: "low",
    });
  }

  return recs;
}

function auditGeminiAPI(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { monthlySpend } = input;

  // Generally good value — flag if spending a lot and Anthropic might give better quality
  if (monthlySpend >= 300) {
    recs.push({
      type: "already_optimal",
      recommendedPlanId: "direct",
      recommendedMonthlySpend: monthlySpend,
      monthlySavings: 0,
      annualSavings: 0,
      reasoning: `Gemini API (especially Gemini 2.0 Flash at $0.10/1M tokens) is one of the most cost-efficient APIs available. At $${monthlySpend}/mo spend, you're likely already optimized. Consider Gemini 2.0 Flash for high-volume tasks vs 1.5 Pro for quality-sensitive tasks to further reduce costs.`,
      confidence: "high",
    });
  }

  return recs;
}

function auditWindsurf(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { planId, seats, monthlySpend, useCase } = input;

  // Teams plan for ≤2 seats
  if (planId === "teams" && seats <= 2) {
    const recommended = monthlyPlanCost("windsurf", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "downgrade_plan",
      recommendedPlanId: "pro",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `Windsurf Teams ($30/seat/mo) provides centralized billing and admin controls. For ${seats} users, Windsurf Pro ($15/seat/mo) gives the same AI coding capability. Admin controls add no value below ~5 users. Save $${saved}/mo ($${saved * 12}/yr).`,
      confidence: "high",
    });
  }

  // Non-coding use case: wrong tool
  if (useCase !== "coding") {
    const recommended = monthlyPlanCost("claude", "pro", seats);
    const saved = savings(monthlySpend, recommended);
    recs.push({
      type: "switch_tool",
      recommendedToolId: "claude",
      recommendedPlanId: "pro",
      recommendedMonthlySpend: recommended,
      monthlySavings: saved,
      annualSavings: saved * 12,
      reasoning: `Windsurf is an AI coding IDE — paying for it for ${useCase} tasks means you're buying a specialized tool for a use case it wasn't designed for. Claude Pro ($20/seat/mo) is more capable for ${useCase} and costs $${recommended}/mo for ${seats} seats.`,
      confidence: "high",
    });
  }

  return recs;
}

// ─── MAIN AUDIT DISPATCHER ────────────────────────────────────────────────────

const auditFunctions: Record<ToolId, (input: AuditInput) => Recommendation[]> = {
  cursor: auditCursor,
  github_copilot: auditGithubCopilot,
  claude: auditClaude,
  chatgpt: auditChatGPT,
  anthropic_api: auditAnthropicAPI,
  openai_api: auditOpenAIAPI,
  gemini: auditGemini,
  gemini_api: auditGeminiAPI,
  windsurf: auditWindsurf,
};

export function runAudit(input: AuditInput): AuditResult {
  const auditFn = auditFunctions[input.toolId];
  const allRecs: Recommendation[] = auditFn ? auditFn(input) : [];

  // Sort by monthly savings descending
  const sorted = [...allRecs].sort((a, b) => b.monthlySavings - a.monthlySavings);

  const bestRec: Recommendation =
    sorted.length > 0
      ? sorted[0]
      : optimal(input.planId, input.monthlySpend);

  const waste = wasteScoreFromSavings(bestRec.monthlySavings, input.monthlySpend);

  const summary =
    bestRec.type === "already_optimal"
      ? `${TOOL_NAMES[input.toolId]}: optimized. No changes needed.`
      : `${TOOL_NAMES[input.toolId]}: save $${bestRec.monthlySavings}/mo by ${
          bestRec.type === "switch_tool"
            ? `switching to ${TOOL_NAMES[bestRec.recommendedToolId!]}`
            : `moving to ${bestRec.recommendedPlanId} plan`
        }.`;

  return {
    toolId: input.toolId,
    toolName: TOOL_NAMES[input.toolId],
    currentPlanId: input.planId,
    currentMonthlySpend: input.monthlySpend,
    seats: input.seats,
    useCase: input.useCase,
    recommendations: sorted.length > 0 ? sorted : [optimal(input.planId, input.monthlySpend)],
    bestRecommendation: bestRec,
    wasteScore: waste,
    summary,
  };
}

// ─── MULTI-TOOL AUDIT ─────────────────────────────────────────────────────────

export type FullAuditResult = {
  results: AuditResult[];
  totalCurrentSpend: number;
  totalOptimizedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  credexOpportunity: boolean; // true if savings > $500/mo
  overallSummary: string;
};

export function runFullAudit(inputs: AuditInput[]): FullAuditResult {
  const results = inputs.map(runAudit);

  const totalCurrentSpend = results.reduce((s, r) => s + r.currentMonthlySpend, 0);
  const totalOptimizedSpend = results.reduce(
    (s, r) => s + r.bestRecommendation.recommendedMonthlySpend,
    0
  );
  const totalMonthlySavings = Math.max(0, totalCurrentSpend - totalOptimizedSpend);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const credexOpportunity = totalMonthlySavings > 500;

  const overallSummary =
    totalMonthlySavings === 0
      ? "Your AI stack is well-optimized. No significant savings identified."
      : `Your team could save $${totalMonthlySavings.toFixed(0)}/mo ($${totalAnnualSavings.toFixed(0)}/yr) with ${results.filter((r) => r.bestRecommendation.type !== "already_optimal").length} changes to your AI stack.`;

  return {
    results,
    totalCurrentSpend,
    totalOptimizedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    credexOpportunity,
    overallSummary,
  };
}