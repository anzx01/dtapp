<template>
  <view class="page">
    <view class="mobile-shell">
      <StepHeader :title="current.title" :subtitle="current.subtitle" :step="step + 1" :total="steps.length" />

      <view class="wizard-card surface">
        <view v-if="step === 0" class="step-panel">
          <view class="option-grid">
            <OptionCard
              v-for="option in goalOptions"
              :key="option.value"
              :label="option.label"
              :desc="option.desc"
              :active="draft.goal_type === option.value"
              @select="selectGoal(option.value)"
            />
          </view>
          <view class="segmented">
            <button
              v-for="option in termOptions"
              :key="option.value"
              class="segment"
              :class="{ active: draft.goal_term === option.value }"
              @click="selectTerm(option.value)"
            >
              {{ option.label }}
            </button>
          </view>
          <textarea
            class="text-area-input"
            maxlength="80"
            :value="draft.goal_desc"
            placeholder="目标描述（可选），例如：10 年后覆盖家庭月支出"
            @input="updateGoalDesc"
          />
          <view class="hint-box">
            <text>{{ goalHint }}</text>
          </view>
        </view>

        <view v-if="step === 1" class="step-panel">
          <view class="field">
            <text class="field-label">每月定投金额</text>
            <input class="text-input amount" type="number" :value="draft.monthly_budget" @input="updateMonthlyBudget" />
          </view>
          <view class="field">
            <text class="field-label">每月可支配结余（可选）</text>
            <input class="text-input" type="number" :value="draft.disposable_surplus" @input="updateSurplus" />
          </view>
          <view class="switch-row">
            <view>
              <text class="switch-title">已预留备用金</text>
              <text class="switch-desc">优先保证生活安全垫</text>
            </view>
            <switch :checked="draft.has_emergency_reserve" color="#2f7d52" @change="toggleReserve" />
          </view>
          <view class="switch-row">
            <view>
              <text class="switch-title">未来 3 年有大额支出</text>
              <text class="switch-desc">有则建议保守设置</text>
            </view>
            <switch :checked="draft.has_large_expense_in_3_years" color="#2f7d52" @change="toggleLargeExpense" />
          </view>
          <view class="hint-box" :class="budgetRisk.level">
            <text>{{ budgetRisk.message }}</text>
          </view>
        </view>

        <view v-if="step === 2" class="step-panel">
          <view class="product-tabs">
            <button
              v-for="tab in productTabs"
              :key="tab.value"
              class="tab"
              :class="{ active: productFilter === tab.value }"
              @click="productFilter = tab.value"
            >
              {{ tab.label }}
            </button>
          </view>
          <view class="option-grid">
            <OptionCard
              v-for="product in filteredProducts"
              :key="product.id"
              :label="product.name"
              :desc="product.reason"
              :active="isProductSelected(product.id)"
              @select="toggleProduct(product)"
            />
          </view>
          <view v-if="draft.investment_products.length === 0" class="hint-box danger">
            <text>请至少选择 1 个品种后继续。</text>
          </view>
          <view v-else class="hint-box">
            <text>推荐少而精，V1.0 可先从宽基指数开始。</text>
          </view>
        </view>

        <view v-if="step === 3" class="step-panel">
          <view class="button-grid">
            <button
              v-for="method in buyMethods"
              :key="method.value"
              class="choice-button"
              :class="{ active: draft.buy_rule.method === method.value }"
              @click="setBuyMethod(method.value)"
            >
              {{ method.label }}
            </button>
          </view>
          <view class="rule-table">
            <view class="rule-row">
              <text class="state low">低估</text>
              <text>基础金额 × {{ draft.buy_rule.low_multiplier }}</text>
            </view>
            <view class="rule-row">
              <text class="state normal">正常</text>
              <text>基础金额 × {{ draft.buy_rule.normal_multiplier }}</text>
            </view>
            <view class="rule-row">
              <text class="state high">高估</text>
              <text>{{ draft.buy_rule.high_action === "pause" ? "暂停买入" : `基础金额 × ${draft.buy_rule.high_multiplier}` }}</text>
            </view>
          </view>
          <view class="button-grid">
            <button class="choice-button" :class="{ active: draft.buy_rule.low_multiplier === 1.5 }" @click="setLowMultiplier(1.5)">低估 1.5 倍</button>
            <button class="choice-button" :class="{ active: draft.buy_rule.low_multiplier === 2 }" @click="setLowMultiplier(2)">低估 2 倍</button>
            <button class="choice-button" :class="{ active: draft.buy_rule.high_action === 'pause' }" @click="setHighAction('pause')">高估暂停</button>
            <button class="choice-button" :class="{ active: draft.buy_rule.high_action === 'half' }" @click="setHighAction('half')">高估 0.5 倍</button>
          </view>
          <view class="hint-box">
            <text>越便宜，买得越多；越贵，买得越少。规则可后续修改。</text>
          </view>
        </view>

        <view v-if="step === 4" class="step-panel">
          <view class="button-grid">
            <button class="choice-button" :class="{ active: draft.frequency === 'weekly' }" @click="setFrequency('weekly')">每周</button>
            <button class="choice-button" :class="{ active: draft.frequency === 'monthly' }" @click="setFrequency('monthly')">每月</button>
          </view>
          <OptionCard
            label="发工资后第一个交易日"
            desc="默认推荐，减少忘记与犹豫"
            :active="draft.execution_date === 'salary_next_trading_day'"
            @select="setExecutionDate('salary_next_trading_day')"
          />
          <OptionCard
            label="自定义日期"
            desc="每月固定某一天，周末顺延"
            :active="draft.execution_date === 'custom_date'"
            @select="setExecutionDate('custom_date')"
          />
          <view v-if="draft.execution_date === 'custom_date'" class="field">
            <text class="field-label">每月第几天</text>
            <input class="text-input" type="number" :value="draft.custom_execution_day" @input="updateCustomDay" />
          </view>
          <view class="hint-box">
            <text>下一次执行时间会在创建计划后自动生成。</text>
          </view>
        </view>

        <view v-if="step === 5" class="step-panel">
          <OptionCard
            v-for="strategy in sellStrategies"
            :key="strategy.value"
            :label="strategy.label"
            :desc="strategy.desc"
            :active="draft.sell_rule.strategy === strategy.value"
            @select="setSellStrategy(strategy.value)"
          />
          <view class="field">
            <text class="field-label">触发阈值（%）</text>
            <input class="text-input" type="number" :value="draft.sell_rule.threshold" @input="updateSellThreshold" />
          </view>
          <view class="field">
            <text class="field-label">卖出后资金去向</text>
            <input class="text-input" :value="draft.sell_rule.fund_destination" @input="updateFundDestination" />
          </view>
          <view class="hint-box">
            <text>先定规则，再执行，不临时决定。</text>
          </view>
        </view>

        <view v-if="step === 6" class="step-panel">
          <view class="switch-row">
            <view>
              <text class="switch-title">定投提醒</text>
              <text class="switch-desc">在执行日提醒查看计划</text>
            </view>
            <switch :checked="draft.reminder_settings.dca_reminder" color="#2f7d52" @change="toggleDcaReminder" />
          </view>
          <view class="field">
            <text class="field-label">执行提醒时间</text>
            <input class="text-input" :value="draft.reminder_settings.execution_time" @input="updateExecutionTime" />
          </view>
          <view class="switch-row">
            <view>
              <text class="switch-title">估值提醒</text>
              <text class="switch-desc">低估或高估区间变化时提醒</text>
            </view>
            <switch :checked="draft.reminder_settings.valuation_reminder" color="#2f7d52" @change="toggleValuationReminder" />
          </view>
          <view class="switch-row">
            <view>
              <text class="switch-title">月度复盘提醒</text>
              <text class="switch-desc">每月检查是否按计划执行</text>
            </view>
            <switch :checked="draft.reminder_settings.monthly_review_reminder" color="#2f7d52" @change="toggleReviewReminder" />
          </view>
          <view class="record-fields">
            <button
              v-for="field in recordFieldOptions"
              :key="field.value"
              class="field-chip"
              :class="{ active: draft.record_fields[field.value] }"
              @click="toggleRecordField(field.value)"
            >
              {{ field.label }}
            </button>
          </view>
        </view>

        <view v-if="step === 7" class="step-panel">
          <view class="summary-list">
            <view v-for="row in summaryRows" :key="row.label" class="summary-row">
              <text class="summary-label">{{ row.label }}</text>
              <text class="summary-value">{{ row.value }}</text>
            </view>
          </view>
          <view class="hint-box">
            <text>不预测涨跌，只执行规则。低估多投，高估少投。</text>
          </view>
          <view class="compliance">
            <text>本计划仅作执行规则记录，不构成投资建议，不提供交易下单。</text>
          </view>
        </view>
      </view>

      <ActionBar
        :primary="step === steps.length - 1 ? '创建计划' : '下一步'"
        :secondary="step > 0 ? '上一步' : '返回'"
        @primary="next"
        @secondary="back"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import StepHeader from "../../components/StepHeader/StepHeader.vue";
