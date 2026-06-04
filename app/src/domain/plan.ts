export type GoalType = "long_term_growth" | "retirement" | "education" | "financial_freedom" | "other";
export type GoalTerm = "under_3_years" | "three_to_five_years" | "over_5_years" | "undecided";
export type ProductType = "broad_index" | "factor_index" | "industry_index" | "portfolio";
export type BuyMethod = "fixed_amount" | "variable_amount" | "valuation_dca" | "custom";
export type Frequency = "weekly" | "monthly";
export type ExecutionDate = "salary_next_trading_day" | "custom_date";
export type SellStrategy = "profit_take" | "valuation_take" | "long_hold";
export type PlanStatus = "not_created" | "active" | "paused" | "completed" | "terminated";
export type ExecutionStatus = "pending" | "reminded" | "completed" | "skipped" | "cancelled";
export type ValuationState = "low" | "normal" | "high" | "unknown";
export type ActionType = "buy" | "sell";

export interface ProductChoice {
  id: string;
  name: string;
  type: ProductType;
  reason: string;
}

export interface BuyRule {
  method: BuyMethod;
  low_multiplier: number;
  normal_multiplier: number;
  high_multiplier: number;
  high_action: "pause" | "half";
}

export interface SellRule {
  strategy: SellStrategy;
  threshold: number;
  batch_ratio: number;
  fund_destination: string;
}

export interface ReminderSettings {
  dca_reminder: boolean;
  execution_time: string;
  valuation_reminder: boolean;
  monthly_review_reminder: boolean;
}

export interface RecordFields {
  date: boolean;
  product: boolean;
  action: boolean;
  amount: boolean;
  valuation: boolean;
  note: boolean;
}

export interface DcaPlanDraft {
  goal_type: GoalType;
  goal_desc: string;
  goal_term: GoalTerm;
  monthly_budget: number;
  disposable_surplus: number;
  has_emergency_reserve: boolean;
  has_large_expense_in_3_years: boolean;
  investment_products: ProductChoice[];
  buy_rule: BuyRule;
  frequency: Frequency;
  execution_date: ExecutionDate;
  custom_execution_day: number;
  sell_rule: SellRule;
  reminder_settings: ReminderSettings;
  record_fields: RecordFields;
  valuation_state: ValuationState;
}

export interface DcaPlan extends DcaPlanDraft {
  plan_id: string;
  next_execution_at: string;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
}

export interface DcaRecord {
  record_id: string;
  plan_id: string;
  date: string;
  product_id: string;
  action_type: ActionType;
  amount: number;
  valuation_state: ValuationState;
  note: string;
  execution_status: ExecutionStatus;
  created_at: string;
}

export interface ReviewRecord {
  review_id: string;
  plan_id: string;
  period: "monthly" | "quarterly" | "manual";
  executed_as_planned: boolean;
  missed_execution: boolean;
  budget_changed: boolean;
  products_still_suitable: boolean;
  sell_condition_reached: boolean;
  summary: string;
  created_at: string;
}

export interface SuggestedAction {
  label: string;
  amount: number;
  tone: "buy" | "pause" | "hold";
  reason: string;
}

export const goalOptions: Array<{ value: GoalType; label: string; desc: string }> = [
  { value: "long_term_growth", label: "长期增值", desc: "适合 5 年以上规划" },
  { value: "retirement", label: "养老准备", desc: "偏稳健与现金流" },
  { value: "education", label: "教育金", desc: "关注用钱时间" },
  { value: "financial_freedom", label: "财务自由", desc: "长期持有优先" },
  { value: "other", label: "其他", desc: "保持默认规则" },
];

export const termOptions: Array<{ value: GoalTerm; label: string }> = [
  { value: "under_3_years", label: "3 年内" },
  { value: "three_to_five_years", label: "3-5 年" },
  { value: "over_5_years", label: "5 年以上" },
  { value: "undecided", label: "未确定" },
];

