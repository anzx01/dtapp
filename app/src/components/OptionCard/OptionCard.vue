<template>
  <view class="option-card" :class="{ active, compact }" @click="$emit('select')">
    <view class="text-block">
      <text class="label">{{ label }}</text>
      <text v-if="desc" class="desc">{{ desc }}</text>
    </view>
    <view class="mark">{{ active ? "✓" : "" }}</view>
  </view>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

defineEmits<{
  (event: "select"): void;
}>();
</script>

<style scoped>
.option-card {
  display: flex;
  min-height: 118rpx;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 24rpx 24rpx 24rpx 28rpx;
  border: 1rpx solid #d8d8cf;
  border-radius: 16rpx;
  background: #fffdf8;
}

.option-card.compact {
  min-height: 84rpx;
  padding-top: 18rpx;
  padding-bottom: 18rpx;
}

.option-card.active {
  border-color: #2f7d52;
  background: #ecf4eb;
}

.text-block {
  min-width: 0;
  flex: 1;
}

.label {
  display: block;
  color: #1d2e25;
  font-size: 29rpx;
  font-weight: 850;
  line-height: 1.25;
}

.desc {
  display: block;
  margin-top: 8rpx;
  color: #6c746b;
  font-size: 23rpx;
  line-height: 1.35;
}

.mark {
  display: flex;
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #c9d1c7;
  border-radius: 50%;
  background: #ffffff;
  color: #2f7d52;
  font-size: 24rpx;
  font-weight: 900;
}

.active .mark {
  border-color: #2f7d52;
}
</style>
