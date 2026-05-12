"use client";

import { useEffect, useState} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  TrendingDown,
  CheckCircle2,

  ArrowRight,
  Share2,
  Copy,
  Check,
  Mail,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BadgeDollarSign,
} from "lucide-react";
import type { FullAuditResult, AuditResult, RecommendationType } from "@/app/services/audit-engine";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type LeadForm = {
  email: string;
  companyName: string;
  role: string;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function getWasteColor(score: number) {
  if (score >= 60) return "text-red-400";
  if (score >= 30) return "text-yellow-400";
  return "text-green-400";
}

function getWasteBg(score: number) {
  if (score >= 60) return "bg-red-500";
  if (score >= 30) return "bg-yellow-500";
  return "bg-green-500";
}

function getRecommendationBadge(type: RecommendationType) {
  const map: Record<RecommendationType, { label: string; className: string }> = {
    downgrade_plan: { label: "Downgrade Plan", className: "bg-yellow-500/20 text-yellow-400" },
    upgrade_plan: { label: "Upgrade Plan", className: "bg-blue-500/20 text-blue-400" },
    reduce_seats: { label: "Reduce Seats", className: "bg-orange-500/20 text-orange-400" },
    switch_tool: { label: "Switch Tool", className: "bg-purple-500/20 text-purple-400" },
    already_optimal: { label: "Optimal ✓", className: "bg-green-500/20 text-green-400" },
    consider_credits: { label: "Use Credits", className: "bg-indigo-500/20 text-indigo-400" },
  };
  return map[type] ?? { label: type, className: "bg-zinc-500/20 text-zinc-400" };
}

function getConfidenceLabel(confidence: "high" | "medium" | "low") {
  const map = {
    high: { label: "High confidence", className: "text-green-400" },
    medium: { label: "Medium confidence", className: "text-yellow-400" },
    low: { label: "Low confidence", className: "text-zinc-400" },
  };
  return map[confidence];
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function ToolCard({ result }: { result: AuditResult }) {
  const [expanded, setExpanded] = useState(false);
  const best = result.bestRecommendation;
  const badge = getRecommendationBadge(best.type);
  const conf = getConfidenceLabel(best.confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 space-y-4"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold text-lg">{result.toolName}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-zinc-500 text-sm mt-0.5">
            {result.currentPlanId} plan · {result.seats} seat{result.seats !== 1 ? "s" : ""} · {result.useCase}
          </p>
        </div>

        {best.monthlySavings > 0 && (
          <div className="text-right shrink-0">
            <div className="text-green-400 font-bold text-xl">${fmt(best.monthlySavings)}/mo</div>
            <div className="text-zinc-500 text-xs">${fmt(best.annualSavings)}/yr potential</div>
          </div>
        )}

        {best.type === "already_optimal" && (
          <div className="text-right shrink-0">
            <CheckCircle2 size={24} className="text-green-400" />
          </div>
        )}
      </div>

      {/* Spend bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Current: ${fmt(result.currentMonthlySpend)}/mo</span>
          {best.monthlySavings > 0 && (
            <span className="text-green-400">→ ${fmt(best.recommendedMonthlySpend)}/mo</span>
          )}
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${getWasteBg(result.wasteScore)}`}
            style={{ width: `${Math.max(5, 100 - result.wasteScore)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className={getWasteColor(result.wasteScore)}>
            Waste score: {result.wasteScore}%
          </span>
          <span className={`text-xs ${conf.className}`}>{conf.label}</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-zinc-400 text-sm leading-relaxed">{best.reasoning}</p>

      {/* Expand for more recommendations */}
      {result.recommendations.length > 1 && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Hide" : `Show ${result.recommendations.length - 1} more option${result.recommendations.length > 2 ? "s" : ""}`}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {result.recommendations.slice(1).map((rec, i) => {
                  const b2 = getRecommendationBadge(rec.type);
                  return (
                    <div key={i} className="border border-white/5 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${b2.className}`}>{b2.label}</span>
                        {rec.monthlySavings > 0 && (
                          <span className="text-green-400 text-sm font-medium">${fmt(rec.monthlySavings)}/mo</span>
                        )}
                      </div>
                      <p className="text-zinc-500 text-xs leading-relaxed">{rec.reasoning}</p>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

function AISummaryBlock({ auditResult }: { auditResult: FullAuditResult }) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auditResult }),
        });
        const json = await res.json();
        console.log(json);
        setSummary(json.summary ?? getFallbackSummary(auditResult));
      } catch {
        setSummary(getFallbackSummary(auditResult));
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 space-y-3">
      <div className="flex items-center gap-2 text-white font-semibold">
        <Sparkles size={16} className="text-yellow-400" />
        AI Summary
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 size={14} className="animate-spin" /> Generating personalized summary...
        </div>
      ) : (
        <p className="text-zinc-400 text-sm leading-relaxed">{summary}</p>
      )}
    </div>
  );
}