import OptionCard from "../../components/OptionCard/OptionCard.vue";
import ActionBar from "../../components/ActionBar/ActionBar.vue";
import { track } from "../../domain/analytics";
import {
  getBudgetRisk,
  getGoalHint,
  goalLabels,
  goalOptions,
  productOptions,
  termLabels,
  termOptions,
  validateWizardStep,
  type BuyMethod,
  type ExecutionDate,
  type Frequency,
  type GoalTerm,
  type GoalType,
  type ProductChoice,
  type ProductType,
  type RecordFields,
  type SellStrategy,
} from "../../domain/plan";
import { usePlanStore } from "../../stores/planStore";

const store = usePlanStore();
const step = ref(0);
const productFilter = ref<ProductType | "all">("broad_index");

const steps = [
  { title: "你这次定投，是为了什么？", subtitle: "不同目标会影响默认期限和卖出方式。" },
  { title: "你每月准备投多少钱？", subtitle: "这笔钱最好 3 年内不会用到。" },
  { title: "你想投哪类长期资产？", subtitle: "先选长期更稳的品种，再开始定投。" },
  { title: "越便宜，买得越多", subtitle: "默认推荐定期不定额，降低临时决策。" },
  { title: "什么时候自动执行？", subtitle: "固定时间执行，更容易坚持。" },
  { title: "什么时候考虑卖出？", subtitle: "先定规则，再执行，不临时决定。" },
  { title: "让系统帮你坚持下去", subtitle: "提醒为执行服务，记录为复盘服务。" },
  { title: "确认你的定投规则", subtitle: "创建后可在详情页继续记录和复盘。" },
];

