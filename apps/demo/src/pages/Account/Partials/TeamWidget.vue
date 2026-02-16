<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const team = computed(() => authStore.user?.team ?? null)
</script>

<template>
  <section v-if="team" class="p-4 sm:p-8 theme-card">
    <header>
      <h2 class="text-lg font-medium text-base-content">{{ team.name }}</h2>
      <p class="mt-1 text-sm text-base-content/60">This is the current team you are working in.</p>
    </header>
    <p class="mt-1 text-sm text-base-content/50">
      <RouterLink
        :to="{ name: 'team.select' }"
        class="font-medium text-primary hover:text-primary/80"
      >
        Change Team
      </RouterLink>
    </p>
  </section>
  <section v-else class="p-4 sm:p-8 theme-card">
    <header>
      <h2 class="text-lg font-medium text-base-content">No Team</h2>
      <p class="mt-1 text-sm text-base-content/60">You are not currently assigned to a team.</p>
    </header>
    <p class="mt-1 text-sm text-base-content/50">
      <RouterLink
        :to="{ name: 'team.select' }"
        class="font-medium text-primary hover:text-primary/80"
      >
        Select Team
      </RouterLink>
    </p>
  </section>
</template>

<style scoped></style>
