<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useForm } from '@/composables/useForm'
import { useTeamsStore } from '@/stores/teams'
import { useFlashStore } from '@/stores/flash'
import { useDemoLimits } from '@/composables/useDemoLimits'
import InputError from '@/components/Form/FormError.vue'
import InputLabel from '@/components/Form/FormLabel.vue'
import FormCombobox from '@/components/Form/FormCombobox.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import LimitBadge from '@/components/Demo/LimitBadge.vue'

const props = withDefaults(
  defineProps<{
    teamId: string
    isOwner?: boolean
    demoMode?: boolean
    invitationLimit?: number
  }>(),
  {
    isOwner: false,
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

// Async user search state
const userSearchResults = ref<{ value: string; label: string; description: string }[]>([])
const userSearchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

function onUserSearch(q: string): void {
  if (searchTimer) clearTimeout(searchTimer)

  if (q.length < 2) {
    userSearchResults.value = []
    userSearchLoading.value = false
    return
  }

  userSearchLoading.value = true
  searchTimer = setTimeout(async () => {
    try {
      const users = await teamsStore.searchUsers(q, props.teamId)
      userSearchResults.value = users.map((u) => ({
        value: u.email,
        label: u.name,
        description: u.email,
      }))
    } finally {
      userSearchLoading.value = false
    }
  }, 300)
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

const sendInvite = async () => {
  form.clearErrors()
  try {
    await teamsStore.inviteMember(props.teamId, form.data.email, form.data.role)
    flashStore.success(`Invitation sent to ${form.data.email}`)
    form.reset()
    userSearchResults.value = []
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
          <FormCombobox
            id="invite_email"
            v-model="form.data.email"
            :options="userSearchResults"
            :loading="userSearchLoading"
            :filter-locally="false"
            :disabled="invitationLimitReached || form.processing"
            placeholder="Search by name or email..."
            no-results-text="No registered users found"
            @search="onUserSearch"
          />
          <InputError class="mt-1" :message="form.errors.email" />
        </div>

        <div class="w-36">
          <InputLabel for="invite_role" value="Role" />
          <select
            id="invite_role"
            v-model="form.data.role"
            class="select select-bordered select-lg w-full"
          >
            <option value="member">Member</option>
            <option v-if="isOwner" value="admin">Admin</option>
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
