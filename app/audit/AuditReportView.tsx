"use client";

import { useState } from "react";
import {
  PieChart,
  Check,
  Copy,
  TrendingDown,
  AlertTriangle,
  Layers,
  Users,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Zap,
} from "lucide-react";
import { PublicAuditResult, ToolResult } from "./[id]/page";
// ─── HELPERS ─────────────────────────────────────────────────────────────────



function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-red-400";
}
function fmtMoney(n?: number) {
  return (n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
function scoreLabel(score: number) {
  if (score >= 75) return "Well-utilised";
  if (score >= 45) return "Underutilised";
  return "Redundant";
}

function scoreBg(score: number) {
  if (score >= 75) return "bg-emerald-400/10 border-emerald-400/20";
  if (score >= 45) return "bg-amber-400/10 border-amber-400/20";
  return "bg-red-400/10 border-red-400/20";
}

// Arc SVG for the utilisation score ring
function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 75 ? "#34d399" : score >= 45 ? "#fbbf24" : "#f87171";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#27272a" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text
        x="36"
        y="41"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill={color}
      >
        {score}
      </text>
    </svg>
  );
}

// ─── TOOL CARD ────────────────────────────────────────────────────────────────

function ToolCard({ tool }: { tool: ToolResult }) {
  const [open, setOpen] = useState(false);
  const hasSavings = tool.monthlySavings > 0;
  const hasOverlap = tool.overlapFlags?.length > 0;

  return (
    <div
      className={`rounded-2xl border transition-all ${scoreBg(tool.utilizationScore)}`}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <ScoreRing score={tool.utilizationScore} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-base">
              {tool.toolName}
            </span>
            <span className="text-xs text-zinc-500 font-mono">{tool.planLabel}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${scoreBg(tool.utilizationScore)} ${scoreColor(tool.utilizationScore)}`}
            >
              {scoreLabel(tool.utilizationScore)}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
            <span>{fmtMoney(tool.currentMonthlyCost)}/mo</span>
            <span>·</span>
            <span>{tool.seats} seat{tool.seats !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span className="capitalize">{tool.useCase}</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {hasSavings && (
            <div className="text-emerald-400 font-semibold text-sm">
              Save {fmtMoney(tool.annualSavings)}/yr
            </div>
          )}
          {hasOverlap && !hasSavings && (
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <AlertTriangle size={12} /> Overlap
            </div>
          )}
          <div className="mt-1">
            {open ? (
              <ChevronUp size={14} className="text-zinc-500 ml-auto" />
            ) : (
              <ChevronDown size={14} className="text-zinc-500 ml-auto" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
          {/* Plan recommendation */}
          {tool.recommendedPlanId !== tool.planId && (
            <div className="flex items-start gap-3 bg-zinc-900/60 rounded-xl p-4">
              <TrendingDown size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-zinc-300">
                  Switch to{" "}
                  <span className="text-white font-medium">
                    {tool.recommendedPlanLabel}
                  </span>{" "}
                  at {fmtMoney(tool.recommendedMonthlyCost)}/mo
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Saves {fmtMoney(tool.monthlySavings)}/mo · {fmtMoney(tool.annualSavings)}/yr
                </p>
              </div>
            </div>
          )}

          {/* Overlap flags */}
          {hasOverlap && (
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Overlap detected
              </p>
              {tool.overlapFlags.map((flag: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-amber-300">
                  <AlertTriangle size={12} className="flex-shrink-0" />
                  {flag}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {tool.recommendations?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Recommendations
              </p>
              {tool.recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Zap size={12} className="text-zinc-400 mt-0.5 flex-shrink-0" />
                  {rec}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SHARE BUTTON ─────────────────────────────────────────────────────────────

function ShareButton({ shareId }: { shareId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/audit/${shareId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-white transition-all font-medium"
    >
      {copied ? (
        <>
          <Check size={14} className="text-emerald-400" />
          Copied!
        </>
      ) : (
        <>
          <Copy size={14} />
          Copy share link
        </>
      )}
    </button>
  );
}

// ─── MAIN VIEW ────────────────────────────────────────────────────────────────

type Props = {
  shareId: string;
  teamSize: string;
  result: PublicAuditResult & { title?: string };
  createdAt: string;
};

export default function AuditReportView({
  shareId,
  teamSize,
  result,
  createdAt,
}: Props) {
  const { results, totalMonthlySavings, totalAnnualSavings, overallSummary } =
    result;

  const totalCurrentSpend = results.reduce(
    (sum, t) => sum + (t.currentMonthlyCost ?? t.currentMonthlyCost ?? 0),
    0
  );
  const avgUtilisation = Math.round(
    results.reduce((sum, t) => sum + (t.utilizationScore ?? t.wasteScore ?? 0), 0) / results.length
  );
  const redundantTools = results.filter((t) => t.utilizationScore < 45).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      {/* ── Top nav ── */}
      <header className="border-b border-white/5 px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
            <PieChart size={18} />
          </div>
          <span className="text-white font-bold text-sm">StackAudit</span>
        </a>

        <div className="flex items-center gap-3">
          <ShareButton shareId={shareId} />
          <a
            href="/"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors"
          >
            Audit my stack
            <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* ── Hero ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
            <Calendar size={12} />
            {fmtDate(createdAt)}
            <span>·</span>
            <Users size={12} />
            {teamSize} people
            <span>·</span>
            <Layers size={12} />
            {results.length} tool{results.length !== 1 ? "s" : ""}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            {result.title}
          </h1>
          {overallSummary && (
            <p className="text-zinc-400 text-base max-w-2xl leading-relaxed">
              {overallSummary}
            </p>
          )}
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Monthly spend",
              value: fmtMoney(totalCurrentSpend),
              icon: <DollarSign size={16} />,
              color: "text-white",
            },
            {
              label: "Monthly savings",
              value: fmtMoney(totalMonthlySavings),
              icon: <TrendingDown size={16} />,
              color: "text-emerald-400",
            },
            {
              label: "Annual savings",
              value: fmtMoney(totalAnnualSavings),
              icon: <Zap size={16} />,
              color: "text-emerald-400",
            },
            {
              label: "Avg utilisation",
              value: `${avgUtilisation}%`,
              icon: <PieChart size={16} />,
              color: scoreColor(avgUtilisation),
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2">
                {card.icon}
                {card.label}
              </div>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Flags banner ── */}
        {redundantTools > 0 && (
          <div className="flex items-center gap-3 bg-amber-400/5 border border-amber-400/20 rounded-2xl px-5 py-4 text-sm">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
            <span className="text-amber-200">
              <strong>{redundantTools}</strong> tool
              {redundantTools !== 1 ? "s are" : " is"} scoring below 45 — likely
              redundant or underutilised.
            </span>
          </div>
        )}

        {/* ── Tool breakdown ── */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Tool breakdown
          </h2>
          <div className="space-y-3">
            {results
              .slice()
              .sort((a, b) => a.utilizationScore - b.utilizationScore)
              .map((tool, i) => (
                <ToolCard key={`${tool.toolId}-${i}`} tool={tool} />
              ))}
          </div>
        </div>

        {/* ── CTA footer ── */}
        <div className="border border-white/5 rounded-3xl bg-zinc-900/40 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold text-lg">
              Audit your own AI stack
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              Free, anonymous, takes under 2 minutes.
            </p>
          </div>
          <a
            href="/"
            className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors whitespace-nowrap"
          >
            Start free audit →
          </a>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-700">
        Report generated by{" "}
        <a href="/" className="text-zinc-500 hover:text-white transition-colors">
          StackAudit
        </a>{" "}
        · Company name stripped from public view
      </footer>
    </div>
  );
}