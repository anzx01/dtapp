import { describe, expect, it } from "vitest";
import {
  calculateProductMonthlyInvestment,
  calculateExpectedIncomeProjection,
  calculateNextExecutionAt,
  calculateRequiredMonthlyInvestment,
  createDefaultDraft,
  createPlanFromDraft,
  productOptions,
  getExecutionStats,
  getBudgetRisk,
  getReviewInsight,
  getSuggestedAction,
  getTodayTask,
  type DcaRecord,
} from "./plan";

describe("plan domain", () => {
  it("creates a default draft that can produce a plan", () => {
    const draft = createDefaultDraft();
    const plan = createPlanFromDraft(draft);

    expect(plan.status).toBe("active");
    expect(plan.monthly_budget).toBe(3000);
    expect(plan.target_total_income).toBe(10000000);
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

  it("projects total income from the plan budget and projection years", () => {
    const projection = calculateExpectedIncomeProjection(createDefaultDraft(), [], new Date("2026-06-05T00:00:00"));

    expect(projection.projection_years).toBe(30);
    expect(projection.target_month).toBe("2056年6月");
    expect(projection.monthly_contribution).toBe(3000);
    expect(projection.target_total_income).toBe(10000000);
    expect(projection.target_gap).toBeGreaterThan(0);
    expect(projection.total_income).toBe(projection.total_projected_assets);
    expect(projection.total_return).toBe(projection.total_projected_assets - projection.total_planned_principal);
    expect(projection.total_income).toBeGreaterThan(6000000);
    expect(projection.total_projected_assets).toBeGreaterThan(projection.total_planned_principal);
  });

  it("includes net recorded principal in expected income projection", () => {
    const plan = createPlanFromDraft(createDefaultDraft());
    const records: DcaRecord[] = [
      {
        record_id: "record_1",
        plan_id: plan.plan_id,
        date: "2026-06-05",
        product_id: "csi300",
        action_type: "buy",
        amount: 10000,
        valuation_state: "low",
        note: "",
        execution_status: "completed",
        created_at: "2026-06-05T00:00:00.000Z",
      },
      {
        record_id: "record_2",
        plan_id: plan.plan_id,
        date: "2026-06-06",
        product_id: "csi300",
        action_type: "sell",
        amount: 2000,
        valuation_state: "high",
        note: "",
        execution_status: "completed",
        created_at: "2026-06-06T00:00:00.000Z",
      },
    ];

    const projection = calculateExpectedIncomeProjection(plan, records, new Date("2026-06-05T00:00:00"));

    expect(projection.current_principal).toBe(8000);
    expect(projection.total_planned_principal).toBe(1088000);
  });

  it("uses custom projection years for total income", () => {
    const draft = { ...createDefaultDraft(), projection_years: 20 };
    const projection = calculateExpectedIncomeProjection(draft, [], new Date("2026-06-05T00:00:00"));

    expect(projection.projection_years).toBe(20);
    expect(projection.target_month).toBe("2046年6月");
    expect(projection.total_planned_principal).toBe(720000);
  });

  it("includes overseas indexes and historical return windows", () => {
    const sp500 = productOptions.find((item) => item.id === "sp500");
    const nasdaq100 = productOptions.find((item) => item.id === "nasdaq100");

    expect(sp500?.annualized_returns.y10).toBeGreaterThan(0);
    expect(sp500?.annualized_returns.y30).toBeGreaterThan(0);
    expect(nasdaq100?.type).toBe("us_index");
  });

  it("back-calculates required monthly investment for a target amount", () => {
    const monthly = calculateRequiredMonthlyInvestment(10000000, 10, 0.1);

    expect(monthly).toBeGreaterThan(45000);
    expect(monthly).toBeLessThan(55000);
  });

  it("calculates product monthly investment from historical returns", () => {
    const product = productOptions.find((item) => item.id === "nasdaq100");
    expect(product).toBeTruthy();
    if (!product) return;

    const result = calculateProductMonthlyInvestment(product, 10000000, 10);

    expect(result.horizon).toBe(10);
    expect(result.monthly_amount).toBeLessThan(40000);
  });

  it("returns a due task when next execution is today", () => {
    const plan = { ...createPlanFromDraft(createDefaultDraft()), next_execution_at: "2026-06-05 09:30" };
    const task = getTodayTask(plan, [], new Date("2026-06-05T08:00:00"));

    expect(task.status).toBe("due");
    expect(task.label).toBe("买入");
    expect(task.amount).toBe(4500);
  });

  it("calculates monthly completion and execution streak", () => {
    const plan = createPlanFromDraft(createDefaultDraft());
    const records: DcaRecord[] = [
      createTestRecord(plan.plan_id, "2026-06-05", 4500),
      createTestRecord(plan.plan_id, "2026-05-05", 3000),
    ];

    const stats = getExecutionStats(plan, records, new Date("2026-06-20T00:00:00"));

    expect(stats.current_month_records).toBe(1);
    expect(stats.month_completion_rate).toBe(100);
    expect(stats.streak_count).toBe(2);
  });

  it("summarizes monthly review state from records", () => {
    const plan = createPlanFromDraft(createDefaultDraft());
    const records: DcaRecord[] = [createTestRecord(plan.plan_id, "2026-06-05", 4500)];
    const insight = getReviewInsight(plan, records, [], new Date("2026-06-20T00:00:00"));

    expect(insight.title).toBe("本月执行稳定");
    expect(insight.tone).toBe("ok");
  });
});

function createTestRecord(planId: string, date: string, amount: number): DcaRecord {
  return {
    record_id: `record_${date}`,
    plan_id: planId,
    date,
    product_id: "csi300",
    action_type: "buy",
    amount,
    valuation_state: "low",
    note: "",
    execution_status: "completed",
    created_at: `${date}T00:00:00.000Z`,
  };
}