export const productOptions: ProductChoice[] = [
  { id: "csi300", name: "沪深300指数", type: "broad_index", reason: "覆盖主流大盘资产，适合新手长期定投。" },
  { id: "csi500", name: "中证500指数", type: "broad_index", reason: "可作为宽基补充，分散单一大盘暴露。" },
  { id: "dividend_low_vol", name: "红利低波指数", type: "factor_index", reason: "更偏现金流和稳健风格。" },
  { id: "consumer", name: "消费行业指数", type: "industry_index", reason: "行业波动更高，建议作为进阶配置。" },
];

export const goalLabels: Record<GoalType, string> = {
  long_term_growth: "长期增值",
  retirement: "养老准备",
  education: "教育金",
  financial_freedom: "财务自由",
  other: "其他",
};

export const termLabels: Record<GoalTerm, string> = {
  under_3_years: "3 年以内",
  three_to_five_years: "3-5 年",
  over_5_years: "5 年以上",
  undecided: "未确定",
};

export const valuationLabels: Record<ValuationState, string> = {
  low: "低估",
  normal: "正常",
  high: "高估",
  unknown: "未知",
};

export const statusLabels: Record<PlanStatus, string> = {
  not_created: "未创建",
  active: "进行中",
  paused: "暂停中",
  completed: "已完成",
  terminated: "已终止",
};

export function createDefaultDraft(): DcaPlanDraft {
  return {
    goal_type: "long_term_growth",
    goal_desc: "",
    goal_term: "over_5_years",
    monthly_budget: 3000,
    disposable_surplus: 8000,
    has_emergency_reserve: true,
    has_large_expense_in_3_years: false,
    investment_products: [productOptions[0]],
    buy_rule: {
      method: "variable_amount",
      low_multiplier: 1.5,
      normal_multiplier: 1,
      high_multiplier: 0,
      high_action: "pause",
    },
    frequency: "monthly",
    execution_date: "salary_next_trading_day",
    custom_execution_day: 5,
    sell_rule: {
      strategy: "long_hold",
      threshold: 30,
      batch_ratio: 25,
      fund_destination: "保留现金，等待下一轮低估",
    },
    reminder_settings: {
      dca_reminder: true,
      execution_time: "08:30",
      valuation_reminder: true,
      monthly_review_reminder: false,
    },
    record_fields: {
      date: true,
      product: true,
      action: true,
      amount: true,
      valuation: true,
      note: false,
    },
    valuation_state: "low",
  };
}

export function createPlanFromDraft(draft: DcaPlanDraft): DcaPlan {
  const now = new Date().toISOString();
  return {
    ...draft,
    plan_id: createId("plan"),
    next_execution_at: calculateNextExecutionAt(draft.frequency, draft.execution_date, draft.custom_execution_day),
    status: "active",
    created_at: now,
    updated_at: now,
  };
}

export function getGoalHint(goal: GoalType, term: GoalTerm): string {
  if (goal === "retirement") return "系统建议：卖出规则偏稳健，优先关注长期现金流。";
  if (goal === "education" || term === "under_3_years") return "系统建议：临近用钱时，卖出规则需要更保守。";
  if (goal === "financial_freedom") return "系统建议：默认采用长期持有 + 估值止盈提示。";
  return "系统建议：先用默认长期规则开始，后续再按复盘调整。";
}

export function applyGoalDefaults(draft: DcaPlanDraft): DcaPlanDraft {
  const next = { ...draft, sell_rule: { ...draft.sell_rule } };
  if (draft.goal_term === "under_3_years" || draft.goal_type === "education") {
    next.sell_rule.strategy = "profit_take";
    next.sell_rule.threshold = 20;
    next.sell_rule.batch_ratio = 30;
  } else if (draft.goal_type === "retirement") {
    next.sell_rule.strategy = "long_hold";
    next.sell_rule.batch_ratio = 20;
  } else {
    next.sell_rule.strategy = "long_hold";
    next.sell_rule.threshold = 30;
  }
  return next;
}

