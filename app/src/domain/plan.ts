export type GoalType = "long_term_growth" | "retirement" | "education" | "financial_freedom" | "other";
export type GoalTerm = "under_3_years" | "three_to_five_years" | "over_5_years" | "undecided";
export type ProductType = "broad_index" | "us_index" | "global_index" | "factor_index" | "industry_index" | "portfolio";
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
  code: string;
  market: string;
  risk_level: "low" | "medium" | "high";
  annualized_returns: HistoricalReturns;
  return_note: string;
}

export interface HistoricalReturns {
  y10: number | null;
  y20: number | null;
  y30: number | null;
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
  projection_years: number;
  target_total_income: number;
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

export interface ExpectedIncomeProjection {
  projection_years: number;
  target_month: string;
  annual_return_rate: number;
  target_total_income: number;
  target_gap: number;
  monthly_contribution: number;
  current_principal: number;
  total_planned_principal: number;
  total_projected_assets: number;
  total_income: number;
  total_return: number;
}

export interface ExecutionStats {
  total_records: number;
  current_month_records: number;
  current_month_required: number;
  month_completion_rate: number;
  monthly_recorded_amount: number;
  streak_count: number;
  last_record_date: string;
}

export interface TodayTask {
  status: "due" | "upcoming" | "recorded" | "paused";
  title: string;
  label: string;
  detail: string;
  amount: number;
  tone: SuggestedAction["tone"];
  next_execution_at: string;
}

export interface ReviewInsight {
  title: string;
  detail: string;
  tone: "ok" | "warn" | "neutral";
}

export const expectedIncomeAssumptions = {
  annual_return_rate: 0.1,
};

export const riskLabels: Record<ProductChoice["risk_level"], string> = {
  low: "低波动",
  medium: "中波动",
  high: "高波动",
};

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
  {
    id: "csi300",
    name: "沪深300指数",
    type: "broad_index",
    code: "000300",
    market: "A股",
    risk_level: "medium",
    annualized_returns: { y10: 4.2, y20: 7.0, y30: null },
    reason: "覆盖主流大盘资产，适合新手长期定投。",
    return_note: "指数历史不足 30 年，30 年口径暂不展示。",
  },
  {
    id: "csi500",
    name: "中证500指数",
    type: "broad_index",
    code: "000905",
    market: "A股",
    risk_level: "high",
    annualized_returns: { y10: 3.6, y20: null, y30: null },
    reason: "可作为宽基补充，分散单一大盘暴露。",
    return_note: "指数历史不足 20/30 年，长期口径暂不展示。",
  },
  {
    id: "sse50",
    name: "上证50指数",
    type: "broad_index",
    code: "000016",
    market: "A股",
    risk_level: "medium",
    annualized_returns: { y10: 3.8, y20: 6.2, y30: null },
    reason: "偏大盘蓝筹，波动通常低于成长风格。",
    return_note: "指数历史不足 30 年，30 年口径暂不展示。",
  },
  {
    id: "sp500",
    name: "标普500指数",
    type: "us_index",
    code: "S&P 500",
    market: "美股",
    risk_level: "medium",
    annualized_returns: { y10: 12.4, y20: 9.9, y30: 9.8 },
    reason: "覆盖美国大盘核心资产，适合做海外宽基配置。",
    return_note: "美元计价历史年化参考，未考虑汇率和交易成本。",
  },
  {
    id: "nasdaq100",
    name: "纳斯达克100指数",
    type: "us_index",
    code: "NDX",
    market: "美股",
    risk_level: "high",
    annualized_returns: { y10: 17.8, y20: 14.2, y30: 13.1 },
    reason: "科技权重高，长期收益弹性大，但回撤也更深。",
    return_note: "美元计价历史年化参考，行业集中度较高。",
  },
  {
    id: "nasdaq_composite",
    name: "纳斯达克综合指数",
    type: "us_index",
    code: "IXIC",
    market: "美股",
    risk_level: "high",
    annualized_returns: { y10: 14.7, y20: 11.8, y30: 10.6 },
    reason: "覆盖纳斯达克市场整体，成长风格更明显。",
    return_note: "美元计价历史年化参考，波动高于普通宽基。",
  },
  {
    id: "dow_jones",
    name: "道琼斯工业指数",
    type: "us_index",
    code: "DJIA",
    market: "美股",
    risk_level: "medium",
    annualized_returns: { y10: 10.4, y20: 8.6, y30: 8.7 },
    reason: "偏成熟蓝筹，适合作为美股大盘补充观察。",
    return_note: "美元计价历史年化参考。",
  },
  {
    id: "msci_world",
    name: "MSCI全球指数",
    type: "global_index",
    code: "MSCI World",
    market: "全球",
    risk_level: "medium",
    annualized_returns: { y10: 9.1, y20: 7.4, y30: 7.2 },
    reason: "覆盖发达市场股票，适合做全球分散配置参考。",
    return_note: "美元计价历史年化参考，未考虑汇率。",
  },
  {
    id: "hang_seng",
    name: "恒生指数",
    type: "global_index",
    code: "HSI",
    market: "港股",
    risk_level: "high",
    annualized_returns: { y10: -1.8, y20: 3.4, y30: 4.8 },
    reason: "港股代表性指数，估值波动大，适合进阶观察。",
    return_note: "港币计价历史年化参考，近十年表现较弱。",
  },
  {
    id: "nikkei225",
    name: "日经225指数",
    type: "global_index",
    code: "Nikkei 225",
    market: "日本",
    risk_level: "medium",
    annualized_returns: { y10: 8.7, y20: 7.3, y30: 4.6 },
    reason: "日本大盘代表指数，可用于海外分散观察。",
    return_note: "日元计价历史年化参考，未考虑汇率。",
  },
  {
    id: "dividend_low_vol",
    name: "红利低波指数",
    type: "factor_index",
    code: "红利低波",
    market: "A股",
    risk_level: "medium",
    annualized_returns: { y10: 7.6, y20: null, y30: null },
    reason: "更偏现金流和稳健风格。",
    return_note: "策略指数长期口径不足，需后续接指数官方数据。",
  },
  {
    id: "consumer",
    name: "消费行业指数",
    type: "industry_index",
    code: "消费",
    market: "A股",
    risk_level: "high",
    annualized_returns: { y10: 5.2, y20: null, y30: null },
    reason: "行业波动更高，建议作为进阶配置。",
    return_note: "行业指数长期口径不足，需后续接指数官方数据。",
  },
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
    projection_years: 30,
    target_total_income: 10000000,
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

export function calculateExpectedIncomeProjection(plan: DcaPlanDraft | DcaPlan, records: DcaRecord[] = [], from = new Date()): ExpectedIncomeProjection {
  const projectionYears = normalizeProjectionYears(plan.projection_years);
  const months = projectionYears * 12;
  const monthlyContribution = Math.max(0, plan.monthly_budget);
  const currentPrincipal = getCurrentPrincipal(plan, records);
  const monthlyRate = Math.pow(1 + expectedIncomeAssumptions.annual_return_rate, 1 / 12) - 1;
  const growthFactor = Math.pow(1 + monthlyRate, months);
  const contributionFactor = monthlyRate === 0 ? months : (growthFactor - 1) / monthlyRate;
  const totalProjectedAssets = currentPrincipal * growthFactor + monthlyContribution * contributionFactor;
  const totalPlannedPrincipal = currentPrincipal + monthlyContribution * months;
  const totalIncome = totalProjectedAssets;
  const totalReturn = Math.max(0, totalProjectedAssets - totalPlannedPrincipal);

  return {
    projection_years: projectionYears,
    target_month: formatYearMonth(addMonths(from, months)),
    annual_return_rate: expectedIncomeAssumptions.annual_return_rate,
    target_total_income: Math.round(Math.max(0, plan.target_total_income)),
    target_gap: Math.round(Math.max(0, plan.target_total_income - totalIncome)),
    monthly_contribution: Math.round(monthlyContribution),
    current_principal: Math.round(currentPrincipal),
    total_planned_principal: Math.round(totalPlannedPrincipal),
    total_projected_assets: Math.round(totalProjectedAssets),
    total_income: Math.round(totalIncome),
    total_return: Math.round(totalReturn),
  };
}

export function getAnnualizedReturnForYears(product: ProductChoice, years: number): {
  rate: number | null;
  horizon: 10 | 20 | 30 | null;
} {
  const normalizedYears = normalizeProjectionYears(years);
  if (normalizedYears <= 10 && product.annualized_returns.y10 !== null) return { rate: product.annualized_returns.y10 / 100, horizon: 10 };
  if (normalizedYears <= 20 && product.annualized_returns.y20 !== null) return { rate: product.annualized_returns.y20 / 100, horizon: 20 };
  if (product.annualized_returns.y30 !== null) return { rate: product.annualized_returns.y30 / 100, horizon: 30 };
  if (product.annualized_returns.y20 !== null) return { rate: product.annualized_returns.y20 / 100, horizon: 20 };
  if (product.annualized_returns.y10 !== null) return { rate: product.annualized_returns.y10 / 100, horizon: 10 };
  return { rate: null, horizon: null };
}

export function calculateRequiredMonthlyInvestment(targetAmount: number, years: number, annualReturnRate: number, currentPrincipal = 0): number {
  const normalizedYears = normalizeProjectionYears(years);
  const months = normalizedYears * 12;
  const target = Math.max(0, targetAmount);
  const principal = Math.max(0, currentPrincipal);
  const monthlyRate = Math.pow(1 + Math.max(-0.95, annualReturnRate), 1 / 12) - 1;
  const principalFutureValue = principal * Math.pow(1 + monthlyRate, months);
  const gap = target - principalFutureValue;
  if (gap <= 0) return 0;
  if (monthlyRate === 0) return Math.round(gap / months);
  const contributionFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return Math.round(gap / contributionFactor);
}

export function calculateProductMonthlyInvestment(product: ProductChoice, targetAmount: number, years: number, currentPrincipal = 0): {
  monthly_amount: number | null;
  annual_return_rate: number | null;
  horizon: 10 | 20 | 30 | null;
} {
  const selectedReturn = getAnnualizedReturnForYears(product, years);
  if (selectedReturn.rate === null) {
    return { monthly_amount: null, annual_return_rate: null, horizon: null };
  }

  return {
    monthly_amount: calculateRequiredMonthlyInvestment(targetAmount, years, selectedReturn.rate, currentPrincipal),
    annual_return_rate: selectedReturn.rate,
    horizon: selectedReturn.horizon,
  };
}

export function getExecutionStats(plan: DcaPlan, records: DcaRecord[] = [], from = new Date()): ExecutionStats {
  const planRecords = getPlanRecords(plan, records);
  const currentMonth = `${from.getFullYear()}-${pad(from.getMonth() + 1)}`;
  const currentMonthRecords = planRecords.filter((record) => record.date.startsWith(currentMonth));
  const currentMonthRequired = getRequiredExecutionsSoFar(plan, from);
  const currentMonthCompleted = currentMonthRecords.filter((record) => record.execution_status === "completed").length;
  const monthlyRecordedAmount = currentMonthRecords.reduce((total, record) => total + (record.action_type === "sell" ? -record.amount : record.amount), 0);

  return {
    total_records: planRecords.length,
    current_month_records: currentMonthRecords.length,
    current_month_required: currentMonthRequired,
    month_completion_rate: Math.min(100, Math.round((currentMonthCompleted / currentMonthRequired) * 100)),
    monthly_recorded_amount: Math.max(0, monthlyRecordedAmount),
    streak_count: getExecutionStreak(plan, planRecords),
    last_record_date: planRecords[0]?.date || "",
  };
}

export function getTodayTask(plan: DcaPlan, records: DcaRecord[] = [], from = new Date()): TodayTask {
  const suggested = getSuggestedAction(plan);
  const todayText = formatDate(from);
  const nextExecutionDate = parseDateTime(plan.next_execution_at);
  const nextDateText = nextExecutionDate ? formatDate(nextExecutionDate) : "";
  const recordedToday = getPlanRecords(plan, records).some((record) => record.date === todayText && record.execution_status === "completed");

  if (plan.status === "paused") {
    return {
      status: "paused",
      title: "计划暂停中",
      label: "暂无动作",
      detail: "恢复计划后，再按规则继续执行。",
      amount: 0,
      tone: "hold",
      next_execution_at: plan.next_execution_at,
    };
  }

  if (recordedToday) {
    return {
      status: "recorded",
      title: "今天已记录",
      label: "保持节奏",
      detail: "本次执行已计入计划，下一步等到下个执行日。",
      amount: 0,
      tone: "hold",
      next_execution_at: plan.next_execution_at,
    };
  }

  if (!nextExecutionDate || nextDateText <= todayText) {
    return {
      status: "due",
      title: "今天该执行",
      label: suggested.label,
      detail: suggested.reason,
      amount: suggested.amount,
      tone: suggested.tone,
      next_execution_at: plan.next_execution_at,
    };
  }

  return {
    status: "upcoming",
    title: "下次执行",
    label: suggested.label,
    detail: `${plan.next_execution_at} 按计划查看是否执行。`,
    amount: suggested.amount,
    tone: suggested.tone,
    next_execution_at: plan.next_execution_at,
  };
}

export function getReviewInsight(plan: DcaPlan, records: DcaRecord[] = [], reviews: ReviewRecord[] = [], from = new Date()): ReviewInsight {
  const stats = getExecutionStats(plan, records, from);
  const currentMonth = `${from.getFullYear()}-${pad(from.getMonth() + 1)}`;
  const latestReview = reviews.find((review) => review.plan_id === plan.plan_id);
  const reviewedThisMonth = latestReview?.created_at.startsWith(currentMonth);

  if (reviewedThisMonth && latestReview) {
    return {
      title: "本月已复盘",
      detail: latestReview.summary,
      tone: "ok",
    };
  }

  if (stats.current_month_records === 0) {
    return {
      title: "本月还没有记录",
      detail: "先完成本期动作，月底复盘才有依据。",
      tone: "warn",
    };
  }

  if (stats.month_completion_rate >= 100) {
    return {
      title: "本月执行稳定",
      detail: `已记录 ${stats.current_month_records} 次，累计投入 ¥${stats.monthly_recorded_amount}。`,
      tone: "ok",
    };
  }

  return {
    title: "本月继续跟进",
    detail: `已完成 ${stats.month_completion_rate}%，下次执行时继续按规则记录。`,
    tone: "neutral",
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

function getCurrentPrincipal(plan: DcaPlanDraft | DcaPlan, records: DcaRecord[]): number {
  const relevantRecords = "plan_id" in plan ? getPlanRecords(plan, records) : records;
  const principal = relevantRecords.reduce((total, record) => {
    return total + (record.action_type === "sell" ? -record.amount : record.amount);
  }, 0);

  return Math.max(0, principal);
}

function getPlanRecords(plan: DcaPlan, records: DcaRecord[]): DcaRecord[] {
  return records
    .filter((record) => record.plan_id === plan.plan_id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
}

function getRequiredExecutionsSoFar(plan: DcaPlan, from: Date): number {
  if (plan.frequency === "monthly") return 1;

  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  let mondays = 0;
  while (cursor <= from) {
    if (cursor.getDay() === 1) mondays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return Math.max(1, mondays);
}

function getExecutionStreak(plan: DcaPlan, records: DcaRecord[]): number {
  const completedRecords = records.filter((record) => record.execution_status === "completed");
  if (completedRecords.length === 0) return 0;

  const maxGapDays = plan.frequency === "weekly" ? 10 : 45;
  let streak = 1;
  for (let index = 1; index < completedRecords.length; index += 1) {
    const previous = parseDate(completedRecords[index - 1].date);
    const current = parseDate(completedRecords[index].date);
    if (!previous || !current) break;
    if (daysBetween(current, previous) > maxGapDays) break;
    streak += 1;
  }

  return streak;
}

export function normalizeProjectionYears(value: number | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(Math.max(Math.round(parsed), 1), 60);
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function parseDateTime(value: string): Date | null {
  const [datePart, timePart = "00:00"] = value.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, hour || 0, minute || 0);
}

function daysBetween(from: Date, to: Date): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toDate.getTime() - fromDate.getTime()) / dayMs);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}
