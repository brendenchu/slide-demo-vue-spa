<template>
  <ParticlesBackground />
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ParticlesBackground from '@/components/Common/UI/ParticlesBackground.vue'
import { useProjectsStore } from '@/stores/projects'
import { seedDemoData, checkIfSeeded } from '@/stores/persistence/seed'

const authStore = useAuthStore()
const projectsStore = useProjectsStore()

onMounted(async () => {
  // Seed demo data on first load (for local data source mode)
  const isSeeded = await checkIfSeeded()
  if (!isSeeded) {
    await seedDemoData()
  }

  // Load user from storage for immediate auth state
  await authStore.loadUser()

  // Refresh user from API to ensure fresh data
  if (authStore.isAuthenticated) {
    await authStore.refreshUser()
    await projectsStore.fetchAll()
  }
})
</script>
