<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTeamsStore } from '@/stores/teams'
import { useFlashStore } from '@/stores/flash'
import { getApiClient } from '@/lib/axios'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import SecondaryButton from '@/components/Common/UI/Buttons/SecondaryButton.vue'
import TeamMembersList from './Partials/TeamMembersList.vue'
import InviteMemberForm from './Partials/InviteMemberForm.vue'
import PendingInvitationsList from './Partials/PendingInvitationsList.vue'
import type { Team } from '@/types/models'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const teamsStore = useTeamsStore()
const flashStore = useFlashStore()
const api = getApiClient()

const team = ref<Team | null>(null)
const loading = ref(true)

const teamId = computed(() => route.params.id as string)
const isAdmin = computed(() => team.value?.is_admin ?? false)
const currentUserId = computed(() => authStore.user?.id ?? '')

async function loadTeam() {
  loading.value = true
  try {
    const response = await api.get<{ data: Team }>(`/teams/${teamId.value}`)
    team.value = response.data.data

    // Check admin via members list
    await teamsStore.fetchMembers(teamId.value)

    // Determine if current user is admin from members data
    const currentMember = teamsStore.members.find((m) => m.id === currentUserId.value)
    if (currentMember && team.value) {
      team.value.is_admin = currentMember.is_admin
    }

    if (isAdmin.value) {
      await teamsStore.fetchInvitations(teamId.value)
    }
  } catch {
    flashStore.error('Failed to load team')
    router.push({ name: 'team.select' })
  } finally {
    loading.value = false
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
                <p v-if="team.description" class="mt-1 text-sm text-gray-500">{{ team.description }}</p>
                <p class="mt-1 text-xs text-gray-400">
                  Status: {{ team.status }}
                  <span v-if="isAdmin" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Admin
                  </span>
                </p>
              </div>
              <SecondaryButton @click="router.push({ name: 'team.select' })">
                Back to Teams
              </SecondaryButton>
            </div>
          </div>
        </div>

        <!-- Members List -->
        <div v-if="!loading" class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <TeamMembersList
            :team-id="teamId"
            :is-admin="isAdmin"
            :current-user-id="currentUserId"
          />
        </div>

        <!-- Invite Form (admin only) -->
        <div v-if="!loading && isAdmin" class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <InviteMemberForm :team-id="teamId" />
        </div>

        <!-- Pending Invitations (admin only) -->
        <div v-if="!loading && isAdmin" class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <PendingInvitationsList :team-id="teamId" />
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
