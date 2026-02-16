<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useProjectsStore } from '@/stores/projects'
import { useDemoStore } from '@/stores/demo'
import { useDemoLimits } from '@/composables/useDemoLimits'
import { calculateProgress } from '@/utils/story/progress'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import LimitBadge from '@/components/Demo/LimitBadge.vue'
import IntroWidget from './Partials/IntroWidget.vue'
import TeamWidget from './Partials/TeamWidget.vue'

const router = useRouter()
const projectsStore = useProjectsStore()
const demoStore = useDemoStore()
const { isProjectLimitReached } = useDemoLimits()
const loading = ref(true)

const userProjects = computed(() => projectsStore.userProjects)
const projectLimitReached = computed(() => isProjectLimitReached(userProjects.value.length))

async function loadProjects() {
  loading.value = true
  await projectsStore.fetchAll()
  loading.value = false
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    draft: 'badge-ghost',
    in_progress: 'badge-info',
    completed: 'badge-success',
  }
  return classes[status as keyof typeof classes] || 'badge-ghost'
}

const getStatusLabel = (status: string) => {
  const labels = {
    draft: 'Draft',
    in_progress: 'In Progress',
    completed: 'Completed',
  }
  return labels[status as keyof typeof labels] || status
}

function startNewForm() {
  router.push({ name: 'story.new' })
}

function continueForm(projectId: string) {
  router.push({
    name: 'story.continue',
    params: { id: projectId },
  })
}

function viewForm(projectId: string) {
  router.push({
    name: 'story.complete',
    params: { id: projectId },
  })
}

onMounted(async () => {
  await loadProjects()
})
</script>

<template>
  <AuthenticatedLayout>
    <div class="py-6 md:py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
        <!-- Welcome Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IntroWidget />
          <TeamWidget />
        </div>

        <!-- Projects Section -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <h2 class="card-title text-2xl">My Forms</h2>
              <div class="flex items-center gap-2">
                <PrimaryButton :disabled="projectLimitReached" @click="startNewForm">
                  Start New Form
                </PrimaryButton>
                <LimitBadge
                  v-if="demoStore.isDemoMode"
                  :current="userProjects.length"
                  :max="demoStore.maxProjectsPerTeam"
                />
              </div>
            </div>

            <div v-if="loading" class="text-center py-12">
              <div class="loading loading-spinner loading-lg"></div>
              <p class="mt-4">Loading your forms...</p>
            </div>

            <div v-else-if="userProjects.length === 0" class="text-center py-16">
              <div class="max-w-md mx-auto">
                <svg
                  class="mx-auto h-24 w-24 text-base-content/20 mb-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 class="text-2xl font-semibold mb-2">No forms yet</h3>
                <p class="text-base-content/60 mb-6">
                  You haven't started any forms yet. Create your first form to get started!
                </p>
                <PrimaryButton class="btn-lg" @click="startNewForm"> Start New Form </PrimaryButton>
              </div>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Form ID</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="project in userProjects" :key="project.id">
                    <td>
                      <div class="font-mono font-semibold">{{ project.id }}</div>
                    </td>
                    <td>
                      <span class="badge" :class="getStatusBadgeClass(project.status)">
                        {{ getStatusLabel(project.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <progress
                          class="progress progress-primary w-32"
                          :value="calculateProgress(project)"
                          max="100"
                        ></progress>
                        <span class="text-sm">{{ calculateProgress(project) }}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="text-sm">{{ formatDate(project.updated_at) }}</span>
                    </td>
                    <td>
                      <div class="flex gap-2">
                        <button
                          v-if="project.status !== 'completed'"
                          class="btn btn-sm btn-primary"
                          @click="continueForm(project.id)"
                        >
                          Continue
                        </button>
                        <button v-else class="btn btn-sm btn-ghost" @click="viewForm(project.id)">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
