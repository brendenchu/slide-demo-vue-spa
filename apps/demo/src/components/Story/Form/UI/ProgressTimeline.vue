<script setup lang="ts">
import type { Project } from '@/types/models'
import type { ProjectStep } from '@bchu/vue-story-form'
import { RouterLink } from 'vue-router'
import { computed } from 'vue'

const props = defineProps<{
  project?: Project
  step?: ProjectStep
  token?: string
  page?: number
}>()

const steps = {
  intro: 'Introduction',
  'section-a': 'Section A',
  'section-b': 'Section B',
  'section-c': 'Section C',
  complete: 'Complete',
}

const stepClasses = computed(() => {
  let atCurrentStep = false
  let temp: Record<string, string> = {}
  Object.keys(steps).forEach((key: string) => {
    if (!atCurrentStep) {
      temp[key] = 'step step-primary'
    } else {
      temp[key] = 'step'
    }
    if (key === props.step?.id) {
      atCurrentStep = true
    }
  })
  return temp
})
</script>

<template>
  <div>
    <ul class="steps">
      <li
        v-for="(s, index) in steps"
        :key="index"
        data-content=""
        :class="stepClasses[index]"
        class="hover:font-bold"
      >
        <RouterLink
          v-if="
            props.project &&
            props.token &&
            (index !== 'complete' || (index === 'complete' && props.project.status === 'completed'))
          "
          :to="
            route('story.form', {
              project: props.project?.id,
              step: index,
              token: props.token,
            })
          "
        >
          {{ s }}
        </RouterLink>
        <span v-else>{{ s }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="postcss">
.steps {
  @apply text-sm;
}
</style>
