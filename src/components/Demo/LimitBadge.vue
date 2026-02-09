<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  current: number
  max: number
}>()

const percentage = computed(() => (props.max > 0 ? (props.current / props.max) * 100 : 0))

const colorClass = computed(() => {
  if (percentage.value >= 100) {
    return 'bg-red-100 text-red-800'
  }
  if (percentage.value >= 80) {
    return 'bg-amber-100 text-amber-800'
  }
  return 'bg-green-100 text-green-800'
})
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :class="colorClass"
  >
    {{ current }} / {{ max }}
  </span>
</template>
