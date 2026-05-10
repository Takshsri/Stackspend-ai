"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  PieChart, Plus, TrendingDown, ArrowRight, Loader2,
  Share2, Check, BadgeDollarSign, Clock, BarChart3,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
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

function wasteColor(score: number) {
  if (score >= 60) return "#dc2626";
  if (score >= 30) return "#d97706";
  return "#16a34a";
}

function wasteBg(score: number) {
  if (score >= 60) return "#ef4444";
  if (score >= 30) return "#f59e0b";
  return "#22c55e";
}

// ─── STYLES (works in light AND dark mode) ────────────────────────────────────
// We avoid CSS variables for backgrounds since --card == white in light mode.
// Instead use explicit colors that are always visible.

const S = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f4f5",   // always light-grey page bg
    color: "#18181b",
  } as React.CSSProperties,

  // Dark mode override applied via className="dark" on html element
  card: {
    background: "#ffffff",
    border: "2px solid #e4e4e7",
    borderRadius: 16,
    overflow: "hidden",
  } as React.CSSProperties,

  cardHover: {
    border: "2px solid #a1a1aa",
  } as React.CSSProperties,

  cardHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #e4e4e7",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap" as const,
    background: "#fafafa",
  } as React.CSSProperties,

  cardBody: {
    padding: "16px 20px",
    display: "flex",
    gap: 16,
    flexWrap: "wrap" as const,
    alignItems: "center",
    background: "#ffffff",
  } as React.CSSProperties,

  pill: {
    background: "#f1f5f9",
    borderRadius: 12,
    padding: "10px 14px",
    minWidth: 80,
    textAlign: "center" as const,
    border: "1px solid #e2e8f0",
  } as React.CSSProperties,

  pillLabel: {
    fontSize: 11,
    color: "#71717a",
    marginBottom: 4,
  } as React.CSSProperties,

  metaText: {
    fontSize: 12,
    color: "#71717a",
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#18181b",
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: 0,
  } as React.CSSProperties,

  statCard: {
    background: "#ffffff",
    border: "2px solid #e4e4e7",
    borderRadius: 16,
    padding: "20px 24px",
  } as React.CSSProperties,

  btn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    borderRadius: 99,
    border: "none",
    background: "#18181b",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  } as React.CSSProperties,

  btnOutline: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    borderRadius: 99,
    border: "2px solid #d4d4d8",
    background: "transparent",
    color: "#52525b",
    fontSize: 13,
    cursor: "pointer",
  } as React.CSSProperties,
};

// ─── AUDIT CARD ───────────────────────────────────────────────────────────────

