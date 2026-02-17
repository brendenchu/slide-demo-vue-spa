<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: RouteLocationRaw
  active?: boolean
}>()

const classes = computed(() =>
  props.active
    ? 'block w-full pl-3 pr-4 py-2 border-l-4 border-primary text-left text-base font-medium text-primary bg-primary/10 focus:outline-none focus:text-primary focus:bg-primary/15 focus:border-primary transition duration-150 ease-in-out'
    : 'block w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-left text-base font-medium text-base-content/60 hover:text-base-content hover:bg-base-300 hover:border-base-300 focus:outline-none focus:text-base-content focus:bg-base-300 focus:border-base-300 transition duration-150 ease-in-out'
)
</script>

<template>
  <RouterLink :to="to" :class="classes">
    <slot />
  </RouterLink>
</template>
