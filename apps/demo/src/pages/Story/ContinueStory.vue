<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { findLastPosition } from '@bchu/vue-story-form'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()

onMounted(async () => {
  const projectId = route.params.id as string
  const token = route.query.token as string

  // Load the project
  const project = await projectsStore.fetchById(projectId)

  if (!project) {
    // Project not found, redirect to dashboard
    router.push({ name: 'dashboard' })
    return
  }

  // Find the last position with saved data
  const lastPosition = findLastPosition(project)

  // Redirect to the form at the last position
  router.push({
    name: 'story.form',
    params: { id: projectId },
    query: {
      step: lastPosition.step,
      page: lastPosition.page.toString(),
      token: token || '',
    },
  })
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4 text-lg">Loading your form...</p>
    </div>
  </div>
</template>
