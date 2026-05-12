export type ToolResult = {
  toolId: string;
  toolName: string;
  planId: string;
  planLabel: string;

  currentMonthlyCost: number;
  recommendedMonthlyCost: number;

  monthlySavings: number;
  annualSavings: number;

  utilizationScore: number;
  wasteScore: number;

  recommendedPlanId: string;
  recommendedPlanLabel: string;

  seats: number;
  useCase: string;

  overlapFlags?: string[];
  recommendations?: string[];
};

export type PublicAuditResult = {
  title?: string;
  results: ToolResult[];

  totalMonthlySavings: number;
  totalAnnualSavings: number;

  overallSummary?: string;
};