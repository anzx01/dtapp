<template>
  <view class="page">
    <view class="mobile-shell" v-if="plan">
      <view class="action-hero" :class="suggested.tone">
        <view class="hero-meta">
          <text>{{ statusLabels[plan.status] }}</text>
          <text>{{ valuationLabels[plan.valuation_state] }}</text>
        </view>
        <text class="hero-label">当前建议动作</text>
        <text class="hero-action">{{ suggested.label }}{{ suggested.amount > 0 ? ` ¥${suggested.amount}` : "" }}</text>
        <text class="hero-reason">{{ suggested.reason }}</text>
      </view>

      <view class="quick-grid">
        <view class="metric surface">
          <text class="metric-label">目标</text>
          <text class="metric-value">{{ goalLabels[plan.goal_type] }}</text>
        </view>
        <view class="metric surface">
          <text class="metric-label">月预算</text>
          <text class="metric-value">¥{{ plan.monthly_budget }}</text>
        </view>
        <view class="metric surface">
          <text class="metric-label">下次执行</text>
          <text class="metric-value small">{{ plan.next_execution_at }}</text>
        </view>
        <view class="metric surface">
          <text class="metric-label">记录数</text>
          <text class="metric-value">{{ store.records.length }}</text>
        </view>
      </view>

      <view class="section surface">
        <view class="section-head">
          <text class="section-title">估值状态演示</text>
          <text class="section-sub">V1.0 使用手动/模拟状态</text>
        </view>
        <view class="chip-row">
          <button
            v-for="item in valuationOptions"
            :key="item.value"
            class="state-chip"
            :class="{ active: plan.valuation_state === item.value }"
            @click="setValuation(item.value)"
          >
            {{ item.label }}
          </button>
        </view>
      </view>

      <view class="section surface">
        <view class="section-head">
          <text class="section-title">规则摘要</text>
          <text class="section-sub">修改前会二次确认</text>
        </view>
        <view class="summary-row">
          <text>品种</text>
          <text>{{ plan.investment_products.map((item) => item.name).join("、") }}</text>
        </view>
        <view class="summary-row">
          <text>买入</text>
          <text>低估 {{ plan.buy_rule.low_multiplier }} 倍，正常 1 倍，高估{{ plan.buy_rule.high_action === "pause" ? "暂停" : "0.5 倍" }}</text>
        </view>
        <view class="summary-row">
          <text>卖出</text>
          <text>{{ sellStrategyLabel }}</text>
        </view>
        <view class="summary-row">
          <text>提醒</text>
          <text>{{ plan.reminder_settings.dca_reminder ? `${plan.reminder_settings.execution_time} 开启` : "关闭" }}</text>
        </view>
      </view>

      <view v-if="store.latestRecord" class="section surface">
        <view class="section-head">
          <text class="section-title">最近记录</text>
          <text class="section-sub">{{ store.latestRecord.date }}</text>
        </view>
        <text class="record-line">买入 ¥{{ store.latestRecord.amount }} · {{ valuationLabels[store.latestRecord.valuation_state] }}</text>
      </view>

      <view v-if="store.latestReview" class="section surface">
        <view class="section-head">
          <text class="section-title">最近复盘</text>
          <text class="section-sub">{{ store.latestReview.period === "monthly" ? "月度" : "手动" }}</text>
        </view>
        <text class="record-line">{{ store.latestReview.summary }}</text>
      </view>

      <view class="action-stack">
        <button class="primary-button" @click="goRecord">立即执行 / 记录结果</button>
        <button class="secondary-button" @click="goReview">查看复盘建议</button>
        <button class="secondary-button" @click="confirmModify">修改计划</button>
        <button class="secondary-button" @click="toggleStatus">{{ plan.status === "paused" ? "恢复计划" : "暂停计划" }}</button>
      </view>
    </view>

    <view class="page empty-page" v-else>
      <text class="empty-title">还没有定投计划</text>
      <button class="primary-button" @click="goCreate">创建计划</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { track } from "../../domain/analytics";
import {
  getSuggestedAction,
  goalLabels,
  statusLabels,
  valuationLabels,
  type SellStrategy,
  type ValuationState,
} from "../../domain/plan";
import { usePlanStore } from "../../stores/planStore";

const store = usePlanStore();

const valuationOptions: Array<{ value: ValuationState; label: string }> = [
  { value: "low", label: "低估" },
  { value: "normal", label: "正常" },
  { value: "high", label: "高估" },
  { value: "unknown", label: "未知" },
];

