<script setup lang="ts">
import type { ProjectStep } from '@bchu/vue-story-form'
import { getStepOrder } from '@bchu/vue-story-form'
import { computed } from 'vue'

const props = defineProps<{
  step?: ProjectStep
  page?: number
}>()

const stepOrder = getStepOrder()

const progress = computed(() => {
  if (!props.step) return 0
  if (props.step.id === 'complete') return 100
  const index = stepOrder.indexOf(props.step.id)
  if (index === -1) return 0
  return Math.round((index / stepOrder.length) * 100)
})
</script>

<template>
  <progress :value="progress" max="100" class="w-full h-2 progress-secondary" />
</template>
