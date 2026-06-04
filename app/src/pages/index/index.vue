<template>
  <view class="page">
    <view class="mobile-shell">
      <StepHeader
        :eyebrow="plan ? '定投执行台' : '定投计划设置向导'"
        :title="plan ? '今天按计划走' : '只需几步，创建你的定投计划'"
        :subtitle="plan ? '只看和当前计划有关的动作，不追涨跌。' : '先设规则，再开始执行。默认值可以直接使用，高级配置后续再调整。'"
      />

      <view v-if="plan && todayTask && stats && incomeProjection && reviewInsight" class="today-panel">
        <view class="today-card" :class="todayTask.tone">
          <view class="today-top">
            <text class="today-status">{{ todayTask.title }}</text>
            <text class="today-date">{{ todayTask.next_execution_at }}</text>
          </view>
          <text class="today-action">{{ todayTask.label }}{{ todayTask.amount > 0 ? ` ¥${formatMoney(todayTask.amount)}` : "" }}</text>
          <text class="today-detail">{{ todayTask.detail }}</text>
        </view>

        <view class="pulse-grid">
          <view class="pulse-item surface">
            <text class="pulse-label">连续执行</text>
            <text class="pulse-value">{{ stats.streak_count }} 次</text>
          </view>
          <view class="pulse-item surface">
            <text class="pulse-label">本月完成</text>
            <text class="pulse-value">{{ stats.month_completion_rate }}%</text>
          </view>
          <view class="pulse-item wide surface">
            <text class="pulse-label">{{ incomeProjection.projection_years }} 年后预计总收入</text>
            <text class="pulse-value">¥{{ formatMoney(incomeProjection.total_income) }}</text>
          </view>
        </view>

        <view class="review-strip surface" :class="reviewInsight.tone">
          <text class="review-title">{{ reviewInsight.title }}</text>
          <text class="review-copy">{{ reviewInsight.detail }}</text>
        </view>
      </view>

      <view v-else class="hero-card">
        <view class="hero-top">
          <text class="hero-kicker">V1.0</text>
          <text class="hero-status">未创建计划</text>
        </view>
        <text class="hero-title">3 分钟生成一份可执行计划</text>
        <text class="hero-copy">目标、预算、品种、买入、卖出、提醒一次配置，后续按规则执行。</text>
      </view>

      <view v-if="!plan" class="principles">
        <view v-for="item in principles" :key="item.title" class="principle-item">
          <text class="principle-index">{{ item.index }}</text>
          <view class="principle-copy">
            <text class="principle-title">{{ item.title }}</text>
            <text class="principle-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <view v-if="!plan" class="compliance surface">
        <text class="compliance-title">重要提示</text>
        <text class="fine-print">
          本工具仅用于计划配置、执行提醒和记录复盘，不提供交易下单，不构成投资建议。市场有风险，最终决策需由你独立判断。
        </text>
      </view>

      <ActionBar
        :primary="plan ? (todayTask?.status === 'due' ? '立即记录' : '查看计划详情') : '开始设置'"
        :secondary="plan ? '月度复盘' : '查看示例'"
        @primary="goPrimary"
        @secondary="goSecondary"
      />

      <button v-if="!plan" class="skip-button" @click="createDefaultPlan">跳过，使用默认计划</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import StepHeader from "../../components/StepHeader/StepHeader.vue";
import ActionBar from "../../components/ActionBar/ActionBar.vue";
import { track } from "../../domain/analytics";
import { calculateExpectedIncomeProjection, getExecutionStats, getReviewInsight, getTodayTask } from "../../domain/plan";
import { usePlanStore } from "../../stores/planStore";

const store = usePlanStore();

const principles = [
  { index: "01", title: "规则先行", desc: "先定义目标、预算、买入和卖出规则。" },
  { index: "02", title: "默认简单", desc: "默认项足够开始，避免首次决策过多。" },
  { index: "03", title: "可记录可复盘", desc: "每次执行后可记录，按月检查计划。" },
];

const plan = computed(() => store.plan);
const todayTask = computed(() => plan.value ? getTodayTask(plan.value, store.records) : null);
const stats = computed(() => plan.value ? getExecutionStats(plan.value, store.records) : null);
const incomeProjection = computed(() => plan.value ? calculateExpectedIncomeProjection(plan.value, store.records) : null);
const reviewInsight = computed(() => plan.value ? getReviewInsight(plan.value, store.records, store.reviews) : null);

onShow(() => {
  store.hydrate();
  track("enter_onboarding");
});

function goPrimary(): void {
  if (plan.value && todayTask.value?.status === "due") {
    uni.navigateTo({ url: "/pages/record/index" });
    return;
  }
  if (plan.value) {
    uni.navigateTo({ url: "/pages/plan-detail/index" });
    return;
  }
  store.resetDraft();
  uni.navigateTo({ url: "/pages/wizard/index" });
}

