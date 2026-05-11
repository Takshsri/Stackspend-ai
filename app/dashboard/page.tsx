"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  PieChart, Plus, TrendingDown, ArrowRight, Loader2,
  Share2, Check, BadgeDollarSign, BarChart3,
  CheckCircle2, ChevronDown, ChevronUp,
} from "lucide-react";
import type { FullAuditResult } from "@/app/services/audit-engine";
import { useAuthGuard } from "@/lib/useAuthGuard";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type AuditRow = {
  id: string;
  share_id: string | null;
  company_name: string;
  team_size: string;
  audit_result: FullAuditResult;
  created_at: string;
};

const PAGE_SIZE = 2;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function wasteTextColor(score: number) {
  if (score >= 60) return "text-red-400";
  if (score >= 30) return "text-yellow-400";
  return "text-green-400";
}

function wasteBgColor(score: number) {
  if (score >= 60) return "bg-red-500";
  if (score >= 30) return "bg-yellow-500";
  return "bg-green-500";
}

// ─── AUDIT CARD ───────────────────────────────────────────────────────────────

function AuditCard({
  audit,
  onShare,
  copiedId,
  index,
  newRef,
}: {
  audit: AuditRow;
  // accepts share_id (possibly null) + fallback audit.id
  onShare: (shareId: string | null, auditId: string) => void;
  copiedId: string | null;
  index: number;
  newRef?: React.Ref<HTMLDivElement>;
}) {
  const result = audit.audit_result;
  if (!result) return null;

  const avgWaste = Math.round(
    result.results.reduce((s, r) => s + r.wasteScore, 0) /
      (result.results.length || 1)
  );
  const isOptimal = result.totalMonthlySavings === 0;

  // Use share_id if available, otherwise fall back to audit.id
  const cardId = audit.share_id ?? audit.id;

  return (
    <motion.div
      ref={newRef as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-colors"
    >
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-zinc-800 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className="text-zinc-600 font-mono text-xs">#{index + 1}</span>

          <span className="text-white font-semibold text-sm truncate">
            {audit.company_name || "Unnamed Audit"}
          </span>

          {/* Savings badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
            isOptimal
              ? "bg-green-500/20 text-green-400"
              : result.totalMonthlySavings > 500
              ? "bg-red-500/20 text-red-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}>
            {isOptimal
              ? "Optimized ✓"
              : `Save $${fmt(result.totalMonthlySavings)}/mo`}
          </span>

          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <span>{timeAgo(audit.created_at)}</span>
            <span>·</span>
            <span>{result.results.length} tool{result.results.length !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{audit.team_size}</span>
          </div>
        </div>

        {/* Share button — fixed: passes both shareId and auditId */}
        <button
          onClick={() => onShare(audit.share_id, audit.id)}
          className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 shrink-0"
          title="Copy share link"
        >
          {copiedId === cardId
            ? <Check size={14} className="text-green-400" />
            : <Share2 size={14} />}
        </button>
      </div>

      {/* ── BODY ── */}
      <div className="flex items-center gap-4 px-5 py-4 flex-wrap">

        {/* Metric pills */}
        <div className="flex gap-2 shrink-0">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-center min-w-[72px]">
            <div className="text-zinc-500 text-xs mb-1">Monthly</div>
            <div className="text-green-400 font-bold text-sm">
              ${fmt(result.totalMonthlySavings)}
            </div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-center min-w-[72px]">
            <div className="text-zinc-500 text-xs mb-1">Annual</div>
            <div className="text-white font-bold text-sm">
              ${fmt(result.totalAnnualSavings)}
            </div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-center min-w-[72px]">
            <div className="text-zinc-500 text-xs mb-1">Waste</div>
            <div className={`font-bold text-sm ${wasteTextColor(avgWaste)}`}>
              {avgWaste}%
            </div>
          </div>
        </div>

        {/* Tool spend bars */}
        <div className="flex-1 min-w-[160px] flex flex-col gap-1.5">
          {result.results.slice(0, 3).map((r) => (
            <div key={r.toolId} className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs w-24 truncate shrink-0">
                {r.toolName}
              </span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${wasteBgColor(r.wasteScore)}`}
                  style={{ width: `${Math.max(4, r.wasteScore)}%` }}
                />
              </div>
              <span className="text-zinc-500 text-xs w-14 text-right shrink-0">
                ${fmt(r.currentMonthlySpend)}/mo
              </span>
            </div>
          ))}
          {result.results.length > 3 && (
            <span className="text-zinc-600 text-xs">
              +{result.results.length - 3} more
            </span>
          )}
        </div>

        {/* View report link */}
        <Link
          href={`/results?id=${cardId}`}
          onClick={() => {
            sessionStorage.setItem("audit_result", JSON.stringify(result));
            sessionStorage.setItem("audit_company", audit.company_name ?? "");
            sessionStorage.setItem("audit_share_id", cardId);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-sm font-medium transition-all shrink-0 group"
        >
          View report
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center">
        <BarChart3 size={28} className="text-zinc-600" />
      </div>
      <div>
        <p className="text-white font-semibold">No audits yet</p>
        <p className="text-zinc-500 text-sm mt-1">
          Run your first AI spend audit to see savings opportunities.
        </p>
      </div>
      <Link href="/audit">
        <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-zinc-200 transition-all mt-2">
          <Plus size={14} /> Start first audit
        </button>
      </Link>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  useAuthGuard();
  const [allAudits, setAllAudits] = useState<AuditRow[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const prevCount = useRef(PAGE_SIZE);
  const newCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAudits();
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchAudits = async () => {
    setLoading(true);
    const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) return;

const { data, error } = await supabase
  .from("audits")
  .select("id, share_id, company_name, team_size, audit_result, created_at")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error.message);
    } else {
      setAllAudits((data as AuditRow[]) || []);
    }
    setLoading(false);
  };

  // ── Pagination ──────────────────────────────────────────────────────────────

  const visibleAudits = allAudits.slice(0, visibleCount);
  const hasMore = visibleCount < allAudits.length;
  const remaining = allAudits.length - visibleCount;

  const handleLoadMore = async () => {
    setLoadingMore(true);
    prevCount.current = visibleCount;
    await new Promise((r) => setTimeout(r, 300));
    setVisibleCount((p) => p + PAGE_SIZE);
    setLoadingMore(false);
    setTimeout(
      () => newCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      120
    );
  };

  // ── Share — fixed: handles null share_id + clipboard fallback ──────────────

  const handleShare = async (shareId: string | null, auditId: string) => {
    const id = shareId ?? auditId; // fall back to audit.id if share_id is null
    const url = `${window.location.origin}/audit/${id}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for HTTP or clipboard permission denied
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Derived stats (always from ALL audits) ──────────────────────────────────

  const totalSavings = allAudits.reduce(
    (s, a) => s + (a.audit_result?.totalMonthlySavings ?? 0), 0
  );
  const totalAnnual = allAudits.reduce(
    (s, a) => s + (a.audit_result?.totalAnnualSavings ?? 0), 0
  );
  const avgWaste =
    allAudits.length > 0
      ? Math.round(
          allAudits.reduce((s, a) => {
            const rs = a.audit_result?.results ?? [];
            return rs.length
              ? s + rs.reduce((x, r) => x + r.wasteScore, 0) / rs.length
              : s;
          }, 0) / allAudits.length
        )
      : 0;
  const highSavingsCount = allAudits.filter(
    (a) => (a.audit_result?.totalMonthlySavings ?? 0) > 500
  ).length;
  const optimizedCount = allAudits.filter(
    (a) => (a.audit_result?.totalMonthlySavings ?? 0) === 0
  ).length;

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">

      {/* Floating back to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg hover:bg-zinc-200 transition-all"
          >
            <ChevronUp size={13} /> Top
          </motion.button>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <PieChart size={20} className="text-black" />
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl">StackAudit</h1>
              <p className="text-zinc-500 text-sm">AI spend dashboard</p>
            </div>
          </div>
          <Link href="/audit">
            <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-zinc-200 transition-all">
              <Plus size={14} /> New audit
            </button>
          </Link>
        </div>

        {/* ── SUMMARY METRICS ── */}
        {allAudits.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {/* Total savings */}
            <div className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-zinc-400 text-sm">Total savings identified</p>
              <p className="text-green-400 text-4xl font-bold mt-2">
                ${fmt(totalSavings)}
                <span className="text-xl text-zinc-600 font-normal">/mo</span>
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                ${fmt(totalAnnual)}/yr · {allAudits.length} audit{allAudits.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Avg waste */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-zinc-400 text-sm">Avg waste</p>
              <p className={`text-4xl font-bold mt-2 ${wasteTextColor(avgWaste)}`}>
                {avgWaste}%
              </p>
              <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${wasteBgColor(avgWaste)}`}
                  style={{ width: `${avgWaste}%` }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-zinc-400 text-sm mb-3">Status</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">⚠ High savings</span>
                  <span className="text-white font-bold">{highSavingsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">✓ Optimized</span>
                  <span className="text-white font-bold">{optimizedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">∑ Total</span>
                  <span className="text-white font-bold">{allAudits.length}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── CREDEX BANNER ── */}
        {highSavingsCount > 0 && (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <BadgeDollarSign size={20} className="text-indigo-400 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">
                  {highSavingsCount} audit{highSavingsCount !== 1 ? "s" : ""} qualify for Credex credits
                </p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Discounted AI credits — often 20–40% below retail.
                </p>
              </div>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0"
            >
              Book consultation <ArrowRight size={12} />
            </a>
          </div>
        )}

        {/* ── AUDIT LIST ── */}
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <TrendingDown size={16} className="text-zinc-500" />
              Recent audits
              <span className="text-zinc-600 font-normal text-sm">
                — {Math.min(visibleCount, allAudits.length)} of {allAudits.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={24} className="animate-spin text-zinc-600" />
            </div>
          ) : allAudits.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Vertical list — full width, one per row */}
              <div className="flex flex-col gap-3">
                {visibleAudits.map((audit, i) => (
                  <AuditCard
                    key={audit.id}
                    audit={audit}
                    onShare={handleShare}
                    copiedId={copiedId}
                    index={i}
                    newRef={i === prevCount.current ? newCardRef : undefined}
                  />
                ))}
              </div>

              {/* ── LOAD MORE ── */}
              {hasMore && (
                <div className="flex flex-col items-center gap-3 mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-50 transition-all text-sm"
                  >
                    {loadingMore ? (
                      <><Loader2 size={14} className="animate-spin" /> Loading...</>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        Load {Math.min(PAGE_SIZE, remaining)} more
                        <span className="text-zinc-600 text-xs">({remaining} left)</span>
                      </>
                    )}
                  </button>

                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5">
                    {allAudits.map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-full transition-all duration-300 h-1.5 ${
                          i < visibleCount ? "bg-white w-4" : "bg-zinc-700 w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-zinc-600 text-xs">
                    {Math.min(visibleCount, allAudits.length)} / {allAudits.length}
                  </span>
                </div>
              )}

              {/* All loaded */}
              {!hasMore && allAudits.length > PAGE_SIZE && (
                <div className="flex flex-col items-center gap-2 mt-6">
                  <div className="flex items-center gap-2 text-zinc-600 text-xs">
                    <CheckCircle2 size={14} /> All {allAudits.length} audits loaded
                  </div>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-400 text-xs transition-colors border border-zinc-800 px-3 py-1.5 rounded-full"
                  >
                    <ChevronUp size={12} /> Back to top
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="border-t border-zinc-800 pt-6 flex justify-between text-xs text-zinc-600">
          <span>StackAudit by Credex</span>
          <Link href="/audit" className="hover:text-zinc-400 transition-colors">
            Run another audit →
          </Link>
        </div>

      </div>
    </div>
  );
}