function getFallbackSummary(result: FullAuditResult): string {
  const toolCount = result.results.length;
  const savingsCount = result.results.filter(
    (r) => r.bestRecommendation.type !== "already_optimal"
  ).length;

  if (result.totalMonthlySavings === 0) {
    return `Your AI stack of ${toolCount} tool${toolCount !== 1 ? "s" : ""} appears well-optimized. You're on the right plans for your team size and use cases. Keep reviewing quarterly as vendor pricing evolves.`;
  }

  return `Your team is spending $${fmt(result.totalCurrentSpend)}/mo across ${toolCount} AI tool${toolCount !== 1 ? "s" : ""}. We found ${savingsCount} optimization${savingsCount !== 1 ? "s" : ""} that could save $${fmt(result.totalMonthlySavings)}/mo ($${fmt(result.totalAnnualSavings)}/yr). The highest-impact change is ${result.results.sort((a, b) => b.bestRecommendation.monthlySavings - a.bestRecommendation.monthlySavings)[0]?.summary ?? "reviewing your largest spend"}. Acting on these recommendations pays back in the first month.`;
}

function LeadCaptureModal({
  shareId,
  onClose,
  savings,
}: {
  shareId: string;
  onClose: () => void;
  savings: number;
}) {
  const [form, setForm] = useState<LeadForm>({ email: "", companyName: "", role: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, shareId, monthlySavings: savings }),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6"
      >
        {!submitted ? (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail size={18} className="text-white" />
                <h3 className="text-white font-bold text-xl">Get your full report</h3>
              </div>
              <p className="text-zinc-400 text-sm">
                We'll email you a copy of this audit and notify you when new optimizations apply to your stack.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="you@company.com *"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-zinc-600"
              />
              <input
                type="text"
                placeholder="Company name (optional)"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-zinc-600"
              />
              <input
                type="text"
                placeholder="Role (optional)"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-zinc-600"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Send my report"}
            </button>

            <p className="text-zinc-600 text-xs text-center">
              No spam. Unsubscribe anytime. We never sell your data.
            </p>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 size={40} className="text-green-400 mx-auto" />
            <div>
              <h3 className="text-white font-bold text-xl">Report sent!</h3>
              <p className="text-zinc-400 text-sm mt-1">
                Check your inbox for the full audit.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shareId = searchParams.get("id") ?? "";

  const [auditResult, setAuditResult] = useState<FullAuditResult | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  // Load audit result from sessionStorage (set by AuditPage after running engine)
  useEffect(() => {
    const raw = sessionStorage.getItem("audit_result");
    const company = sessionStorage.getItem("audit_company");
    if (!raw) {
      // No result in session — redirect to audit form
      router.replace("/audit");
      return;
    }
    try {
      setAuditResult(JSON.parse(raw));
      setCompanyName(company ?? "");
    } catch {
      router.replace("/audit");
    }
  }, []);

  // Auto-show lead modal after 8 seconds (value shown first)
  useEffect(() => {
    if (!auditResult || leadCaptured) return;
    const timer = setTimeout(() => setShowLeadModal(true), 8000);
    return () => clearTimeout(timer);
  }, [auditResult, leadCaptured]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/audit/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!auditResult) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  const {
    results,
    totalCurrentSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    credexOpportunity,
    overallSummary,
  } = auditResult;

  const avgWaste = Math.round(results.reduce((s, r) => s + r.wasteScore, 0) / results.length);
  const optimizedCount = results.filter((r) => r.bestRecommendation.type !== "already_optimal").length;
  const isOptimal = totalMonthlySavings === 0;

  return (
    <>
      {/* Lead capture modal */}
      <AnimatePresence>
        {showLeadModal && (
          <LeadCaptureModal
            shareId={shareId}
            savings={totalMonthlySavings}
            onClose={() => {
              setShowLeadModal(false);
              setLeadCaptured(true);
            }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-zinc-950 text-zinc-300">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">

          {/* ── HEADER ─────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
                  <PieChart size={18} />
                </div>
                <span className="text-white font-bold">StackAudit</span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                {companyName ? `${companyName}'s AI Spend Audit` : "Your AI Spend Audit"}
              </h1>
              <p className="text-zinc-500 mt-1 text-sm">{overallSummary}</p>
            </div>

            {/* Share + email actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/30 transition-all"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={() => setShowLeadModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-all"
              >
                <Mail size={14} />
                Email report
              </button>
            </div>
          </div>

          {/* ── HERO METRICS ───────────────────────────────────────────────── */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Monthly savings — hero */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="md:col-span-2 rounded-2xl border border-white/5 bg-zinc-900/50 p-8 flex flex-col justify-between"
            >
              <p className="text-zinc-400 text-sm">Total monthly savings potential</p>
              <div>
                <div className={`text-6xl font-bold mt-3 ${isOptimal ? "text-green-400" : "text-green-400"}`}>
                  ${fmt(totalMonthlySavings)}
                  <span className="text-2xl text-zinc-500 font-normal">/mo</span>
                </div>
                <p className="text-zinc-500 mt-1 text-sm">
                  ${fmt(totalAnnualSavings)}/yr · from ${fmt(totalCurrentSpend)}/mo current spend
                </p>
              </div>
              {isOptimal && (
                <p className="text-green-400 text-sm mt-4 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Your AI stack is well-optimized. Nice work.
                </p>
              )}
            </motion.div>

            <div className="space-y-4">
              {/* Waste score */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6"
              >
                <p className="text-zinc-400 text-sm">Avg waste score</p>
                <div className={`text-4xl font-bold mt-2 ${getWasteColor(avgWaste)}`}>
                  {avgWaste}%
                </div>
                <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${getWasteBg(avgWaste)}`}
                    style={{ width: `${avgWaste}%` }}
                  />
                </div>
              </motion.div>

              {/* Tools audited */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6"
              >
                <p className="text-zinc-400 text-sm">Changes recommended</p>
                <div className="text-4xl font-bold mt-2 text-white">
                  {optimizedCount}
                  <span className="text-zinc-600 text-xl font-normal"> / {results.length}</span>
                </div>
                <p className="text-zinc-500 text-xs mt-1">tools need attention</p>
              </motion.div>
            </div>
          </div>

          {/* ── AI SUMMARY ─────────────────────────────────────────────────── */}
          <AISummaryBlock auditResult={auditResult} />

          {/* ── CREDEX CTA (only when savings > $500/mo) ───────────────────── */}
          {credexOpportunity && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <BadgeDollarSign size={20} className="text-indigo-400" />
                </div>
                <div>
                  <div className="text-white font-semibold flex items-center gap-2">
                    You qualify for Credex savings
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                      ${fmt(totalMonthlySavings)}/mo opportunity
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">
                    Credex sells discounted AI infrastructure credits — Cursor, Claude, ChatGPT Enterprise — from companies that overforecast. Teams saving ${fmt(totalMonthlySavings)}/mo on plan switches can often save an additional 20–40% more with credits.
                  </p>
                </div>
              </div>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              >
                Book a consultation
                <ExternalLink size={13} />
              </a>
            </motion.div>
          )}

          {/* ── PER-TOOL BREAKDOWN ─────────────────────────────────────────── */}
          <div>
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <TrendingDown size={18} className="text-zinc-400" />
              Per-tool breakdown
            </h2>
            <div className="space-y-4">
              {/* Sort: highest savings first, optimal last */}
              {[...results]
                .sort((a, b) => b.bestRecommendation.monthlySavings - a.bestRecommendation.monthlySavings)
                .map((result) => (
                  <ToolCard key={result.toolId} result={result} />
                ))}
            </div>
          </div>

          {/* ── SPEND DISTRIBUTION ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 space-y-5">
            <h2 className="text-white font-bold text-lg">Spend distribution</h2>
            {[...results]
              .sort((a, b) => b.currentMonthlySpend - a.currentMonthlySpend)
              .map((result) => {
                const pct = totalCurrentSpend > 0
                  ? Math.round((result.currentMonthlySpend / totalCurrentSpend) * 100)
                  : 0;
                return (
                  <div key={result.toolId} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300">{result.toolName}</span>
                      <span className="text-zinc-400 font-mono">
                        ${fmt(result.currentMonthlySpend)}/mo · {pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${getWasteBg(result.wasteScore)}`}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* ── LOW SAVINGS CTA (email capture when optimal) ───────────────── */}
          {isOptimal && !leadCaptured && (
            <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-white font-semibold">You're spending well 👍</div>
                <p className="text-zinc-400 text-sm mt-1">
                  We'll notify you when new optimizations apply to your stack as vendor pricing changes.
                </p>
              </div>
              <button
                onClick={() => setShowLeadModal(true)}
                className="shrink-0 flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-all"
              >
                Notify me
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* ── SHARE FOOTER ───────────────────────────────────────────────── */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-zinc-500 text-sm">
              Share this audit — identifying details are stripped from the public link.
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/30 transition-all"
              >
                <Share2 size={13} />
                Share link
              </button>
              <Link href="/audit">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-sm text-zinc-300 hover:bg-white/10 transition-all">
                  New audit
                  <ArrowRight size={13} />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}