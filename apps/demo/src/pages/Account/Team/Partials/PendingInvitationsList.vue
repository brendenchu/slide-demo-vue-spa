<script setup lang="ts">
import { ref } from 'vue'
import { useTeamsStore } from '@/stores/teams'
import { useToastStore } from '@/stores/toast'
import DangerButton from '@/components/Common/UI/Buttons/DangerButton.vue'

const props = defineProps<{
  teamId: string
}>()

const teamsStore = useTeamsStore()
const toastStore = useToastStore()
const cancelling = ref<string | null>(null)

async function cancelInvitation(invitationId: string) {
  cancelling.value = invitationId
  try {
    await teamsStore.cancelInvitation(props.teamId, invitationId)
    toastStore.success('Invitation cancelled')
  } catch {
    toastStore.error('Failed to cancel invitation')
  } finally {
    cancelling.value = null
  }
}
</script>

<template>
  <section>
    <header>
      <h2 class="text-lg font-medium text-base-content">Pending Invitations</h2>
    </header>

    <div v-if="teamsStore.invitations.length === 0" class="mt-4">
      <p class="text-sm text-base-content/50">No pending invitations.</p>
    </div>

    <div v-else class="mt-4 space-y-3">
      <div
        v-for="invitation in teamsStore.invitations"
        :key="invitation.id"
        class="flex items-center justify-between p-3 bg-base-300/50 rounded-lg"
      >
        <div>
          <p class="text-sm font-medium text-base-content">{{ invitation.email }}</p>
          <p class="text-xs text-base-content/50">
            Role: {{ invitation.role }} &middot; Expires:
            {{
              invitation.expires_at ? new Date(invitation.expires_at).toLocaleDateString() : 'Never'
            }}
          </p>
        </div>
        <DangerButton
          :disabled="cancelling === invitation.id"
          @click="cancelInvitation(invitation.id)"
        >
          Cancel
        </DangerButton>
      </div>
    </div>
  </section>
</template>
