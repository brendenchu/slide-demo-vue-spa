import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getApiClient } from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'

export interface DemoLimits {
  max_users: number
  max_teams_per_user: number
  max_projects_per_team: number
  max_invitations_per_team: number
}

const DEMO_EMAILS = [
  'admin@demo.com',
  'admin@example.com',
  'consultant@example.com',
  'client@demo.com',
  'guest@demo.com',
]

export const useDemoStore = defineStore('demo', () => {
  const enabled = ref(false)
  const limits = ref<DemoLimits | null>(null)
  const loaded = ref(false)

  const isDemoMode = computed(() => enabled.value)

  const maxUsers = computed(() => limits.value?.max_users ?? 0)
  const maxTeamsPerUser = computed(() => limits.value?.max_teams_per_user ?? 0)
  const maxProjectsPerTeam = computed(() => limits.value?.max_projects_per_team ?? 0)
  const maxInvitationsPerTeam = computed(() => limits.value?.max_invitations_per_team ?? 0)

  const isDemoAccount = computed(() => {
    const authStore = useAuthStore()
    const email = authStore.user?.email
    if (!email) {
      return false
    }
    return DEMO_EMAILS.includes(email)
  })

  async function fetchStatus(): Promise<void> {
    try {
      const api = getApiClient()
      const response = await api.get<{ data: { demo_mode: boolean; limits: DemoLimits | null } }>(
        '/demo/status'
      )
      enabled.value = response.data.data.demo_mode
      limits.value = response.data.data.limits
    } catch {
      enabled.value = false
      limits.value = null
    } finally {
      loaded.value = true
    }
  }

  return {
    enabled,
    limits,
    loaded,
    isDemoMode,
    isDemoAccount,
    maxUsers,
    maxTeamsPerUser,
    maxProjectsPerTeam,
    maxInvitationsPerTeam,
    fetchStatus,
  }
})
