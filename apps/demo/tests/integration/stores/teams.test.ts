import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTeamsStore } from '@/stores/teams'

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/lib/axios', () => ({
  getApiClient: vi.fn(() => mockApi),
}))

describe('Teams Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchTeams', () => {
    it('populates teams from API', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            { id: '1', name: 'Team Alpha', status: 'active' },
            { id: '2', name: 'Team Beta', status: 'active' },
          ],
        },
      })

      const store = useTeamsStore()
      await store.fetchTeams()

      expect(store.teams).toHaveLength(2)
      expect(store.teams[0]!.name).toBe('Team Alpha')
    })

    it('sets loading state during fetch', async () => {
      mockApi.get.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { data: [] } }), 100))
      )

      const store = useTeamsStore()
      const promise = store.fetchTeams()

      expect(store.loading).toBe(true)

      await promise

      expect(store.loading).toBe(false)
    })

    it('resets loading on error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))

      const store = useTeamsStore()

      await expect(store.fetchTeams()).rejects.toThrow()
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchMembers', () => {
    it('populates members for a team', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'u1',
              name: 'Alice',
              email: 'alice@test.com',
              role: 'admin',
              is_admin: true,
              joined_at: '2025-01-01',
            },
          ],
        },
      })

      const store = useTeamsStore()
      await store.fetchMembers('team-1')

      expect(store.members).toHaveLength(1)
      expect(store.members[0]!.name).toBe('Alice')
      expect(mockApi.get).toHaveBeenCalledWith('/teams/team-1/members')
    })
  })

  describe('fetchInvitations', () => {
    it('populates invitations for a team', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'inv-1',
              email: 'bob@test.com',
              role: 'member',
              status: 'pending',
              expires_at: null,
              created_at: '2025-01-01',
            },
          ],
        },
      })

      const store = useTeamsStore()
      await store.fetchInvitations('team-1')

      expect(store.invitations).toHaveLength(1)
      expect(mockApi.get).toHaveBeenCalledWith('/teams/team-1/invitations')
    })
  })

  describe('fetchPendingInvitations', () => {
    it('populates pending invitations', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'inv-1',
              email: 'me@test.com',
              role: 'member',
              status: 'pending',
              expires_at: null,
              created_at: '2025-01-01',
            },
          ],
        },
      })

      const store = useTeamsStore()
      await store.fetchPendingInvitations()

      expect(store.pendingInvitations).toHaveLength(1)
      expect(mockApi.get).toHaveBeenCalledWith('/invitations')
    })
  })

  describe('inviteMember', () => {
    it('sends invitation and prepends to list', async () => {
      const newInvitation = {
        id: 'inv-new',
        email: 'new@test.com',
        role: 'member',
        status: 'pending',
        expires_at: null,
        created_at: '2025-01-01',
      }

      mockApi.post.mockResolvedValueOnce({ data: { data: newInvitation } })

      const store = useTeamsStore()
      await store.inviteMember('team-1', 'new@test.com', 'member')

      expect(store.invitations[0]).toEqual(newInvitation)
      expect(mockApi.post).toHaveBeenCalledWith('/teams/team-1/invitations', {
        email: 'new@test.com',
        role: 'member',
      })
    })
  })

  describe('removeMember', () => {
    it('removes member from local state', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'u1',
              name: 'Alice',
              email: 'alice@test.com',
              role: 'admin',
              is_admin: true,
              joined_at: '2025-01-01',
            },
            {
              id: 'u2',
              name: 'Bob',
              email: 'bob@test.com',
              role: 'member',
              is_admin: false,
              joined_at: '2025-01-01',
            },
          ],
        },
      })
      mockApi.delete.mockResolvedValueOnce({})

      const store = useTeamsStore()
      await store.fetchMembers('team-1')
      await store.removeMember('team-1', 'u2')

      expect(store.members).toHaveLength(1)
      expect(store.members[0]!.id).toBe('u1')
      expect(mockApi.delete).toHaveBeenCalledWith('/teams/team-1/members/u2')
    })
  })

  describe('updateMemberRole', () => {
    it('updates member role locally', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'u1',
              name: 'Alice',
              email: 'alice@test.com',
              role: 'member',
              is_admin: false,
              joined_at: '2025-01-01',
            },
          ],
        },
      })
      mockApi.put.mockResolvedValueOnce({})

      const store = useTeamsStore()
      await store.fetchMembers('team-1')
      await store.updateMemberRole('team-1', 'u1', 'admin')

      expect(store.members[0]!.is_admin).toBe(true)
      expect(mockApi.put).toHaveBeenCalledWith('/teams/team-1/members/u1/role', { role: 'admin' })
    })
  })

  describe('acceptInvitation', () => {
    it('removes from pending invitations', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'inv-1',
              email: 'me@test.com',
              role: 'member',
              status: 'pending',
              expires_at: null,
              created_at: '2025-01-01',
            },
            {
              id: 'inv-2',
              email: 'me@test.com',
              role: 'admin',
              status: 'pending',
              expires_at: null,
              created_at: '2025-01-01',
            },
          ],
        },
      })
      mockApi.post.mockResolvedValueOnce({})

      const store = useTeamsStore()
      await store.fetchPendingInvitations()
      await store.acceptInvitation('inv-1')

      expect(store.pendingInvitations).toHaveLength(1)
      expect(store.pendingInvitations[0]!.id).toBe('inv-2')
      expect(mockApi.post).toHaveBeenCalledWith('/invitations/inv-1/accept')
    })
  })

  describe('declineInvitation', () => {
    it('removes from pending invitations', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'inv-1',
              email: 'me@test.com',
              role: 'member',
              status: 'pending',
              expires_at: null,
              created_at: '2025-01-01',
            },
          ],
        },
      })
      mockApi.post.mockResolvedValueOnce({})

      const store = useTeamsStore()
      await store.fetchPendingInvitations()
      await store.declineInvitation('inv-1')

      expect(store.pendingInvitations).toHaveLength(0)
      expect(mockApi.post).toHaveBeenCalledWith('/invitations/inv-1/decline')
    })
  })

  describe('cancelInvitation', () => {
    it('removes from invitations list', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'inv-1',
              email: 'a@test.com',
              role: 'member',
              status: 'pending',
              expires_at: null,
              created_at: '2025-01-01',
            },
          ],
        },
      })
      mockApi.delete.mockResolvedValueOnce({})

      const store = useTeamsStore()
      await store.fetchInvitations('team-1')
      await store.cancelInvitation('team-1', 'inv-1')

      expect(store.invitations).toHaveLength(0)
      expect(mockApi.delete).toHaveBeenCalledWith('/teams/team-1/invitations/inv-1')
    })
  })

  describe('transferOwnership', () => {
    it('calls the correct API endpoint', async () => {
      mockApi.post.mockResolvedValueOnce({})

      const store = useTeamsStore()
      await store.transferOwnership('team-1', 'u2')

      expect(mockApi.post).toHaveBeenCalledWith('/teams/team-1/transfer-ownership', {
        user_id: 'u2',
      })
    })
  })

  describe('searchUsers', () => {
    it('returns search results', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [{ id: 'u1', name: 'Alice', email: 'alice@test.com' }],
        },
      })

      const store = useTeamsStore()
      const results = await store.searchUsers('alice', 'team-1')

      expect(results).toHaveLength(1)
      expect(results[0]!.name).toBe('Alice')
      expect(mockApi.get).toHaveBeenCalledWith('/users/search', {
        params: { q: 'alice', team_id: 'team-1' },
      })
    })
  })
})
