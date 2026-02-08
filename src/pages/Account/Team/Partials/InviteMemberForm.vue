<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '@/composables/useForm'
import { useTeamsStore } from '@/stores/teams'
import { useFlashStore } from '@/stores/flash'
import { useDemoLimits } from '@/composables/useDemoLimits'
import InputError from '@/components/Form/FormError.vue'
import InputLabel from '@/components/Form/FormLabel.vue'
import UserSearchInput from '@/components/Form/UserSearchInput.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import LimitBadge from '@/components/Demo/LimitBadge.vue'

const props = withDefaults(
  defineProps<{
    teamId: string
    demoMode?: boolean
    invitationLimit?: number
  }>(),
  {
    demoMode: false,
    invitationLimit: 0,
  }
)

const teamsStore = useTeamsStore()
const flashStore = useFlashStore()
const { isInvitationLimitReached } = useDemoLimits()

const invitationLimitReached = computed(() =>
  isInvitationLimitReached(teamsStore.invitations.length)
)

const form = useForm({
  email: '',
  role: 'member',
})

const sendInvite = async () => {
  form.clearErrors()
  try {
    await teamsStore.inviteMember(props.teamId, form.data.email, form.data.role)
    flashStore.success(`Invitation sent to ${form.data.email}`)
    form.reset()
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> } }
    }
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors
      for (const [key, messages] of Object.entries(errors)) {
        form.setError(key, Array.isArray(messages) ? (messages[0] ?? '') : String(messages))
      }
    } else if (axiosError.response?.data?.message) {
      flashStore.error(axiosError.response.data.message)
    } else {
      flashStore.error('Failed to send invitation')
    }
  }
}
</script>

<template>
  <section>
    <header>
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-medium text-gray-900">Invite a Member</h2>
        <LimitBadge
          v-if="demoMode"
          :current="teamsStore.invitations.length"
          :max="invitationLimit"
        />
      </div>
      <p class="mt-1 text-sm text-gray-600">Send an invitation to join this team.</p>
    </header>

    <form class="mt-4 space-y-4" @submit.prevent="sendInvite">
      <div class="flex gap-4 items-end">
        <div class="flex-1">
          <InputLabel for="invite_email" value="Find User" />
          <UserSearchInput
            v-model="form.data.email"
            :team-id="teamId"
            :disabled="invitationLimitReached || form.processing"
          />
          <InputError class="mt-1" :message="form.errors.email" />
        </div>

        <div class="w-36">
          <InputLabel for="invite_role" value="Role" />
          <select
            id="invite_role"
            v-model="form.data.role"
            class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <InputError class="mt-1" :message="form.errors.role" />
        </div>

        <div>
          <PrimaryButton :disabled="form.processing || invitationLimitReached"
            >Send Invite</PrimaryButton
          >
        </div>
      </div>
    </form>
  </section>
</template>
