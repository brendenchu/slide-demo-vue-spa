<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import { storage } from '@/stores/persistence/storage'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import type { Team } from '@/types/models'

const router = useRouter()
const authStore = useAuthStore()
const flashStore = useFlashStore()

const teams = ref<Team[]>([])
const loading = ref(true)

const currentTeam = computed(() => {
  if (!authStore.user?.team_id) return null
  return teams.value.find((team) => team.id === authStore.user?.team_id)
})

const currentTeamName = computed(() => {
  return currentTeam.value?.name ?? 'None'
})

async function loadTeams() {
  loading.value = true
  try {
    // In demo mode, we only have one team seeded
    let team = await storage.get<Team>('team:1')

    if (!team) {
      // If team doesn't exist, create it now (fallback)
      team = {
        id: '1',
        name: 'Acme Corporation',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await storage.set('team:1', team)
    }

    teams.value = [team]
  } catch (error) {
    console.error('Failed to load teams:', error)
    flashStore.error('Failed to load teams')
  } finally {
    loading.value = false
  }
}

async function selectTeam(team: Team) {
  try {
    // Update user's team_id
    await authStore.updateProfile({ team_id: team.id })
    flashStore.success(`Switched to team: ${team.name}`)

    // Optionally redirect to dashboard
    setTimeout(() => {
      router.push({ name: 'dashboard' })
    }, 1000)
  } catch (error) {
    console.error('Failed to select team:', error)
    flashStore.error('Failed to select team')
  }
}

onMounted(() => {
  loadTeams()
})
</script>

<template>
  <AuthenticatedLayout>
    <div class="p-12 lg:px-0">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:grid lg:grid-cols-3 gap-4">
        <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg lg:col-span-3">
          <strong>Current Team:</strong> {{ currentTeamName }}
        </div>

        <div v-if="loading" class="p-4 sm:p-8 bg-white shadow sm:rounded-lg lg:col-span-3">
          <p class="text-gray-600">Loading teams...</p>
        </div>

        <div
          v-else-if="teams.length === 0"
          class="p-4 sm:p-8 bg-white shadow sm:rounded-lg lg:col-span-3"
        >
          <p class="text-gray-600">No teams available.</p>
        </div>

        <div
          v-for="team in teams"
          v-else
          :key="team.id"
          class="p-4 sm:p-8 bg-white shadow sm:rounded-lg"
        >
          <section class="relative min-h-[160px]">
            <header>
              <h2 class="text-lg font-medium text-gray-900">{{ team.name }}</h2>
              <p class="mt-1 text-sm text-gray-500">Status: {{ team.status }}</p>
            </header>
            <div class="flex space-x-2 absolute bottom-0">
              <PrimaryButton
                :disabled="team.id === currentTeam?.id"
                :class="{
                  'bg-slate-500 hover:bg-slate-500 focus:bg-slate-500 active:bg-slate-500':
                    team.id === currentTeam?.id,
                }"
                @click="selectTeam(team)"
              >
                {{ team.id === currentTeam?.id ? 'Selected' : 'Select' }}
              </PrimaryButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
