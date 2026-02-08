<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const team = computed(() => authStore.user?.team ?? null)
</script>

<template>
  <section v-if="team" class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
    <header>
      <h2 class="text-lg font-medium text-gray-900">{{ team.name }}</h2>
      <p class="mt-1 text-sm text-gray-600">This is the current team you are working in.</p>
    </header>
    <p class="mt-1 text-sm text-gray-500">
      <RouterLink
        :to="{ name: 'team.select' }"
        class="font-medium text-indigo-600 hover:text-indigo-500"
      >
        Change Team
      </RouterLink>
    </p>
  </section>
  <section v-else class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
    <header>
      <h2 class="text-lg font-medium text-gray-900">No Team</h2>
      <p class="mt-1 text-sm text-gray-600">You are not currently assigned to a team.</p>
    </header>
    <p class="mt-1 text-sm text-gray-500">
      <RouterLink
        :to="{ name: 'team.select' }"
        class="font-medium text-indigo-600 hover:text-indigo-500"
      >
        Select Team
      </RouterLink>
    </p>
  </section>
</template>

<style scoped></style>
