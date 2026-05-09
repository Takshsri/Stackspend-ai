export interface AuditInput {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  useCase: string;
}

export interface AuditResult {
  tool: string;
  currentPlan: string;
  recommendedPlan: string;
  currentSpend: number;
  optimizedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
  wasteScore: number;
}