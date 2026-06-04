<template>
  <view class="page">
    <view class="mobile-shell" v-if="plan">
      <StepHeader title="记录本次定投结果" subtitle="记录不是负担，是复盘基础。" />

      <view class="form-card surface">
        <view class="field">
          <text class="field-label">日期</text>
          <input class="text-input" :value="date" @input="date = getInputValue($event)" />
        </view>

        <view class="field">
          <text class="field-label">品种</text>
          <view class="product-box">{{ productName }}</view>
        </view>

        <view class="button-grid">
          <button class="choice-button" :class="{ active: actionType === 'buy' }" @click="actionType = 'buy'">买入</button>
          <button class="choice-button" :class="{ active: actionType === 'sell' }" @click="actionType = 'sell'">卖出</button>
        </view>

        <view class="field">
          <text class="field-label">金额</text>
          <input class="text-input amount" type="number" :value="amount" @input="amount = toNumber(getInputValue($event))" />
        </view>

        <view class="field">
          <text class="field-label">估值状态</text>
          <view class="button-grid">
            <button
              v-for="option in valuationOptions"
              :key="option.value"
              class="choice-button"
              :class="{ active: valuationState === option.value }"
              @click="valuationState = option.value"
            >
              {{ option.label }}
            </button>
          </view>
        </view>

        <view class="field">
          <text class="field-label">备注（可选）</text>
          <textarea class="text-area-input" maxlength="120" :value="note" placeholder="例如：今天按计划执行" @input="note = getInputValue($event)" />
        </view>

        <view class="hint-box">
          <text>本页只记录执行结果，不提供交易下单。</text>
        </view>
      </view>

      <ActionBar primary="保存记录" secondary="返回详情" @primary="save" @secondary="back" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import StepHeader from "../../components/StepHeader/StepHeader.vue";
import ActionBar from "../../components/ActionBar/ActionBar.vue";
import { track } from "../../domain/analytics";
import { getSuggestedAction, today, valuationLabels, type ActionType, type ValuationState } from "../../domain/plan";
import { usePlanStore } from "../../stores/planStore";

const store = usePlanStore();
const date = ref(today());
const actionType = ref<ActionType>("buy");
const note = ref("");
const valuationState = ref<ValuationState>("low");
const amount = ref(0);

const valuationOptions: Array<{ value: ValuationState; label: string }> = [
  { value: "low", label: "低估" },
  { value: "normal", label: "正常" },
  { value: "high", label: "高估" },
  { value: "unknown", label: "未知" },
];

const plan = computed(() => store.plan);
const productName = computed(() => plan.value?.investment_products[0]?.name || "未选择");

type UniInputEvent = Event & {
  detail?: {
    value?: string | number;
  };
};

onLoad(() => {
  store.hydrate();
  if (!store.plan) {
    uni.redirectTo({ url: "/pages/index/index" });
    return;
  }
  valuationState.value = store.plan.valuation_state;
  amount.value = getSuggestedAction(store.plan).amount;
});

function save(): void {
  if (!plan.value) return;
  if (amount.value <= 0) {
    uni.showToast({ title: "请输入金额", icon: "none" });
    return;
  }

  const wasFirst = store.records.length === 0;
  store.saveRecord({
    date: date.value,
    action_type: actionType.value,
    amount: amount.value,
    valuation_state: valuationState.value,
    note: note.value,
  });
  if (wasFirst) track("complete_first_execution");
  uni.showToast({ title: "记录已保存", icon: "success" });
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
  const target = event.target as HTMLInputElement;
  return target?.value ?? "";
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
</script>

<style scoped>
.form-card {
  display: grid;
  gap: 24rpx;
  margin-top: 10rpx;
  padding: 26rpx;
}

.field {
  display: grid;
  gap: 12rpx;
}

.product-box {
  min-height: 88rpx;
  padding: 24rpx 28rpx;
  border: 1rpx solid #d8d8cf;
  border-radius: 16rpx;
  background: #f7f7f0;
  color: #203028;
  font-size: 28rpx;
  font-weight: 800;
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

.amount {
  color: #2f7d52;
  font-size: 40rpx;
  font-weight: 950;
}

.hint-box {
  padding: 22rpx 24rpx;
  border-radius: 16rpx;
  background: #fff5df;
  color: #8a6222;
  font-size: 24rpx;
  line-height: 1.45;
}
</style>
