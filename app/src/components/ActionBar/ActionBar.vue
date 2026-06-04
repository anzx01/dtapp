<template>
  <view class="action-bar">
    <button v-if="secondary" class="secondary-button action-secondary" @click="$emit('secondary')">
      {{ secondary }}
    </button>
    <button class="primary-button action-primary" :class="{ disabled }" :disabled="disabled" @click="$emit('primary')">
      {{ primary }}
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps({
  primary: {
    type: String,
    required: true,
  },
  secondary: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits<{
  (event: "primary"): void;
  (event: "secondary"): void;
}>();
</script>

<style scoped>
.action-bar {
  display: flex;
  gap: 18rpx;
  margin-top: 34rpx;
  padding-bottom: 12rpx;
}

.action-primary {
  flex: 1.5;
}

.action-secondary {
  flex: 1;
}

.disabled {
  opacity: 0.48;
}
</style>