function AuditCard({
  audit, onShare, copiedId, index, newRef,
}: {
  audit: AuditRow;
  onShare: (id: string) => void;
  copiedId: string | null;
  index: number;
  newRef?: React.Ref<HTMLDivElement>;
}) {
  const [hovered, setHovered] = useState(false);
  const result = audit.audit_result;
  if (!result) return null;

  const avgWaste = Math.round(
    result.results.reduce((s, r) => s + r.wasteScore, 0) / (result.results.length || 1)
  );
  const isOptimal = result.totalMonthlySavings === 0;

  const badgeStyle: React.CSSProperties = isOptimal
    ? { background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }
    : result.totalMonthlySavings > 500
    ? { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }
    : { background: "#fef9c3", color: "#d97706", border: "1px solid #fde68a" };

  return (
    <motion.div
      ref={newRef as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{ ...S.card, ...(hovered ? S.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── HEADER ── */}
      <div style={S.cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          <span style={{ ...S.metaText, fontFamily: "monospace", color: "#a1a1aa" }}>#{index + 1}</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#18181b" }}>
            {audit.company_name || "Unnamed Audit"}
          </span>
          <span style={{
            ...badgeStyle,
            padding: "3px 10px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}>
            {isOptimal ? "Optimized ✓" : `Save $${fmt(result.totalMonthlySavings)}/mo`}
          </span>
          <div style={{ display: "flex", gap: 10, ...S.metaText }}>
            <span>🕐 {timeAgo(audit.created_at)}</span>
            <span>{result.results.length} tool{result.results.length !== 1 ? "s" : ""}</span>
            <span>{audit.team_size}</span>
          </div>
        </div>
        <button
          onClick={() => onShare(audit.share_id)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", padding: 4 }}
          title="Copy share link"
        >
          {copiedId === audit.share_id
            ? <Check size={14} color="#16a34a" />
            : <Share2 size={14} />}
        </button>
      </div>

      {/* ── BODY ── */}
      <div style={S.cardBody}>

        {/* Metric pills */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <div style={S.pill}>
            <div style={S.pillLabel}>Monthly</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#16a34a" }}>
              ${fmt(result.totalMonthlySavings)}
            </div>
          </div>
          <div style={S.pill}>
            <div style={S.pillLabel}>Annual</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#18181b" }}>
              ${fmt(result.totalAnnualSavings)}
            </div>
          </div>
          <div style={S.pill}>
            <div style={S.pillLabel}>Waste</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: wasteColor(avgWaste) }}>
              {avgWaste}%
            </div>
          </div>
        </div>

        {/* Tool bars */}
        <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 7 }}>
          {result.results.slice(0, 3).map((r) => (
            <div key={r.toolId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ ...S.metaText, width: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
                {r.toolName}
              </span>
              <div style={{ flex: 1, height: 6, background: "#e4e4e7", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${Math.max(4, r.wasteScore)}%`, height: "100%", background: wasteBg(r.wasteScore), borderRadius: 99 }} />
              </div>
              <span style={{ ...S.metaText, width: 58, textAlign: "right", flexShrink: 0 }}>
                ${fmt(r.currentMonthlySpend)}/mo
              </span>
            </div>
          ))}
          {result.results.length > 3 && (
            <span style={{ ...S.metaText }}>+{result.results.length - 3} more</span>
          )}
        </div>

        {/* View report */}
        <Link
          href={`/results?id=${audit.share_id}`}
          onClick={() => {
            sessionStorage.setItem("audit_result", JSON.stringify(result));
            sessionStorage.setItem("audit_company", audit.company_name ?? "");
            sessionStorage.setItem("audit_share_id", audit.share_id);
          }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 99,
            border: "2px solid #d4d4d8", color: "#52525b",
            fontSize: 13, fontWeight: 500, textDecoration: "none",
            background: "#ffffff", whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          View report <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, border: "2px solid #e4e4e7", background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BarChart3 size={28} color="#a1a1aa" />
      </div>
      <p style={{ fontWeight: 600, color: "#18181b", margin: 0 }}>No audits yet</p>
      <p style={{ color: "#71717a", fontSize: 14, margin: 0 }}>Run your first AI spend audit to see savings opportunities.</p>
      <Link href="/audit">
        <button style={{ ...S.btn, marginTop: 8 }}><Plus size={14} /> Start first audit</button>
      </Link>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
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
    const { data, error } = await supabase
      .from("audits")
      .select("id, share_id, company_name, team_size, audit_result, created_at")
      .order("created_at", { ascending: false });
    if (!error) setAllAudits((data as AuditRow[]) || []);
    setLoading(false);
  };

  const visibleAudits = allAudits.slice(0, visibleCount);
  const hasMore = visibleCount < allAudits.length;
  const remaining = allAudits.length - visibleCount;

  const handleLoadMore = async () => {
    setLoadingMore(true);
    prevCount.current = visibleCount;
    await new Promise((r) => setTimeout(r, 300));
    setVisibleCount((p) => p + PAGE_SIZE);
    setLoadingMore(false);
    setTimeout(() => newCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  const handleShare = (shareId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/audit/${shareId}`);
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Derived stats
  const totalSavings = allAudits.reduce((s, a) => s + (a.audit_result?.totalMonthlySavings ?? 0), 0);
  const totalAnnual = allAudits.reduce((s, a) => s + (a.audit_result?.totalAnnualSavings ?? 0), 0);
  const avgWaste = allAudits.length > 0
    ? Math.round(allAudits.reduce((s, a) => {
        const rs = a.audit_result?.results ?? [];
        return rs.length ? s + rs.reduce((x, r) => x + r.wasteScore, 0) / rs.length : s;
      }, 0) / allAudits.length) : 0;
  const highSavingsCount = allAudits.filter((a) => (a.audit_result?.totalMonthlySavings ?? 0) > 500).length;
  const optimizedCount = allAudits.filter((a) => (a.audit_result?.totalMonthlySavings ?? 0) === 0).length;

  return (
    <div style={S.page}>

      {/* Floating back to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{ ...S.btn, position: "fixed", bottom: 24, right: 24, zIndex: 50, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            <ChevronUp size={13} /> Top
          </motion.button>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PieChart size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 22, color: "#18181b", margin: 0 }}>StackAudit</h1>
              <p style={{ color: "#71717a", fontSize: 13, margin: 0 }}>AI spend dashboard</p>
            </div>
          </div>
          <Link href="/audit">
            <button style={S.btn}><Plus size={14} /> New audit</button>
          </Link>
        </div>

        {/* ── SUMMARY METRICS ── */}
        {allAudits.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div style={{ ...S.statCard, gridColumn: "span 2" }}>
              <p style={{ color: "#71717a", fontSize: 13, margin: "0 0 8px" }}>Total savings identified</p>
              <p style={{ fontSize: 36, fontWeight: 800, color: "#16a34a", margin: 0 }}>
                ${fmt(totalSavings)}<span style={{ fontSize: 18, fontWeight: 400, color: "#a1a1aa" }}>/mo</span>
              </p>
              <p style={{ color: "#71717a", fontSize: 12, margin: "4px 0 0" }}>
                ${fmt(totalAnnual)}/yr across {allAudits.length} audit{allAudits.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div style={S.statCard}>
              <p style={{ color: "#71717a", fontSize: 13, margin: "0 0 8px" }}>Avg waste score</p>
              <p style={{ fontSize: 36, fontWeight: 800, color: wasteColor(avgWaste), margin: 0 }}>{avgWaste}%</p>
              <div style={{ height: 6, background: "#e4e4e7", borderRadius: 99, marginTop: 10, overflow: "hidden" }}>
                <div style={{ width: `${avgWaste}%`, height: "100%", background: wasteBg(avgWaste), borderRadius: 99 }} />
              </div>
            </div>

            <div style={S.statCard}>
              <p style={{ color: "#71717a", fontSize: 13, margin: "0 0 12px" }}>Audit status</p>
              {[
                { label: "⚠ High savings", count: highSavingsCount, color: "#dc2626" },
                { label: "✓ Optimized", count: optimizedCount, color: "#16a34a" },
                { label: "# Total", count: allAudits.length, color: "#18181b" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: s.color }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: "#18181b" }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CREDEX BANNER ── */}
        {highSavingsCount > 0 && (
          <div style={{ background: "#eef2ff", border: "2px solid #c7d2fe", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <BadgeDollarSign size={20} color="#6366f1" />
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#3730a3", margin: 0 }}>
                  {highSavingsCount} audit{highSavingsCount !== 1 ? "s" : ""} qualify for Credex credits
                </p>
                <p style={{ color: "#6366f1", fontSize: 12, margin: "2px 0 0" }}>
                  Discounted AI infrastructure credits — often 20–40% below retail.
                </p>
              </div>
            </div>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#6366f1", color: "white", borderRadius: 99, padding: "8px 16px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              Book consultation <ArrowRight size={12} />
            </a>
          </div>
        )}

        {/* ── AUDIT LIST ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={S.sectionTitle}>
              <TrendingDown size={16} color="#71717a" />
              Recent audits
              {allAudits.length > 0 && (
                <span style={{ color: "#a1a1aa", fontWeight: 400, fontSize: 14 }}>
                  — {Math.min(visibleCount, allAudits.length)} of {allAudits.length}
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <Loader2 size={24} className="animate-spin" color="#a1a1aa" />
            </div>
          ) : allAudits.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Vertical list — full width, always visible */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

              {/* Load more */}
              {hasMore && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 24 }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    style={{ ...S.btnOutline, opacity: loadingMore ? 0.5 : 1 }}
                  >
                    {loadingMore
                      ? <><Loader2 size={14} className="animate-spin" /> Loading...</>
                      : <><ChevronDown size={14} /> Load {Math.min(PAGE_SIZE, remaining)} more <span style={{ color: "#a1a1aa", fontSize: 12 }}>({remaining} left)</span></>
                    }
                  </button>

                  {/* Progress dots */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {allAudits.map((_, i) => (
                      <div key={i} style={{
                        height: 6, borderRadius: 99, transition: "all 0.3s",
                        width: i < visibleCount ? 16 : 6,
                        background: i < visibleCount ? "#18181b" : "#d4d4d8",
                      }} />
                    ))}
                  </div>
                  <span style={{ color: "#a1a1aa", fontSize: 12 }}>
                    {Math.min(visibleCount, allAudits.length)} / {allAudits.length}
                  </span>
                </div>
              )}

              {/* All loaded */}
              {!hasMore && allAudits.length > PAGE_SIZE && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#a1a1aa", fontSize: 12 }}>
                    <CheckCircle2 size={14} /> All {allAudits.length} audits loaded
                  </div>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    style={{ ...S.btnOutline, fontSize: 12, padding: "6px 14px" }}
                  >
                    <ChevronUp size={12} /> Back to top
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e4e4e7", paddingTop: 24, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#a1a1aa" }}>
          <span>StackAudit by Credex</span>
          <Link href="/audit" style={{ color: "#a1a1aa", textDecoration: "none" }}>Run another audit →</Link>
        </div>

      </div>
    </div>
  );
}