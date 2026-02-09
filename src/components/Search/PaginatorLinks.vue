<script setup lang="ts">
import { defineProps } from 'vue'
import { PaginatorLinks } from '@/types'
import { RouterLink } from 'vue-router'

defineProps<{
  links: PaginatorLinks
}>()
</script>

<template>
  <div v-if="links.length">
    <div class="flex flex-wrap -mb-1">
      <template v-for="(link, key) in links">
        <div
          v-if="link.url === null"
          :key="`pagination-no-link-${key}`"
          class="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-base-content/40 border border-base-300 rounded"
        >
          {{ link.label }}
        </div>
        <RouterLink
          v-else
          :key="`pagination-link-${key}`"
          class="mr-1 mb-1 px-4 py-3 text-sm leading-4 border border-base-300 rounded hover:bg-base-300 focus:border-primary focus:text-primary"
          :class="{ 'bg-base-300': link.active }"
          :to="link.url"
        >
          {{ link.label }}
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>
