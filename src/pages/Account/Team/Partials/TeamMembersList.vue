<script setup lang="ts">
import { ref } from 'vue'
import { useTeamsStore } from '@/stores/teams'
import { useFlashStore } from '@/stores/flash'
import DangerButton from '@/components/Common/UI/Buttons/DangerButton.vue'
import SecondaryButton from '@/components/Common/UI/Buttons/SecondaryButton.vue'
import type { TeamMember } from '@/types/models'

const props = defineProps<{
  teamId: string
  isAdmin: boolean
  isOwner: boolean
  ownerUserId: string | null
  currentUserId: string
}>()

const emit = defineEmits<{
  (e: 'ownershipTransferred'): void
}>()

const teamsStore = useTeamsStore()
const flashStore = useFlashStore()
const processing = ref<string | null>(null)

function isMemberOwner(member: TeamMember): boolean {
  return props.ownerUserId !== null && member.id === props.ownerUserId
}

async function removeMember(member: TeamMember) {
  if (!window.confirm(`Remove ${member.name} from the team?`)) return
  processing.value = member.id
  try {
    await teamsStore.removeMember(props.teamId, member.id)
    flashStore.success(`${member.name} has been removed from the team`)
  } catch {
    flashStore.error('Failed to remove member')
  } finally {
    processing.value = null
  }
}

async function toggleRole(member: TeamMember) {
  const newRole = member.is_admin ? 'member' : 'admin'
  processing.value = member.id
  try {
    await teamsStore.updateMemberRole(props.teamId, member.id, newRole)
    flashStore.success(`${member.name} is now a ${newRole}`)
  } catch {
    flashStore.error('Failed to update role')
  } finally {
    processing.value = null
  }
}

async function transferOwnership(member: TeamMember) {
  if (!window.confirm(`Transfer ownership to ${member.name}? You will remain as an admin.`)) return
  processing.value = member.id
  try {
    await teamsStore.transferOwnership(props.teamId, member.id)
    flashStore.success(`Ownership transferred to ${member.name}`)
    emit('ownershipTransferred')
  } catch {
    flashStore.error('Failed to transfer ownership')
  } finally {
    processing.value = null
  }
}
</script>

<template>
  <section>
    <header>
      <h2 class="text-lg font-medium text-gray-900">Team Members</h2>
    </header>

    <div class="mt-4">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th
              v-if="isAdmin"
              class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="member in teamsStore.members" :key="member.id">
            <td class="px-4 py-3 text-sm text-gray-900">{{ member.name }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ member.email }}</td>
            <td class="px-4 py-3 text-sm">
              <span
                v-if="isMemberOwner(member)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
              >
                Owner
              </span>
              <span
                v-else
                :class="
                  member.is_admin ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                "
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ member.is_admin ? 'Admin' : 'Member' }}
              </span>
            </td>
            <td v-if="isAdmin" class="px-4 py-3 text-sm text-right space-x-2">
              <template v-if="isMemberOwner(member)">
                <span class="text-gray-400 text-xs">Owner</span>
              </template>
              <template v-else-if="member.id !== currentUserId">
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
              <span v-else class="text-gray-400 text-xs">You</span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="teamsStore.members.length === 0" class="mt-4 text-sm text-gray-500">
        No members found.
      </p>
    </div>
  </section>
</template>
