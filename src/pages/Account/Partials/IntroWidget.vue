<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
</script>

<template>
  <section class="p-4 sm:p-8 cyber-card">
    <header>
      <h2 class="text-lg font-medium text-base-content">
        Welcome to your dashboard, {{ user?.name }}.
      </h2>

      <p class="mt-1 text-sm text-base-content/60">
        This provides a quick overview of your account and the projects you have created.
      </p>
    </header>
  </section>
</template>

<style scoped></style>
