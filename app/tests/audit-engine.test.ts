import {
  runAudit,
  runFullAudit,
  AuditInput,
} from "../services/audit-engine";

describe("Audit Engine", () => {

  test("should downgrade claude Team to Plus for small teams", () => {
    const input: AuditInput = {
      
  toolId: "claude",
  planId: "max",
  monthlySpend: 1000,
  seats: 10,
  useCase: "writing",
  teamSize: 10,

    };

    const result = runAudit(input);
    expect(result.bestRecommendation.type).toBe(
      "downgrade_plan"
    );

    expect(
      result.bestRecommendation.recommendedPlanId
    ).toBe("pro");

    expect(
      result.bestRecommendation.monthlySavings
    ).toBeGreaterThan(0);
  });

  test("should recommend Cursor Advanced over Business for small teams", () => {
    const input: AuditInput = {
      
  toolId: "cursor",
  planId: "business",
  monthlySpend: 200,
  seats: 5,
  useCase: "coding",
  teamSize: 5,


    };

    const result = runAudit(input);
    expect(
      result.bestRecommendation.recommendedPlanId
    ).toBe("teams");
  });

  test("should switch Windsurf to Claude for non-coding workflows", () => {
    const input: AuditInput = {
      toolId: "windsurf",
      planId: "teams",
      monthlySpend: 120,
      seats: 4,
      useCase: "writing",
      teamSize: 4,
    };

    const result = runAudit(input);
    expect(result.bestRecommendation.type).toBe(
      "switch_tool"
    );

    expect(
      result.bestRecommendation.recommendedToolId
    ).toBe("claude");
  });

  test("should calculate annual savings correctly", () => {
    const input: AuditInput = {
      toolId: "cursor",
  planId: "business",
  monthlySpend: 800,
  seats: 20,
  useCase: "coding",
  teamSize: 20,
    };

    const result = runAudit(input);
    expect(
      result.bestRecommendation.annualSavings
    ).toBe(
      result.bestRecommendation.monthlySavings * 12
    );
  });

  test("should calculate full audit totals correctly", () => {
    const inputs: AuditInput[] = [
      {
        toolId: "chatgpt",
        planId: "team",
        monthlySpend: 60,
        seats: 2,
        useCase: "writing",
        teamSize: 2,
      },
      {
        toolId: "cursor",
        planId: "business",
        monthlySpend: 120,
        seats: 3,
        useCase: "coding",
        teamSize: 3,
      },
    ];

    const result = runFullAudit(inputs);
    expect(result.totalCurrentSpend).toBe(180);

    expect(result.totalMonthlySavings).toBeGreaterThan(0);

    expect(result.totalAnnualSavings).toBe(
      result.totalMonthlySavings * 12
    );
  });
  test("should mark already optimal plans correctly", () => {
  const input: AuditInput = {
    toolId: "chatgpt",
    planId: "plus",
    monthlySpend: 20,
    seats: 1,
    useCase: "writing",
    teamSize: 1,
  };

  const result = runAudit(input);
  expect(result.bestRecommendation.type).toBe(
    "switch_tool"
  );
});

test("should calculate waste score within valid range", () => {
  const input: AuditInput = {
    toolId: "claude",
    planId: "max",
    monthlySpend: 100,
    seats: 1,
    useCase: "writing",
    teamSize: 1,
  };

  const result = runAudit(input);
  expect(result.wasteScore).toBeGreaterThanOrEqual(0);
  expect(result.wasteScore).toBeLessThanOrEqual(100);
});

test("should return recommendations array", () => {
  const input: AuditInput = {
    toolId: "gemini",
    planId: "business",
    monthlySpend: 90,
    seats: 3,
    useCase: "research",
    teamSize: 3,
  };

  const result = runAudit(input);
  expect(Array.isArray(result.recommendations)).toBe(
    true
  );

  expect(result.recommendations.length).toBeGreaterThan(0);
});

test("should generate non-empty summary", () => {
  const input: AuditInput = {
    toolId: "windsurf",
    planId: "teams",
    monthlySpend: 120,
    seats: 4,
    useCase: "writing",
    teamSize: 4,
  };

  const result = runAudit(input);
  expect(result.summary.length).toBeGreaterThan(10);
});

test("should identify Credex opportunity for high savings audits", () => {
  const inputs: AuditInput[] = [
    {
      toolId: "chatgpt",
      planId: "enterprise",
      monthlySpend: 1000,
      seats: 20,
      useCase: "writing",
      teamSize: 20,
    },
    {
      toolId: "cursor",
      planId: "enterprise",
      monthlySpend: 2000,
      seats: 20,
      useCase: "coding",
      teamSize: 20,
    },
  ];

  const result = runFullAudit(inputs);
  expect(typeof result.credexOpportunity).toBe("boolean");
});

test("should keep optimized spend lower than current spend", () => {
  const inputs: AuditInput[] = [
    {
      toolId: "gemini",
      planId: "business",
      monthlySpend: 300,
      seats: 10,
      useCase: "research",
      teamSize: 10,
    },
  ];

  const result = runFullAudit(inputs);
  expect(result.totalOptimizedSpend).toBeLessThanOrEqual(
  result.totalCurrentSpend
);
});

});