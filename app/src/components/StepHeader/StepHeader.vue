<template>
  <view class="step-header">
    <view class="eyebrow">{{ eyebrow }}</view>
    <text class="title">{{ title }}</text>
    <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
    <view v-if="total > 0" class="progress-row">
      <view class="progress-track">
        <view class="progress-fill" :style="{ width: `${Math.round((step / total) * 100)}%` }" />
      </view>
      <text class="progress-text">{{ step }}/{{ total }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps({
  eyebrow: {
    type: String,
    default: "定投计划设置",
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  step: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped>
.step-header {
  padding: 20rpx 0 28rpx;
}

.eyebrow {
  margin-bottom: 14rpx;
  color: #2f7d52;
  font-size: 23rpx;
  font-weight: 800;
}

.title {
  display: block;
  color: #17251e;
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1.2;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: break-all !important;
}

.subtitle {
  display: block;
  margin-top: 16rpx;
  color: #6c746b;
  font-size: 26rpx;
  line-height: 1.55;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: break-all !important;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-top: 28rpx;
}

.progress-track {
  flex: 1;
  height: 10rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #e3e5dd;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #2f7d52;
  transition: width 180ms ease;
}

.progress-text {
  color: #6c746b;
  font-size: 23rpx;
  font-weight: 700;
}
</style>
