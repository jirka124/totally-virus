<template>
  <div class="status-circle" :class="[sizeClass]">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import { RECOGNIZED_STATUSES } from 'src/scripts/StatusCodes'

const props = defineProps({
  status: {
    type: Object,
    default: () => RECOGNIZED_STATUSES.OTHER,
  },
  size: {
    type: String,
    default: 'SMALL',
  },
})

const sizeClass = computed(() => {
  if (props.size === 'SMALL') return 'small'
  return 'medium'
})

const statusColor = computed(() => {
  if (Object.hasOwn(props.status, 'hex')) return props.status.hex
  return '#cbcbcb'
})
</script>

<style scoped>
.status-circle {
  flex: none;
  border-radius: 50%;
  background-color: v-bind(statusColor);
}
.status-circle.small {
  width: 22px;
  height: 22px;
}
.status-circle.medium {
  width: 46px;
  height: 46px;
}
</style>
