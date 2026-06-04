<template>
  <view class="page">
    <view class="mobile-shell" v-if="plan">
      <StepHeader title="月度复盘与优化" subtitle="一份好的计划不是一成不变的，复盘是为了更好地坚持。" />

      <view class="review-card surface">
        <view class="stats-row">
          <view class="stat">
            <text class="stat-label">本月记录</text>
            <text class="stat-value">{{ store.records.length }}</text>
          </view>
          <view class="stat">
            <text class="stat-label">计划状态</text>
            <text class="stat-value small">{{ plan.status === "active" ? "进行中" : "暂停中" }}</text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">复盘周期</text>
          <view class="button-grid">
            <button class="choice-button" :class="{ active: period === 'monthly' }" @click="period = 'monthly'">每月</button>
            <button class="choice-button" :class="{ active: period === 'quarterly' }" @click="period = 'quarterly'">每季度</button>
            <button class="choice-button" :class="{ active: period === 'manual' }" @click="period = 'manual'">手动</button>
          </view>
        </view>

        <view class="check-list">
          <view class="switch-row">
            <view>
              <text class="switch-title">是否按计划执行</text>
              <text class="switch-desc">本周期大部分时间是否遵守规则</text>
            </view>
            <switch :checked="executedAsPlanned" color="#2f7d52" @change="executedAsPlanned = getSwitchValue($event)" />
          </view>
          <view class="switch-row">
            <view>
              <text class="switch-title">是否错过定投</text>
              <text class="switch-desc">若错过，后续需调整提醒</text>
            </view>
            <switch :checked="missedExecution" color="#2f7d52" @change="missedExecution = getSwitchValue($event)" />
          </view>
          <view class="switch-row">
            <view>
              <text class="switch-title">是否修改过预算</text>
              <text class="switch-desc">频繁修改会影响执行稳定性</text>
            </view>
            <switch :checked="budgetChanged" color="#2f7d52" @change="budgetChanged = getSwitchValue($event)" />
          </view>
          <view class="switch-row">
            <view>
              <text class="switch-title">品种是否仍然合适</text>
              <text class="switch-desc">V1.0 建议少而精</text>
            </view>
            <switch :checked="productsStillSuitable" color="#2f7d52" @change="productsStillSuitable = getSwitchValue($event)" />
          </view>
          <view class="switch-row">
            <view>
              <text class="switch-title">是否达到卖出条件</text>
              <text class="switch-desc">只按预设规则判断</text>
            </view>
            <switch :checked="sellConditionReached" color="#2f7d52" @change="sellConditionReached = getSwitchValue($event)" />
          </view>
        </view>

        <view class="field">
          <text class="field-label">复盘总结</text>
          <textarea class="text-area-input" maxlength="160" :value="summary" @input="summary = getInputValue($event)" />
        </view>

        <view class="hint-box">
          <text>{{ suggestion }}</text>
        </view>
      </view>

      <ActionBar primary="保存复盘" secondary="返回详情" @primary="save" @secondary="back" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import StepHeader from "../../components/StepHeader/StepHeader.vue";
import ActionBar from "../../components/ActionBar/ActionBar.vue";
import { track } from "../../domain/analytics";
import type { ReviewRecord } from "../../domain/plan";
import { usePlanStore } from "../../stores/planStore";

const store = usePlanStore();

const period = ref<ReviewRecord["period"]>("monthly");
const executedAsPlanned = ref(true);
const missedExecution = ref(false);
const budgetChanged = ref(false);
const productsStillSuitable = ref(true);
const sellConditionReached = ref(false);
const summary = ref("继续当前预算，保持规则执行。");

const plan = computed(() => store.plan);
const suggestion = computed(() => {
  if (sellConditionReached.value) return "已达到卖出条件时，只按预设规则分批处理，不临时决定。";
  if (missedExecution.value) return "本周期有错过执行，建议检查提醒时间是否合适。";
  if (budgetChanged.value) return "预算发生变化，建议确认不影响正常生活后再保存。";
  if (!productsStillSuitable.value) return "品种不再合适时，先记录原因，再谨慎调整计划。";
  return "执行稳定，可以继续当前规则。";
});

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

onLoad(() => {
  store.hydrate();
  if (!store.plan) {
    uni.redirectTo({ url: "/pages/index/index" });
  }
});

function save(): void {
  store.saveReview({
    period: period.value,
    executed_as_planned: executedAsPlanned.value,
    missed_execution: missedExecution.value,
    budget_changed: budgetChanged.value,
    products_still_suitable: productsStillSuitable.value,
    sell_condition_reached: sellConditionReached.value,
    summary: summary.value,
  });
  track("create_review_record", { period: period.value });
  uni.showToast({ title: "复盘已保存", icon: "success" });
  setTimeout(() => {
    uni.redirectTo({ url: "/pages/plan-detail/index" });
  }, 300);
}

function back(): void {
  uni.redirectTo({ url: "/pages/plan-detail/index" });
}

function getInputValue(event: Event): string {
  const detailValue = (event as UniInputEvent).detail?.value;
  if (detailValue !== undefined && detailValue !== null) {
    return String(detailValue);
  }
  const target = event.target as HTMLTextAreaElement;
  return target?.value ?? "";
}

function getSwitchValue(event: Event): boolean {
  return Boolean((event as UniSwitchEvent).detail?.value);
}
</script>

<style scoped>
.review-card {
  display: grid;
  gap: 24rpx;
  margin-top: 10rpx;
  padding: 26rpx;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.stat {
  padding: 24rpx;
  border-radius: 16rpx;
  background: #ecf4eb;
}

.stat-label {
  display: block;
  color: #52715e;
  font-size: 23rpx;
  font-weight: 800;
}

.stat-value {
  display: block;
  margin-top: 12rpx;
  color: #203028;
  font-size: 42rpx;
  font-weight: 950;
}

.stat-value.small {
  font-size: 30rpx;
}

.field,
.check-list {
  display: grid;
  gap: 14rpx;
}

.button-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.choice-button {
  min-height: 66rpx;
  padding: 0 24rpx;
  border: 1rpx solid #cfd6cc;
  border-radius: 999rpx;
  background: #fffdf8;
  color: #203028;
  font-size: 25rpx;
  font-weight: 800;
}

.choice-button.active {
  border-color: #2f7d52;
  background: #2f7d52;
  color: #ffffff;
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

.hint-box {
  padding: 22rpx 24rpx;
  border-radius: 16rpx;
  background: #ecf4eb;
  color: #24513a;
  font-size: 25rpx;
  line-height: 1.45;
}
</style>
