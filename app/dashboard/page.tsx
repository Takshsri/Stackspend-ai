"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  PieChart,
  Plus,
  TrendingDown,
  ArrowRight,
  Loader2,
  Share2,
  Copy,
  Check,
  BadgeDollarSign,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { FullAuditResult } from "@/app/services/audit-engine";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type AuditRow = {
  id: string;
  share_id: string;
  company_name: string;
  team_size: string;
  audit_result: FullAuditResult;
  created_at: string;
};

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

function getWasteLabel(score: number) {
  if (score >= 60) return "High waste";
  if (score >= 30) return "Some waste";
  return "Optimized";
}

// ─── AUDIT CARD ───────────────────────────────────────────────────────────────

function AuditCard({ audit, onShare }: { audit: AuditRow; onShare: (id: string) => void }) {
  const result = audit.audit_result;
  if (!result) return null;

  const avgWaste = Math.round(
    result.results.reduce((s, r) => s + r.wasteScore, 0) / (result.results.length || 1)
  );
  const toolCount = result.results.length;
  const isOptimal = result.totalMonthlySavings === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 space-y-4 hover:border-white/10 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold">
              {audit.company_name || "Unnamed Audit"}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isOptimal
                  ? "bg-green-500/20 text-green-400"
                  : result.totalMonthlySavings > 500
                  ? "bg-red-500/20 text-red-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {isOptimal ? "Optimized" : `Save $${fmt(result.totalMonthlySavings)}/mo`}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock size={10} /> {timeAgo(audit.created_at)}
            </span>
            <span>{toolCount} tool{toolCount !== 1 ? "s" : ""} audited</span>
            <span>{audit.team_size} people</span>
          </div>
        </div>

        <button
          onClick={() => onShare(audit.share_id)}
          className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
          title="Copy share link"
        >
          <Share2 size={14} />
        </button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-800/50 rounded-xl p-3">
          <p className="text-zinc-500 text-xs">Monthly savings</p>
          <p className="text-green-400 font-bold text-lg mt-0.5">
            ${fmt(result.totalMonthlySavings)}
          </p>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-3">
          <p className="text-zinc-500 text-xs">Annual savings</p>
          <p className="text-white font-bold text-lg mt-0.5">
            ${fmt(result.totalAnnualSavings)}
          </p>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-3">
          <p className="text-zinc-500 text-xs">Waste score</p>
          <p className={`font-bold text-lg mt-0.5 ${getWasteColor(avgWaste)}`}>
            {avgWaste}%
          </p>
        </div>
      </div>

      {/* Tool breakdown mini-bars */}
      <div className="space-y-2">
        {result.results.slice(0, 3).map((r) => (
          <div key={r.toolId} className="flex items-center gap-3">
            <span className="text-zinc-400 text-xs w-28 truncate shrink-0">{r.toolName}</span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${getWasteBg(r.wasteScore)}`}
                style={{ width: `${Math.max(4, r.wasteScore)}%` }}
              />
            </div>
            <span className="text-zinc-500 text-xs w-16 text-right shrink-0">
              ${fmt(r.currentMonthlySpend)}/mo
            </span>
          </div>
        ))}
        {result.results.length > 3 && (
          <p className="text-zinc-600 text-xs">+{result.results.length - 3} more tools</p>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/results?id=${audit.share_id}`}
        onClick={() => {
          sessionStorage.setItem("audit_result", JSON.stringify(result));
          sessionStorage.setItem("audit_company", audit.company_name ?? "");
          sessionStorage.setItem("audit_share_id", audit.share_id);
        }}
        className="flex items-center justify-between w-full text-sm text-zinc-400 hover:text-white transition-colors group"
      >
        <span>View full report</span>
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </motion.div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <BarChart3 size={28} className="text-zinc-500" />
      </div>
      <div>
        <p className="text-white font-semibold">No audits yet</p>
        <p className="text-zinc-500 text-sm mt-1">
          Run your first AI spend audit to see savings opportunities.
        </p>
      </div>
      <Link href="/audit">
        <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-zinc-200 transition-all mt-2">
          <Plus size={14} />
          Start first audit
        </button>
      </Link>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("audits")
      .select("id, share_id, company_name, team_size, audit_result, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
    } else {
      setAudits((data as AuditRow[]) || []);
    }
    setLoading(false);
  };

  const handleShare = (shareId: string) => {
    const url = `${window.location.origin}/audit/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Derived stats from real audit data ──────────────────────────────────────

  const totalSavings = audits.reduce(
    (s, a) => s + (a.audit_result?.totalMonthlySavings ?? 0),
    0
  );
  const totalAnnual = audits.reduce(
    (s, a) => s + (a.audit_result?.totalAnnualSavings ?? 0),
    0
  );
  const avgWaste =
    audits.length > 0
      ? Math.round(
          audits.reduce((s, a) => {
            const results = a.audit_result?.results ?? [];
            if (!results.length) return s;
            return (
              s +
              results.reduce((rs, r) => rs + r.wasteScore, 0) / results.length
            );
          }, 0) / audits.length
        )
      : 0;

  const highSavingsCount = audits.filter(
    (a) => (a.audit_result?.totalMonthlySavings ?? 0) > 500
  ).length;

  const optimizedCount = audits.filter(
    (a) => (a.audit_result?.totalMonthlySavings ?? 0) === 0
  ).length;

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-300">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-zinc-800 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 space-y-8">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-lg">
              <PieChart size={20} />
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl">StackAudit</h1>
              <p className="text-zinc-500 text-sm">AI spend dashboard</p>
            </div>
          </div>

          <Link href="/audit">
            <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-zinc-200 transition-all">
              <Plus size={14} />
              New audit
            </button>
          </Link>
        </div>

        {/* ── SUMMARY METRICS (from real data) ────────────────────────────── */}
        {audits.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            {/* Total monthly savings */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="md:col-span-2 rounded-2xl border border-white/5 bg-zinc-900/50 p-6"
            >
              <p className="text-zinc-400 text-sm">Total savings identified</p>
              <div className="text-4xl font-bold text-green-400 mt-2">
                ${fmt(totalSavings)}
                <span className="text-xl text-zinc-500 font-normal">/mo</span>
              </div>
              <p className="text-zinc-500 text-xs mt-1">${fmt(totalAnnual)}/yr across {audits.length} audit{audits.length !== 1 ? "s" : ""}</p>
            </motion.div>

            {/* Avg waste score */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6"
            >
              <p className="text-zinc-400 text-sm">Avg waste score</p>
              <div className={`text-4xl font-bold mt-2 ${getWasteColor(avgWaste)}`}>
                {avgWaste}%
              </div>
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${getWasteBg(avgWaste)}`}
                  style={{ width: `${avgWaste}%` }}
                />
              </div>
            </motion.div>

            {/* Audit breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 space-y-3"
            >
              <p className="text-zinc-400 text-sm">Audit status</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-red-400">
                    <AlertTriangle size={12} /> High savings
                  </span>
                  <span className="text-white font-semibold">{highSavingsCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-400">
                    <CheckCircle2 size={12} /> Optimized
                  </span>
                  <span className="text-white font-semibold">{optimizedCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <BarChart3 size={12} /> Total
                  </span>
                  <span className="text-white font-semibold">{audits.length}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── CREDEX BANNER (if any audit has >$500 savings) ──────────────── */}
        {highSavingsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <BadgeDollarSign size={20} className="text-indigo-400 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">
                  {highSavingsCount} audit{highSavingsCount !== 1 ? "s" : ""} qualify for Credex credits
                </p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Credex sells discounted AI infrastructure credits — often 20–40% below retail. Book a free consultation.
                </p>
              </div>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all"
            >
              Book consultation
              <ArrowRight size={12} />
            </a>
          </motion.div>
        )}

        {/* ── AUDIT LIST ──────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <TrendingDown size={16} className="text-zinc-400" />
              Recent audits
            </h2>
            {copiedId && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <Check size={12} /> Link copied
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-zinc-600" />
            </div>
          ) : audits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {audits.map((audit) => (
                <AuditCard
                  key={audit.id}
                  audit={audit}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div className="border-t border-white/5 pt-6 flex items-center justify-between text-xs text-zinc-600">
          <span>StackAudit by Credex</span>
          <Link href="/audit" className="hover:text-zinc-400 transition-colors">
            Run another audit →
          </Link>
        </div>

      </div>
    </div>
  );
}