function goSecondary(): void {
  if (plan.value) {
    uni.navigateTo({ url: "/pages/review/index" });
    return;
  }
  showExample();
}

function showExample(): void {
  uni.showModal({
    title: "示例计划",
    content: "目标：财务自由；预算：每月 3000 元；品种：沪深300；规则：低估 1.5 倍、正常 1 倍、高估暂停。",
    confirmText: "按示例开始",
    cancelText: "继续查看",
    success: (result) => {
      if (result.confirm) {
        store.resetDraft();
        uni.navigateTo({ url: "/pages/wizard/index?example=1" });
      }
    },
  });
}

function createDefaultPlan(): void {
  store.resetDraft();
  store.createOrUpdatePlan();
  track("complete_plan_creation", { mode: "skip_default" });
  uni.redirectTo({ url: "/pages/plan-detail/index" });
}

function formatMoney(value: number): string {
  return Math.round(value).toLocaleString("zh-CN");
}
</script>

<style scoped>
.today-panel {
  display: grid;
  gap: 18rpx;
  margin-top: 18rpx;
}

.today-card {
  padding: 34rpx;
  border-radius: 20rpx;
  background: #17251e;
  color: #ffffff;
}

.today-card.pause {
  background: #5d4631;
}

.today-card.hold {
  background: #26394d;
}

.today-top {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
}

.today-status,
.today-date {
  color: #ccdecf;
  font-size: 23rpx;
  font-weight: 850;
}

.today-date {
  max-width: 260rpx;
  text-align: right;
}

.today-action {
  display: block;
  margin-top: 34rpx;
  font-size: 52rpx;
  font-weight: 950;
  line-height: 1.12;
}

.today-detail {
  display: block;
  margin-top: 18rpx;
  color: #edf5ee;
  font-size: 25rpx;
  line-height: 1.5;
}

.pulse-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.pulse-item {
  min-height: 128rpx;
  padding: 24rpx;
}

.pulse-item.wide {
  grid-column: span 2;
}

.pulse-label {
  display: block;
  color: #6c746b;
  font-size: 23rpx;
  font-weight: 800;
}

.pulse-value {
  display: block;
  margin-top: 12rpx;
  color: #203028;
  font-size: 36rpx;
  font-weight: 950;
  line-height: 1.15;
}

.review-strip {
  padding: 24rpx;
}

.review-strip.warn {
  background: #fff5df;
}

.review-strip.ok {
  background: #ecf4eb;
}

.review-title {
  display: block;
  color: #203028;
  font-size: 28rpx;
  font-weight: 900;
}

.review-copy {
  display: block;
  margin-top: 10rpx;
  color: #6c746b;
  font-size: 24rpx;
  line-height: 1.45;
}

.hero-card {
  margin-top: 18rpx;
  padding: 34rpx;
  border-radius: 20rpx;
  background: #17251e;
  color: #ffffff;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 34rpx;
}

.hero-kicker,
.hero-status {
  color: #ccdecf;
  font-size: 23rpx;
  font-weight: 800;
}

.hero-status {
  max-width: 180rpx;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-title {
  display: block;
  max-width: 100%;
  font-size: 46rpx;
  font-weight: 950;
  line-height: 1.18;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: break-all !important;
}

.hero-copy {
  display: block;
  margin-top: 20rpx;
  color: #dce7dd;
  font-size: 26rpx;
  line-height: 1.55;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: break-all !important;
}

.principles {
  display: grid;
  gap: 18rpx;
  margin-top: 28rpx;
}

.principle-item {
  display: flex;
  gap: 22rpx;
  padding: 24rpx;
  border: 1rpx solid #d8d8cf;
  border-radius: 16rpx;
  background: #fffdf8;
}

.principle-index {
  color: #2f7d52;
  font-size: 24rpx;
  font-weight: 900;
}

.principle-copy {
  min-width: 0;
  flex: 1;
}

.principle-title {
  display: block;
  color: #203028;
  font-size: 29rpx;
  font-weight: 850;
}

.principle-desc {
  display: block;
  margin-top: 8rpx;
  color: #6c746b;
  font-size: 24rpx;
  line-height: 1.45;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: break-all !important;
}

.fine-print {
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: break-all !important;
}

.compliance {
  margin-top: 28rpx;
  padding: 24rpx;
}

.compliance-title {
  display: block;
  margin-bottom: 10rpx;
  color: #8a6222;
  font-size: 24rpx;
  font-weight: 900;
}

.skip-button {
  display: flex;
  justify-content: center;
  margin-top: 22rpx;
  color: #6c746b;
  font-size: 25rpx;
}
</style>
