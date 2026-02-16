<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
</script>

<template>
  <section class="p-4 sm:p-8 theme-card">
    <header>
      <h2 class="text-lg font-medium text-base-content">
        Welcome to the demo, {{ user?.name }}.
      </h2>

      <p class="mt-1 text-sm text-base-content/60">
        This dashboard demonstrates project listing with status tracking and progress bars. Use the
        navigation above to explore profile editing, team management, and theme switching. Start a
        new form to walk through the multi-step slide form system.
      </p>
    </header>
  </section>
</template>

<style scoped></style>
