<script setup lang="ts">
import { ref } from 'vue'
import { useTeamsStore } from '@/stores/teams'
import { useToastStore } from '@/stores/toast'
import DangerButton from '@/components/Common/UI/Buttons/DangerButton.vue'
import SecondaryButton from '@/components/Common/UI/Buttons/SecondaryButton.vue'
import type { TeamMember } from '@/types/models'

const props = defineProps<{
  teamId: string
  isAdmin: boolean
  isOwner: boolean
}>()

const emit = defineEmits<{
  (e: 'ownershipTransferred'): void
}>()

const teamsStore = useTeamsStore()
const toastStore = useToastStore()
const processing = ref<string | null>(null)

async function removeMember(member: TeamMember) {
  if (!window.confirm(`Remove ${member.name} from the team?`)) return
  processing.value = member.id
  try {
    await teamsStore.removeMember(props.teamId, member.id)
    toastStore.success(`${member.name} has been removed from the team`)
  } catch {
    toastStore.error('Failed to remove member')
  } finally {
    processing.value = null
  }
}

async function toggleRole(member: TeamMember) {
  const newRole = member.is_admin ? 'member' : 'admin'
  processing.value = member.id
  try {
    await teamsStore.updateMemberRole(props.teamId, member.id, newRole)
    toastStore.success(`${member.name} is now a ${newRole}`)
  } catch {
    toastStore.error('Failed to update role')
  } finally {
    processing.value = null
  }
}

async function transferOwnership(member: TeamMember) {
  if (!window.confirm(`Transfer ownership to ${member.name}? You will remain as an admin.`)) return
  processing.value = member.id
  try {
    await teamsStore.transferOwnership(props.teamId, member.id)
    toastStore.success(`Ownership transferred to ${member.name}`)
    emit('ownershipTransferred')
  } catch {
    toastStore.error('Failed to transfer ownership')
  } finally {
    processing.value = null
  }
}

const roleStyles: Record<string, string> = {
  owner: 'bg-warning/20 text-warning',
  admin: 'bg-primary/20 text-primary',
  member: 'bg-base-300 text-base-content',
}
</script>

<template>
  <section>
    <header>
      <h2 class="text-lg font-medium text-base-content">Team Members</h2>
    </header>

    <div class="mt-4">
      <table class="min-w-full divide-y divide-base-300">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-base-content/50 uppercase">Name</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-base-content/50 uppercase">Email</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-base-content/50 uppercase">Role</th>
            <th
              v-if="isAdmin"
              class="px-4 py-2 text-right text-xs font-medium text-base-content/50 uppercase"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-base-300">
          <tr v-for="member in teamsStore.members" :key="member.id">
            <td class="px-4 py-3 text-sm text-base-content">{{ member.name }}</td>
            <td class="px-4 py-3 text-sm text-base-content/50">{{ member.email }}</td>
            <td class="px-4 py-3 text-sm">
              <span
                :class="roleStyles[member.role] ?? 'bg-base-300 text-base-content'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
              >
                {{ member.role }}
              </span>
            </td>
            <td v-if="isAdmin" class="px-4 py-3 text-sm text-right space-x-2">
              <template v-if="member.role === 'owner'">
                <span class="text-base-content/40 text-xs">Owner</span>
              </template>
              <template v-else>
                <SecondaryButton
                  v-if="isOwner"
                  :disabled="processing === member.id"
                  @click="transferOwnership(member)"
                >
                  Transfer Ownership
                </SecondaryButton>
                <SecondaryButton :disabled="processing === member.id" @click="toggleRole(member)">
                  {{ member.is_admin ? 'Demote' : 'Promote' }}
                </SecondaryButton>
                <DangerButton :disabled="processing === member.id" @click="removeMember(member)">
                  Remove
                </DangerButton>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="teamsStore.members.length === 0" class="mt-4 text-sm text-base-content/50">
        No members found.
      </p>
    </div>
  </section>
</template>
