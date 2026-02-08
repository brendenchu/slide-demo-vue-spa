<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTeamsStore } from '@/stores/teams'
import { useFlashStore } from '@/stores/flash'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import DangerButton from '@/components/Common/UI/Buttons/DangerButton.vue'
import type { TeamInvitation } from '@/types/models'

const route = useRoute()
const teamsStore = useTeamsStore()
const flashStore = useFlashStore()

const loading = ref(true)
const processing = ref<string | null>(null)

async function loadInvitations() {
  loading.value = true
  try {
    await teamsStore.fetchPendingInvitations()
  } catch {
    flashStore.error('Failed to load invitations')
  } finally {
    loading.value = false
  }
}

async function accept(invitation: TeamInvitation) {
  processing.value = invitation.id
  try {
    // Get token from URL query or use the invitation id
    const token = (route.query.token as string) || ''
    await teamsStore.acceptInvitation(invitation.id, token)
    flashStore.success(`You have joined ${invitation.team?.name ?? 'the team'}`)
  } catch {
    flashStore.error('Failed to accept invitation. The token may be missing or invalid.')
  } finally {
    processing.value = null
  }
}

async function decline(invitation: TeamInvitation) {
  processing.value = invitation.id
  try {
    await teamsStore.declineInvitation(invitation.id)
    flashStore.success('Invitation declined')
  } catch {
    flashStore.error('Failed to decline invitation')
  } finally {
    processing.value = null
  }
}

onMounted(() => {
  loadInvitations()
})
</script>

<template>
  <AuthenticatedLayout>
    <div class="p-12 lg:px-0">
      <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <section>
            <header>
              <h2 class="text-lg font-medium text-gray-900">Your Invitations</h2>
              <p class="mt-1 text-sm text-gray-600">Pending team invitations sent to you.</p>
            </header>

            <div v-if="loading" class="mt-6 text-gray-600">Loading invitations...</div>

            <div v-else-if="teamsStore.pendingInvitations.length === 0" class="mt-6">
              <p class="text-sm text-gray-500">No pending invitations.</p>
            </div>

            <div v-else class="mt-6 space-y-4">
              <div
                v-for="invitation in teamsStore.pendingInvitations"
                :key="invitation.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ invitation.team?.name ?? 'Unknown Team' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Invited by {{ invitation.invited_by?.name ?? 'Unknown' }} &middot; Role:
                    {{ invitation.role }}
                  </p>
                  <p v-if="invitation.expires_at" class="text-xs text-gray-400">
                    Expires: {{ new Date(invitation.expires_at).toLocaleDateString() }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <PrimaryButton
                    :disabled="processing === invitation.id"
                    @click="accept(invitation)"
                  >
                    Accept
                  </PrimaryButton>
                  <DangerButton
                    :disabled="processing === invitation.id"
                    @click="decline(invitation)"
                  >
                    Decline
                  </DangerButton>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