const productTabs: Array<{ value: ProductType | "all"; label: string }> = [
  { value: "broad_index", label: "宽基" },
  { value: "factor_index", label: "策略" },
  { value: "industry_index", label: "行业" },
  { value: "portfolio", label: "组合" },
  { value: "all", label: "全部" },
];

const buyMethods: Array<{ value: BuyMethod; label: string }> = [
  { value: "fixed_amount", label: "固定金额" },
  { value: "variable_amount", label: "定期不定额" },
  { value: "valuation_dca", label: "估值定投" },
  { value: "custom", label: "自定义" },
];

const sellStrategies: Array<{ value: SellStrategy; label: string; desc: string }> = [
  { value: "long_hold", label: "长期持有", desc: "适合财务自由、现金流或长期增值目标" },
  { value: "valuation_take", label: "估值止盈", desc: "高估时分批卖出，适合长期定投" },
  { value: "profit_take", label: "收益率止盈", desc: "适合短期用钱场景" },
];

const recordFieldOptions: Array<{ value: keyof RecordFields; label: string }> = [
  { value: "date", label: "日期" },
  { value: "product", label: "品种" },
  { value: "action", label: "买/卖" },
  { value: "amount", label: "金额" },
  { value: "valuation", label: "估值" },
  { value: "note", label: "备注" },
];

const draft = computed(() => store.draft);
const current = computed(() => steps[step.value]);
const budgetRisk = computed(() => getBudgetRisk(draft.value));
const goalHint = computed(() => getGoalHint(draft.value.goal_type, draft.value.goal_term));
const filteredProducts = computed(() => productFilter.value === "all" ? productOptions : productOptions.filter((item) => item.type === productFilter.value));
const summaryRows = computed(() => [
  { label: "目标", value: `${goalLabels[draft.value.goal_type]} · ${termLabels[draft.value.goal_term]}` },
  { label: "预算", value: `每月 ¥${draft.value.monthly_budget}` },
  { label: "品种", value: draft.value.investment_products.map((item) => item.name).join("、") || "未选择" },
  { label: "买入", value: `低估 ${draft.value.buy_rule.low_multiplier} 倍，正常 1 倍，高估${draft.value.buy_rule.high_action === "pause" ? "暂停" : "0.5 倍"}` },
  { label: "频率", value: `${draft.value.frequency === "monthly" ? "每月" : "每周"} · ${draft.value.execution_date === "salary_next_trading_day" ? "发工资后第一个交易日" : `每月 ${draft.value.custom_execution_day} 日`}` },
  { label: "卖出", value: sellStrategies.find((item) => item.value === draft.value.sell_rule.strategy)?.label || "长期持有" },
  { label: "提醒", value: draft.value.reminder_settings.dca_reminder ? `开启 · ${draft.value.reminder_settings.execution_time}` : "关闭" },
]);

