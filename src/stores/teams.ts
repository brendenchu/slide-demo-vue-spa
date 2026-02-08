import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getApiClient } from '@/lib/axios'
import type { Team, TeamMember, TeamInvitation, UserSearchResult } from '@/types/models'

export const useTeamsStore = defineStore('teams', () => {
  const api = getApiClient()

  const teams = ref<Team[]>([])
  const members = ref<TeamMember[]>([])
  const invitations = ref<TeamInvitation[]>([])
  const pendingInvitations = ref<TeamInvitation[]>([])
  const loading = ref(false)

  async function fetchTeams(): Promise<void> {
    loading.value = true
    try {
      const response = await api.get<{ data: Team[] }>('/teams')
      teams.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchMembers(teamId: string): Promise<void> {
    const response = await api.get<{ data: TeamMember[] }>(`/teams/${teamId}/members`)
    members.value = response.data.data
  }

  async function fetchInvitations(teamId: string): Promise<void> {
    const response = await api.get<{ data: TeamInvitation[] }>(`/teams/${teamId}/invitations`)
    invitations.value = response.data.data
  }

  async function fetchPendingInvitations(): Promise<void> {
    const response = await api.get<{ data: TeamInvitation[] }>('/invitations')
    pendingInvitations.value = response.data.data
  }

  async function inviteMember(teamId: string, email: string, role: string): Promise<void> {
    const response = await api.post<{ data: TeamInvitation }>(`/teams/${teamId}/invitations`, {
      email,
      role,
    })
    invitations.value.unshift(response.data.data)
  }

  async function removeMember(teamId: string, userId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${userId}`)
    members.value = members.value.filter((m) => m.id !== userId)
  }

  async function updateMemberRole(teamId: string, userId: string, role: string): Promise<void> {
    await api.put(`/teams/${teamId}/members/${userId}/role`, { role })
    const member = members.value.find((m) => m.id === userId)
    if (member) {
      member.is_admin = role === 'admin'
    }
  }

  async function acceptInvitation(invitationId: string, token: string): Promise<void> {
    await api.post(`/invitations/${invitationId}/accept`, { token })
    pendingInvitations.value = pendingInvitations.value.filter((i) => i.id !== invitationId)
  }

  async function declineInvitation(invitationId: string): Promise<void> {
    await api.post(`/invitations/${invitationId}/decline`)
    pendingInvitations.value = pendingInvitations.value.filter((i) => i.id !== invitationId)
  }

  async function transferOwnership(teamId: string, userId: string): Promise<void> {
    await api.post(`/teams/${teamId}/transfer-ownership`, { user_id: userId })
  }

  async function searchUsers(query: string, teamId: string): Promise<UserSearchResult[]> {
    const response = await api.get<{ data: UserSearchResult[] }>('/users/search', {
      params: { q: query, team_id: teamId },
    })
    return response.data.data
  }

  async function cancelInvitation(teamId: string, invitationId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/invitations/${invitationId}`)
    invitations.value = invitations.value.filter((i) => i.id !== invitationId)
  }

  return {
    teams,
    members,
    invitations,
    pendingInvitations,
    loading,
    fetchTeams,
    fetchMembers,
    fetchInvitations,
    fetchPendingInvitations,
    inviteMember,
    removeMember,
    updateMemberRole,
    transferOwnership,
    acceptInvitation,
    declineInvitation,
    searchUsers,
    cancelInvitation,
  }
})
