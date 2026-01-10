<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { seedDemoData, checkIfSeeded } from '@/stores/persistence/seed'

const authStore = useAuthStore()
const projectsStore = useProjectsStore()

onMounted(async () => {
  // Seed demo data on first load
  const isSeeded = await checkIfSeeded()
  if (!isSeeded) {
    await seedDemoData()
  }

  // Load user from storage
  await authStore.loadUser()

  // Load projects if user is authenticated
  if (authStore.isAuthenticated) {
    await projectsStore.fetchAll()
  }
})
</script>