type UniSwitchEvent = Event & {
  detail?: {
    value?: boolean;
  };
};

type UniInputEvent = Event & {
  detail?: {
    value?: string | number;
  };
};

onLoad((query) => {
  store.hydrate();
  if (query?.edit === "1") {
    store.resetDraft();
  }
  if (query?.step) {
    const target = Number(query.step);
    if (!Number.isNaN(target)) step.value = Math.min(Math.max(target, 0), steps.length - 1);
  }
});

function selectGoal(value: GoalType): void {
  store.patchDraft({ goal_type: value });
  track("select_goal", { value });
}

function selectTerm(value: GoalTerm): void {
  store.patchDraft({ goal_term: value });
}

function updateGoalDesc(event: Event): void {
  store.patchDraft({ goal_desc: getInputValue(event) });
}

function updateMonthlyBudget(event: Event): void {
  store.patchDraft({ monthly_budget: toNumber(getInputValue(event)) });
  track("fill_budget");
}

function updateSurplus(event: Event): void {
  store.patchDraft({ disposable_surplus: toNumber(getInputValue(event)) });
}

function toggleReserve(event: Event): void {
  store.patchDraft({ has_emergency_reserve: getSwitchValue(event) });
}

function toggleLargeExpense(event: Event): void {
  store.patchDraft({ has_large_expense_in_3_years: getSwitchValue(event) });
}

function toggleProduct(product: ProductChoice): void {
  const selected = isProductSelected(product.id);
  const products = selected
    ? draft.value.investment_products.filter((item) => item.id !== product.id)
    : [...draft.value.investment_products, product];
  store.patchDraft({ investment_products: products });
  track("select_product", { product_id: product.id, selected: !selected });
}

function isProductSelected(productId: string): boolean {
  return draft.value.investment_products.some((item) => item.id === productId);
}

function setBuyMethod(method: BuyMethod): void {
  store.patchDraft({ buy_rule: { ...draft.value.buy_rule, method } });
  track("select_buy_rule", { method });
}

function setLowMultiplier(value: number): void {
  store.patchDraft({ buy_rule: { ...draft.value.buy_rule, low_multiplier: value } });
}

function setHighAction(value: "pause" | "half"): void {
  store.patchDraft({
    buy_rule: {
      ...draft.value.buy_rule,
      high_action: value,
      high_multiplier: value === "pause" ? 0 : 0.5,
    },
  });
}

function setFrequency(value: Frequency): void {
  store.patchDraft({ frequency: value });
}

function setExecutionDate(value: ExecutionDate): void {
  store.patchDraft({ execution_date: value });
}

function updateCustomDay(event: Event): void {
  store.patchDraft({ custom_execution_day: toNumber(getInputValue(event), 5) });
}

function setSellStrategy(strategy: SellStrategy): void {
  store.patchDraft({ sell_rule: { ...draft.value.sell_rule, strategy } });
}

function updateSellThreshold(event: Event): void {
  store.patchDraft({ sell_rule: { ...draft.value.sell_rule, threshold: toNumber(getInputValue(event), 30) } });
}

function updateFundDestination(event: Event): void {
  store.patchDraft({ sell_rule: { ...draft.value.sell_rule, fund_destination: getInputValue(event) } });
}

function toggleDcaReminder(event: Event): void {
  const enabled = getSwitchValue(event);
  store.patchDraft({ reminder_settings: { ...draft.value.reminder_settings, dca_reminder: enabled } });
  if (enabled) track("enable_reminder", { type: "dca" });
}

function updateExecutionTime(event: Event): void {
  store.patchDraft({ reminder_settings: { ...draft.value.reminder_settings, execution_time: getInputValue(event) } });
}

