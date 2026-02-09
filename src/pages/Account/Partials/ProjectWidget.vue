<script setup lang="ts">
import { Project } from '@/types'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  projects: Project[]
}>()
</script>

<template>
  <section class="p-4 sm:p-8 cyber-card">
    <header>
      <h2 class="text-lg font-medium text-base-content">Projects</h2>
      <p class="mt-1 text-sm text-base-content/60">A list of projects you have created.</p>
    </header>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
      <div v-for="project in props.projects" :key="project.id" class="text-base-content">
        <div
          class="border rounded border-base-300 p-2 text-base-content hover:bg-base-300 flex gap-3 justify-between"
        >
          <div>
            <p>
              <span class="text-sm text-base-content/60">ID: {{ project.id }}</span>
            </p>
            <p>
              <span class="text-sm text-base-content/60">Status: {{ project.status }}</span>
            </p>
            <p></p>
          </div>
          <div>
            <p>
              <RouterLink
                v-if="project.status === 'draft'"
                :to="route('story.continue', { id: project.id })"
                class="text-sm bg-success/80 hover:bg-success text-success-content px-2 py-1 rounded shadow"
              >
                Edit
              </RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
