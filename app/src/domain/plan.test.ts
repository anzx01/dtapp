import { describe, expect, it } from "vitest";
import {
  calculateNextExecutionAt,
  createDefaultDraft,
  createPlanFromDraft,
  getBudgetRisk,
  getSuggestedAction,
} from "./plan";

describe("plan domain", () => {
  it("creates a default draft that can produce a plan", () => {
    const draft = createDefaultDraft();
    const plan = createPlanFromDraft(draft);

    expect(plan.status).toBe("active");
    expect(plan.monthly_budget).toBe(3000);
    expect(plan.investment_products[0].id).toBe("csi300");
    expect(plan.next_execution_at).toContain("09:30");
  });

  it("warns when budget is too high for disposable surplus", () => {
    const risk = getBudgetRisk({
      monthly_budget: 6000,
      disposable_surplus: 8000,
      has_emergency_reserve: true,
      has_large_expense_in_3_years: false,
    });

    expect(risk.level).toBe("warn");
  });

  it("calculates low valuation suggested action with multiplier", () => {
    const plan = createPlanFromDraft(createDefaultDraft());
    const action = getSuggestedAction(plan);

    expect(action.label).toBe("买入");
    expect(action.amount).toBe(4500);
  });

  it("moves custom monthly execution on weekends to Monday", () => {
    const date = calculateNextExecutionAt("monthly", "custom_date", 7, new Date("2026-05-20T08:00:00"));

    expect(date).toBe("2026-06-08 09:30");
  });
});
