export interface ToolInput {
  tool: string;
  plan: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditResult {
  tool: string;
  currentSpend: number;
  recommendedPlan: string;
  estimatedSavings: number;
  reason: string;
}