const sellLabels: Record<SellStrategy, string> = {
  long_hold: "长期持有",
  valuation_take: "估值止盈",
  profit_take: "收益率止盈",
};

const plan = computed(() => store.plan);
const suggested = computed(() => plan.value ? getSuggestedAction(plan.value) : { label: "", amount: 0, tone: "hold" as const, reason: "" });
const sellStrategyLabel = computed(() => plan.value ? sellLabels[plan.value.sell_rule.strategy] : "");

onShow(() => {
  store.hydrate();
});

function setValuation(value: ValuationState): void {
  store.patchPlan({ valuation_state: value });
}

function goRecord(): void {
  uni.navigateTo({ url: "/pages/record/index" });
}

function goReview(): void {
  uni.navigateTo({ url: "/pages/review/index" });
}

function goCreate(): void {
  store.resetDraft();
  uni.redirectTo({ url: "/pages/wizard/index" });
}

function confirmModify(): void {
  uni.showModal({
    title: "修改计划",
    content: "修改计划会影响后续执行，建议确认修改原因后再保存。是否继续？",
    confirmText: "继续修改",
    cancelText: "先不改",
    success: (result) => {
      if (result.confirm) {
        track("modify_plan");
        uni.navigateTo({ url: "/pages/wizard/index?edit=1&step=0" });
      }
    },
  });
}

function toggleStatus(): void {
  if (!plan.value) return;
  const next = plan.value.status === "paused" ? "active" : "paused";
  store.setPlanStatus(next);
  if (next === "paused") track("pause_plan");
}
</script>

<style scoped>
.action-hero {
  padding: 34rpx;
  border-radius: 22rpx;
  background: #17251e;
  color: #ffffff;
}

.action-hero.pause {
  background: #5d4631;
}

.action-hero.hold {
  background: #26394d;
}

.hero-meta {
  display: flex;
  justify-content: space-between;
  color: #d9e5dc;
  font-size: 23rpx;
  font-weight: 800;
}

.hero-label {
  display: block;
  margin-top: 34rpx;
  color: #cbd9ce;
  font-size: 24rpx;
  font-weight: 800;
}

.hero-action {
  display: block;
  margin-top: 12rpx;
  font-size: 54rpx;
  font-weight: 950;
  line-height: 1.12;
}

.hero-reason {
  display: block;
  margin-top: 18rpx;
  color: #edf5ee;
  font-size: 25rpx;
  line-height: 1.5;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
  margin-top: 24rpx;
}

.metric {
  min-height: 132rpx;
  padding: 24rpx;
}

.metric-label {
  display: block;
  color: #6c746b;
  font-size: 23rpx;
  font-weight: 800;
}

.metric-value {
  display: block;
  margin-top: 14rpx;
  color: #203028;
  font-size: 34rpx;
  font-weight: 950;
  line-height: 1.15;
}

.metric-value.small {
  font-size: 25rpx;
  line-height: 1.3;
}

.section {
  margin-top: 22rpx;
  padding: 26rpx;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 18rpx;
}

.section-title {
  color: #203028;
  font-size: 29rpx;
  font-weight: 900;
}

.section-sub {
  color: #6c746b;
  font-size: 22rpx;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.state-chip {
  min-height: 64rpx;
  padding: 0 24rpx;
  border: 1rpx solid #cfd6cc;
  border-radius: 999rpx;
  background: #fffdf8;
  color: #203028;
  font-size: 25rpx;
  font-weight: 800;
}

.state-chip.active {
  border-color: #2f7d52;
  background: #2f7d52;
  color: #ffffff;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 22rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #ecece5;
  color: #6c746b;
  font-size: 24rpx;
  line-height: 1.4;
}

.summary-row text:last-child {
  max-width: 440rpx;
  color: #203028;
  font-weight: 750;
  text-align: right;
}

.summary-row:last-child {
  border-bottom: 0;
}

.record-line {
  color: #203028;
  font-size: 26rpx;
  line-height: 1.5;
}

.action-stack {
  display: grid;
  gap: 16rpx;
  margin-top: 28rpx;
}

.empty-page {
  display: grid;
  min-height: 78vh;
  align-content: center;
  gap: 28rpx;
}

.empty-title {
  text-align: center;
  color: #203028;
  font-size: 36rpx;
  font-weight: 900;
}
</style>
