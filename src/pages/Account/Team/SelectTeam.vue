<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useDemoStore } from '@/stores/demo'
import { useDemoLimits } from '@/composables/useDemoLimits'
import { getApiClient } from '@/lib/axios'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import SecondaryButton from '@/components/Common/UI/Buttons/SecondaryButton.vue'
import DangerButton from '@/components/Common/UI/Buttons/DangerButton.vue'
import LimitBadge from '@/components/Demo/LimitBadge.vue'
import type { Team } from '@/types/models'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const demoStore = useDemoStore()
const { isTeamLimitReached } = useDemoLimits()
const api = getApiClient()

const teams = ref<Team[]>([])
const loading = ref(true)
const selecting = ref(false)
const deleting = ref<string | null>(null)

const currentTeamId = computed(() => authStore.user?.team?.id ?? null)
const ownedNonPersonalTeamCount = computed(
  () => teams.value.filter((t) => t.is_owner && !t.is_personal).length
)
const teamLimitReached = computed(() => isTeamLimitReached(ownedNonPersonalTeamCount.value))

async function loadTeams() {
  loading.value = true
  try {
    const response = await api.get<{ data: Team[] }>('/teams')
    teams.value = response.data.data
  } catch (error) {
    console.error('Failed to load teams:', error)
    toastStore.error('Failed to load teams')
  } finally {
    loading.value = false
  }
}

async function selectTeam(team: Team) {
  selecting.value = true
  try {
    await api.post('/teams/current', { team: team.slug })
    await authStore.refreshUser()
    toastStore.success(`Switched to team: ${team.name}`)

    setTimeout(() => {
      router.push({ name: 'dashboard' })
    }, 1000)
  } catch (error) {
    console.error('Failed to select team:', error)
    toastStore.error('Failed to select team')
  } finally {
    selecting.value = false
  }
}

function canDelete(team: Team): boolean {
  return !team.is_personal && team.id !== currentTeamId.value
}

async function deleteTeam(team: Team) {
  if (
    !window.confirm(
      `Are you sure you want to delete "${team.name}"? All projects in this team will also be deleted.`
    )
  ) {
    return
  }
  deleting.value = team.id
  try {
    await api.delete(`/teams/${team.id}`)
    toastStore.success(`Team "${team.name}" deleted`)
    teams.value = teams.value.filter((t) => t.id !== team.id)
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    toastStore.error(axiosError.response?.data?.message ?? 'Failed to delete team')
  } finally {
    deleting.value = null
  }
}

onMounted(() => {
  loadTeams()
})
</script>

<template>
  <AuthenticatedLayout>
    <div class="p-12 lg:px-0">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="p-4 sm:p-8 cyber-card flex-1">
            <strong>Current Team:</strong> {{ authStore.user?.team?.name ?? 'None' }}
          </div>
          <div class="ml-4 flex items-center gap-2">
            <PrimaryButton
              :disabled="teamLimitReached"
              @click="router.push({ name: 'team.create' })"
            >
              Create Team
            </PrimaryButton>
            <LimitBadge
              v-if="demoStore.isDemoMode"
              :current="ownedNonPersonalTeamCount"
              :max="demoStore.maxTeamsPerUser"
            />
          </div>
        </div>

        <div v-if="loading" class="p-4 sm:p-8 cyber-card">
          <p class="text-base-content/60">Loading teams...</p>
        </div>

        <div v-else-if="teams.length === 0" class="p-4 sm:p-8 cyber-card">
          <p class="text-base-content/60">No teams available.</p>
        </div>

        <div v-else class="grid lg:grid-cols-3 gap-4">
          <div
            v-for="team in teams"
            :key="team.id"
            class="p-4 sm:p-8 cyber-card"
          >
            <section class="relative min-h-[160px]">
              <header>
                <h2 class="text-lg font-medium text-base-content">
                  {{ team.name }}
                  <span
                    v-if="team.is_personal && team.is_owner"
                    class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-base-300 text-base-content"
                  >
                    Default
                  </span>
                  <span
                    v-if="team.is_owner"
                    class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning"
                  >
                    Owner
                  </span>
                  <span
                    v-else-if="team.is_admin"
                    class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary"
                  >
                    Admin
                  </span>
                  <span
                    v-else
                    class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success"
                  >
                    Member
                  </span>
                </h2>
                <p class="mt-1 text-sm text-base-content/50">Status: {{ team.status }}</p>
              </header>
              <div class="flex space-x-2 absolute bottom-0">
                <PrimaryButton
                  :disabled="team.id === currentTeamId || selecting"
                  :class="{
                    'bg-slate-500 hover:bg-slate-500 focus:bg-slate-500 active:bg-slate-500':
                      team.id === currentTeamId,
                  }"
                  @click="selectTeam(team)"
                >
                  {{ team.id === currentTeamId ? 'Selected' : 'Select' }}
                </PrimaryButton>
                <SecondaryButton
                  @click="router.push({ name: 'team.show', params: { id: team.id } })"
                >
                  View
                </SecondaryButton>
                <DangerButton
                  v-if="canDelete(team)"
                  :disabled="deleting === team.id"
                  @click="deleteTeam(team)"
                >
                  Delete
                </DangerButton>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
