import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AuditReportView from "../AuditReportView";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type ToolResult = {
  wasteScore: number;
  toolId: string;
  toolName: string;
  planId: string;
  planLabel: string;
  currentMonthlyCost: number;
  recommendedPlanId: string;
  recommendedPlanLabel: string;
  recommendedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  utilizationScore: number;
  overlapFlags: string[];
  recommendations: string[];
  useCase: string;
  seats: number;
};

export type PublicAuditResult = {
  results: ToolResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  overallSummary: string;
};

type AuditRow = {
  share_id: string;
  company_name: string;
  team_size: string;
  public_result: PublicAuditResult;
  created_at: string;

};

// ─── SERVER DATA ──────────────────────────────────────────────────────────────

async function getAudit(shareId: string): Promise<AuditRow | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("audits")
    .select(
      "share_id, company_name, team_size, public_result, created_at"
    )
    .eq("share_id", shareId)
    .single();

  if (error || !data) return null;

  return data as AuditRow;
}

// ─── METADATA ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const audit = await getAudit(id);

  if (!audit) {
    return {
      title: "Audit not found — StackAudit",
    };
  }

  const savings = audit.public_result?.totalAnnualSavings ?? 0;
  const toolCount = audit.public_result?.results?.length ?? 0;

  const title = `AI Stack Audit — ${toolCount} tool${
    toolCount !== 1 ? "s" : ""
  } reviewed`;

  const description =
    savings > 0
      ? `This audit found $${savings.toLocaleString()} in potential annual savings across ${toolCount} AI tools.`
      : `A StackAudit report reviewing ${toolCount} AI tools for efficiency and cost optimisation.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/audit/${id}`,
      siteName: "StackAudit",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicAuditPage({
  params,
}: Props) {
  const { id } = await params;

  const audit = await getAudit(id);

  if (!audit) notFound();


const transformedResult = {
  ...audit.public_result,

  title: `${audit.company_name} AI Stack Audit`,

  results: audit.public_result.results.map((r: any) => ({
    toolId: r.toolId,
    toolName: r.toolName,
    planId: r.currentPlanId,
    planLabel: r.currentPlanId,
    currentMonthlyCost: r.currentMonthlySpend,

    recommendedPlanId:
      r.bestRecommendation?.recommendedPlanId || r.currentPlanId,

    recommendedPlanLabel:
      r.bestRecommendation?.recommendedPlanId || r.currentPlanId,

    recommendedMonthlyCost:
      r.bestRecommendation?.recommendedMonthlySpend ||
      r.currentMonthlySpend,

    monthlySavings:
      r.bestRecommendation?.monthlySavings || 0,

    annualSavings:
      r.bestRecommendation?.annualSavings || 0,

    utilizationScore: 100 - r.wasteScore,

    wasteScore: r.wasteScore,

    overlapFlags: [],

    recommendations:
      r.recommendations?.map((rec: any) => rec.reasoning) || [],

    useCase: r.useCase,
    seats: r.seats,
  })),
};
return (
  <AuditReportView
    shareId={audit.share_id}
    teamSize={audit.team_size}
    result={transformedResult}
    createdAt={audit.created_at}
  />
);
}