export function getBudgetRisk(draft: Pick<DcaPlanDraft, "monthly_budget" | "disposable_surplus" | "has_emergency_reserve" | "has_large_expense_in_3_years">): {
  level: "ok" | "warn" | "danger";
  message: string;
} {
  if (draft.monthly_budget <= 0) {
    return { level: "danger", message: "请输入每月定投金额。" };
  }
  if (!draft.has_emergency_reserve) {
    return { level: "warn", message: "建议先预留备用金，再开始定投。" };
  }
  if (draft.has_large_expense_in_3_years) {
    return { level: "warn", message: "未来 3 年有大额支出，建议保守设置预算。" };
  }
  if (draft.disposable_surplus > 0 && draft.monthly_budget / draft.disposable_surplus > 0.5) {
    return { level: "warn", message: "当前金额超过结余 50%，建议先降低预算。" };
  }
  return { level: "ok", message: "预算处于较稳妥区间，只用闲钱，不影响生活。" };
}

export function getSuggestedAction(plan: DcaPlan): SuggestedAction {
  const base = plan.frequency === "weekly" ? Math.round(plan.monthly_budget / 4) : plan.monthly_budget;
  if (plan.valuation_state === "low") {
    return {
      label: "买入",
      amount: Math.round(base * plan.buy_rule.low_multiplier),
      tone: "buy",
      reason: `当前为低估状态，按规则投入基础金额的 ${plan.buy_rule.low_multiplier} 倍。`,
    };
  }
  if (plan.valuation_state === "high") {
    return {
      label: plan.buy_rule.high_action === "pause" ? "暂停买入" : "少量买入",
      amount: Math.round(base * plan.buy_rule.high_multiplier),
      tone: "pause",
      reason: "当前为高估状态，按规则减少投入，不临时追涨。",
    };
  }
  if (plan.valuation_state === "unknown") {
    return {
      label: "保持计划",
      amount: base,
      tone: "hold",
      reason: "估值状态未知时，先按基础金额执行，并等待数据更新。",
    };
  }
  return {
    label: "买入",
    amount: Math.round(base * plan.buy_rule.normal_multiplier),
    tone: "buy",
    reason: "当前为正常估值，按基础金额执行。",
  };
}

export function calculateNextExecutionAt(frequency: Frequency, executionDate: ExecutionDate, customDay = 5, from = new Date()): string {
  const next = new Date(from);
  next.setHours(9, 30, 0, 0);

  if (frequency === "weekly") {
    const day = next.getDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    next.setDate(next.getDate() + daysUntilMonday);
    return formatDateTime(next);
  }

  const targetDay = executionDate === "custom_date" ? customDay : 5;
  next.setMonth(next.getMonth() + (next.getDate() >= targetDay ? 1 : 0), clampDay(targetDay));
  moveWeekendToMonday(next);
  return formatDateTime(next);
}

export function validateWizardStep(step: number, draft: DcaPlanDraft): string {
  if (step === 1 && draft.monthly_budget <= 0) return "请输入每月定投金额。";
  if (step === 2 && draft.investment_products.length < 1) return "请至少选择 1 个定投品种。";
  return "";
}

export function createRecord(plan: DcaPlan, input: Partial<DcaRecord>): DcaRecord {
  return {
    record_id: createId("record"),
    plan_id: plan.plan_id,
    date: input.date || today(),
    product_id: input.product_id || plan.investment_products[0]?.id || "unknown",
    action_type: input.action_type || "buy",
    amount: input.amount || getSuggestedAction(plan).amount,
    valuation_state: input.valuation_state || plan.valuation_state,
    note: input.note || "",
    execution_status: input.execution_status || "completed",
    created_at: new Date().toISOString(),
  };
}

export function createReview(plan: DcaPlan, input: Partial<ReviewRecord>): ReviewRecord {
  return {
    review_id: createId("review"),
    plan_id: plan.plan_id,
    period: input.period || "monthly",
    executed_as_planned: input.executed_as_planned ?? true,
    missed_execution: input.missed_execution ?? false,
    budget_changed: input.budget_changed ?? false,
    products_still_suitable: input.products_still_suitable ?? true,
    sell_condition_reached: input.sell_condition_reached ?? false,
    summary: input.summary || "继续当前预算，保持规则执行。",
    created_at: new Date().toISOString(),
  };
}

export function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function clampDay(day: number): number {
  return Math.min(Math.max(Math.round(day || 5), 1), 28);
}

function moveWeekendToMonday(date: Date): void {
  if (date.getDay() === 6) date.setDate(date.getDate() + 2);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1);
}

function formatDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}
