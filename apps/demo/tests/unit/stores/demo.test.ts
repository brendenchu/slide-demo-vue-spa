import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDemoStore } from '@/stores/demo'
import { useAuthStore } from '@/stores/auth'

const mockGet = vi.fn()

vi.mock('@/lib/axios', () => ({
  getApiClient: vi.fn(() => ({
    get: mockGet,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
  getErrorMessage: vi.fn((e: unknown) => (e instanceof Error ? e.message : 'Unknown error')),
}))

vi.mock('@/stores/persistence', () => ({
  storage: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
  createDataSource: vi.fn(() => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    getUser: vi.fn(),
    acceptTerms: vi.fn(),
    getProjects: vi.fn(),
    getProject: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    saveResponses: vi.fn(),
    completeProject: vi.fn(),
    deleteProject: vi.fn(),
    getNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
  })),
}))

describe('Demo Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with enabled false', () => {
      const store = useDemoStore()
      expect(store.enabled).toBe(false)
    })

    it('starts with limits null', () => {
      const store = useDemoStore()
      expect(store.limits).toBeNull()
    })

    it('starts with loaded false', () => {
      const store = useDemoStore()
      expect(store.loaded).toBe(false)
    })
  })

  describe('fetchStatus', () => {
    it('sets enabled and limits on success', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data: {
            demo_mode: true,
            limits: {
              max_users: 10,
              max_teams_per_user: 3,
              max_projects_per_team: 5,
              max_invitations_per_team: 10,
            },
          },
        },
      })

      const store = useDemoStore()
      await store.fetchStatus()

      expect(store.enabled).toBe(true)
      expect(store.limits).toEqual({
        max_users: 10,
        max_teams_per_user: 3,
        max_projects_per_team: 5,
        max_invitations_per_team: 10,
      })
      expect(store.loaded).toBe(true)
    })

    it('resets to defaults on error', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'))

      const store = useDemoStore()
      await store.fetchStatus()

      expect(store.enabled).toBe(false)
      expect(store.limits).toBeNull()
      expect(store.loaded).toBe(true)
    })
  })

  describe('computed values', () => {
    it('isDemoMode reflects enabled state', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: { demo_mode: true, limits: null } },
      })

      const store = useDemoStore()
      expect(store.isDemoMode).toBe(false)

      await store.fetchStatus()
      expect(store.isDemoMode).toBe(true)
    })

    it('limit getters return 0 when no limits', () => {
      const store = useDemoStore()
      expect(store.maxUsers).toBe(0)
      expect(store.maxTeamsPerUser).toBe(0)
      expect(store.maxProjectsPerTeam).toBe(0)
      expect(store.maxInvitationsPerTeam).toBe(0)
    })

    it('limit getters return correct values when limits set', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data: {
            demo_mode: true,
            limits: {
              max_users: 10,
              max_teams_per_user: 3,
              max_projects_per_team: 5,
              max_invitations_per_team: 10,
            },
          },
        },
      })

      const store = useDemoStore()
      await store.fetchStatus()

      expect(store.maxUsers).toBe(10)
      expect(store.maxTeamsPerUser).toBe(3)
      expect(store.maxProjectsPerTeam).toBe(5)
      expect(store.maxInvitationsPerTeam).toBe(10)
    })
  })

  describe('isDemoAccount', () => {
    it('returns false when no user is authenticated', () => {
      const store = useDemoStore()
      expect(store.isDemoAccount).toBe(false)
    })

    it('returns true when user email is demo@example.com', () => {
      const authStore = useAuthStore()
      authStore.user = {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        team_id: null,
      }

      const store = useDemoStore()
      expect(store.isDemoAccount).toBe(true)
    })

    it('returns false when user email is not demo email', () => {
      const authStore = useAuthStore()
      authStore.user = {
        id: '2',
        email: 'regular@example.com',
        name: 'Regular User',
        team_id: null,
      }

      const store = useDemoStore()
      expect(store.isDemoAccount).toBe(false)
    })
  })
})
