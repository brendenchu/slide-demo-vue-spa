<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  to: RouteLocationRaw
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="block w-full px-4 py-2 text-left text-sm leading-5 text-base-content/70 hover:bg-base-300 focus:outline-none focus:bg-base-300 transition duration-150 ease-in-out"
  >
    <slot />
  </RouterLink>
</template>
