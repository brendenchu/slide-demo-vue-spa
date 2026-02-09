<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTeamsStore } from '@/stores/teams'
import { useToastStore } from '@/stores/toast'
import { useDemoStore } from '@/stores/demo'
import { getApiClient } from '@/lib/axios'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import SecondaryButton from '@/components/Common/UI/Buttons/SecondaryButton.vue'
import DangerButton from '@/components/Common/UI/Buttons/DangerButton.vue'
import TeamMembersList from './Partials/TeamMembersList.vue'
import InviteMemberForm from './Partials/InviteMemberForm.vue'
import PendingInvitationsList from './Partials/PendingInvitationsList.vue'
import type { Team } from '@/types/models'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const teamsStore = useTeamsStore()
const toastStore = useToastStore()
const demoStore = useDemoStore()
const api = getApiClient()

const team = ref<Team | null>(null)
const loading = ref(true)

const teamId = computed(() => route.params.id as string)
const isAdmin = computed(() => team.value?.is_admin ?? false)
const isOwner = computed(() => team.value?.is_owner ?? false)
const isCurrentTeam = computed(() => authStore.user?.team?.id === teamId.value)
const deleting = ref(false)

async function loadTeam() {
  loading.value = true
  try {
    const response = await api.get<{ data: Team }>(`/teams/${teamId.value}`)
    team.value = response.data.data

    await teamsStore.fetchMembers(teamId.value)

    if (isAdmin.value) {
      await teamsStore.fetchInvitations(teamId.value)
    }
  } catch {
    toastStore.error('Failed to load team')
    router.push({ name: 'team.select' })
  } finally {
    loading.value = false
  }
}

async function deleteTeam() {
  if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
    return
  }
  deleting.value = true
  try {
    await api.delete(`/teams/${teamId.value}`)
    toastStore.success('Team deleted successfully')
    router.push({ name: 'team.select' })
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    toastStore.error(axiosError.response?.data?.message ?? 'Failed to delete team')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadTeam()
})
</script>

<template>
  <AuthenticatedLayout>
    <div class="p-12 lg:px-0">
      <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
        <!-- Team Info -->
        <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <div v-if="loading" class="text-gray-600">Loading team...</div>
          <div v-else-if="team">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ team.name }}</h2>
                <p v-if="team.description" class="mt-1 text-sm text-gray-500">
                  {{ team.description }}
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  Status: {{ team.status }}
                  <span
                    v-if="isOwner"
                    class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                  >
                    Owner
                  </span>
                  <span
                    v-else-if="isAdmin"
                    class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    Admin
                  </span>
                </p>
              </div>
              <div class="flex gap-2">
                <SecondaryButton @click="router.push({ name: 'team.select' })">
                  Back to Teams
                </SecondaryButton>
                <DangerButton
                  v-if="isOwner && !isCurrentTeam && !team?.is_personal"
                  :disabled="deleting"
                  @click="deleteTeam"
                >
                  Delete Team
                </DangerButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Undeletable Team Warning -->
        <div
          v-if="!loading && isOwner && team?.is_personal"
          class="p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <p class="text-sm text-amber-800">This is your default team and cannot be deleted.</p>
        </div>
        <div
          v-else-if="!loading && isOwner && isCurrentTeam"
          class="p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <p class="text-sm text-amber-800">
            This is your current active team. You must switch to another team before you can delete
            it.
          </p>
        </div>

        <!-- Members List -->
        <div v-if="!loading" class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <TeamMembersList
            :team-id="teamId"
            :is-admin="isAdmin"
            :is-owner="isOwner"
            @ownership-transferred="loadTeam"
          />
        </div>

        <!-- Invite Form (admin only) -->
        <div v-if="!loading && isAdmin" class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <InviteMemberForm
            :team-id="teamId"
            :is-owner="isOwner"
            :demo-mode="demoStore.isDemoMode"
            :invitation-limit="demoStore.maxInvitationsPerTeam"
          />
        </div>

        <!-- Pending Invitations (admin only) -->
        <div v-if="!loading && isAdmin" class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <PendingInvitationsList :team-id="teamId" />
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