function toggleValuationReminder(event: Event): void {
  store.patchDraft({ reminder_settings: { ...draft.value.reminder_settings, valuation_reminder: getSwitchValue(event) } });
}

function toggleReviewReminder(event: Event): void {
  store.patchDraft({ reminder_settings: { ...draft.value.reminder_settings, monthly_review_reminder: getSwitchValue(event) } });
}

function toggleRecordField(field: keyof RecordFields): void {
  store.patchDraft({ record_fields: { ...draft.value.record_fields, [field]: !draft.value.record_fields[field] } });
}

function next(): void {
  const error = validateWizardStep(step.value, draft.value);
  if (error) {
    uni.showToast({ title: error, icon: "none" });
    return;
  }
  if (step.value < steps.length - 1) {
    step.value += 1;
    return;
  }
  store.createOrUpdatePlan();
  track("complete_plan_creation");
  uni.redirectTo({ url: "/pages/plan-detail/index" });
}

function back(): void {
  if (step.value > 0) {
    step.value -= 1;
    return;
  }
  uni.navigateBack({
    fail: () => uni.redirectTo({ url: "/pages/index/index" }),
  });
}

function getInputValue(event: Event): string {
  const detailValue = (event as UniInputEvent).detail?.value;
  if (detailValue !== undefined && detailValue !== null) {
    return String(detailValue);
  }
  const target = event.target as HTMLInputElement;
  return target?.value ?? "";
}

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getSwitchValue(event: Event): boolean {
  return Boolean((event as UniSwitchEvent).detail?.value);
}
</script>

<style scoped>
.wizard-card {
  margin-top: 8rpx;
  padding: 26rpx;
}

.step-panel {
  display: grid;
  gap: 22rpx;
}

.option-grid {
  display: grid;
  gap: 18rpx;
}

.segmented,
.button-grid,
.product-tabs,
.record-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.segment,
.choice-button,
.tab,
.field-chip {
  min-height: 66rpx;
  padding: 0 22rpx;
  border: 1rpx solid #cfd6cc;
  border-radius: 999rpx;
  background: #fffdf8;
  color: #203028;
  font-size: 25rpx;
  font-weight: 750;
}

.segment.active,
.choice-button.active,
.tab.active,
.field-chip.active {
  border-color: #2f7d52;
  background: #2f7d52;
  color: #ffffff;
}

.hint-box {
  padding: 22rpx 24rpx;
  border-radius: 16rpx;
  background: #ecf4eb;
  color: #24513a;
  font-size: 25rpx;
  line-height: 1.45;
}

.hint-box.warn {
  background: #fff5df;
  color: #8a6222;
}

.hint-box.danger {
  background: #fff0eb;
  color: #8c4b35;
}

.field {
  display: grid;
  gap: 12rpx;
}

.amount {
  color: #2f7d52;
  font-size: 42rpx;
  font-weight: 900;
}

.switch-row {
  display: flex;
  min-height: 104rpx;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 20rpx 24rpx;
  border: 1rpx solid #d8d8cf;
  border-radius: 16rpx;
  background: #fffdf8;
}

.switch-title {
  display: block;
  color: #203028;
  font-size: 28rpx;
  font-weight: 850;
}

.switch-desc {
  display: block;
  margin-top: 8rpx;
  color: #6c746b;
  font-size: 23rpx;
}

.rule-table,
.summary-list {
  overflow: hidden;
  border: 1rpx solid #d8d8cf;
  border-radius: 16rpx;
  background: #fffdf8;
}

.rule-row,
.summary-row {
  display: flex;
  min-height: 82rpx;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #ecece5;
}

.rule-row:last-child,
.summary-row:last-child {
  border-bottom: 0;
}

.state,
.summary-label {
  flex-shrink: 0;
  color: #6c746b;
  font-size: 24rpx;
  font-weight: 850;
}

.state.low {
  color: #2f7d52;
}

.state.normal {
  color: #355c7d;
}

.state.high {
  color: #8c4b35;
}

.summary-value {
  min-width: 0;
  flex: 1;
  color: #203028;
  font-size: 25rpx;
  font-weight: 750;
  line-height: 1.35;
  text-align: right;
}

.compliance {
  color: #8a6222;
  font-size: 23rpx;
  line-height: 1.55;
}
</style>
