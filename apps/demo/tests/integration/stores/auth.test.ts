import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { storage } from '@/stores/persistence/storage'
import { DataSourceFactory } from '@/stores/persistence/dataSourceFactory'
import type { User } from '@/types/models'

// Mock the storage module
vi.mock('@/stores/persistence/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}))

// Mock the data source factory
vi.mock('@/stores/persistence/dataSourceFactory', () => ({
  DataSourceFactory: {
    create: vi.fn(() => ({
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
    })),
  },
}))

describe('Auth Store Integration', () => {
  let mockDataSource: {
    login: ReturnType<typeof vi.fn>
    register: ReturnType<typeof vi.fn>
    logout: ReturnType<typeof vi.fn>
    updateUser: ReturnType<typeof vi.fn>
    getUser: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mockDataSource = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
    }

    vi.mocked(DataSourceFactory.create).mockReturnValue(
      mockDataSource as unknown as ReturnType<typeof DataSourceFactory.create>
    )
  })

  describe('loadUser', () => {
    it('loads user and token from storage', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        team_id: null,
      }
      const mockToken = 'stored-token-123'

      vi.mocked(storage.get)
        .mockResolvedValueOnce(mockToken) // auth:token
        .mockResolvedValueOnce(mockUser) // auth:user

      const authStore = useAuthStore()
      await authStore.loadUser()

      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('does not set user when storage is empty', async () => {
      vi.mocked(storage.get).mockResolvedValue(null)

      const authStore = useAuthStore()
      await authStore.loadUser()

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('handles storage errors gracefully', async () => {
      vi.mocked(storage.get).mockRejectedValue(new Error('Storage error'))

      const authStore = useAuthStore()
      await authStore.loadUser()

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
    })
  })

  describe('login', () => {
    it('logs in successfully and persists to storage', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        team_id: null,
      }
      const mockToken = 'login-token-123'

      mockDataSource.login.mockResolvedValueOnce({
        user: mockUser,
        token: mockToken,
      })

      const authStore = useAuthStore()
      const result = await authStore.login('test@example.com', 'password')

      expect(result).toEqual(mockUser)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.isAuthenticated).toBe(true)

      expect(mockDataSource.login).toHaveBeenCalledWith('test@example.com', 'password')
      expect(storage.set).toHaveBeenCalledWith('auth:token', mockToken)
      expect(storage.set).toHaveBeenCalledWith('auth:user', mockUser)
    })

    it('throws error on login failure', async () => {
      mockDataSource.login.mockRejectedValueOnce(new Error('Invalid credentials'))

      const authStore = useAuthStore()

      await expect(authStore.login('wrong@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials'
      )

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('registers successfully and persists to storage', async () => {
      const mockUser: User = {
        id: '1',
        email: 'jane.doe.abc1@example.com',
        name: 'Jane Doe',
        team_id: null,
      }
      const mockToken = 'register-token-123'

      mockDataSource.register.mockResolvedValueOnce({
        user: mockUser,
        token: mockToken,
      })

      const authStore = useAuthStore()
      const result = await authStore.register('Jane', 'Doe')

      expect(result).toEqual(mockUser)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.isAuthenticated).toBe(true)

      expect(mockDataSource.register).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Doe',
      })
      expect(storage.set).toHaveBeenCalledWith('auth:token', mockToken)
      expect(storage.set).toHaveBeenCalledWith('auth:user', mockUser)
    })

    it('throws error on registration failure', async () => {
      mockDataSource.register.mockRejectedValueOnce(new Error('Registration failed'))

      const authStore = useAuthStore()

      await expect(authStore.register('Jane', 'Doe')).rejects.toThrow('Registration failed')

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('logs out and clears storage', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        team_id: null,
      }

      mockDataSource.login.mockResolvedValueOnce({
        user: mockUser,
        token: 'test-token',
      })

      const authStore = useAuthStore()
      await authStore.login('test@example.com', 'password')

      expect(authStore.isAuthenticated).toBe(true)

      await authStore.logout()

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)

      expect(mockDataSource.logout).toHaveBeenCalled()
      expect(storage.remove).toHaveBeenCalledWith('auth:token')
      expect(storage.remove).toHaveBeenCalledWith('auth:user')
    })

    it('throws error on logout failure', async () => {
      mockDataSource.logout.mockRejectedValueOnce(new Error('Network error'))

      const authStore = useAuthStore()

      await expect(authStore.logout()).rejects.toThrow('Network error')
    })
  })

  describe('updateProfile', () => {
    it('updates profile and persists to storage', async () => {
      const mockUser: User = {
        id: '1',
        email: 'old@example.com',
        name: 'Old Name',
        team_id: null,
      }

      const updatedUser: User = {
        ...mockUser,
        name: 'New Name',
        email: 'new@example.com',
      }

      mockDataSource.login.mockResolvedValueOnce({
        user: mockUser,
        token: 'test-token',
      })

      mockDataSource.updateUser.mockResolvedValueOnce(updatedUser)

      const authStore = useAuthStore()
      await authStore.login('old@example.com', 'password')

      await authStore.updateProfile({
        name: 'New Name',
        email: 'new@example.com',
      })

      expect(authStore.user).toEqual(updatedUser)
      expect(mockDataSource.updateUser).toHaveBeenCalledWith({
        name: 'New Name',
        email: 'new@example.com',
      })
      expect(storage.set).toHaveBeenCalledWith('auth:user', updatedUser)
    })

    it('does nothing when user is not authenticated', async () => {
      const authStore = useAuthStore()

      await authStore.updateProfile({ name: 'New Name' })

      expect(mockDataSource.updateUser).not.toHaveBeenCalled()
      expect(storage.set).not.toHaveBeenCalled()
    })

    it('throws error on update failure', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        team_id: null,
      }

      mockDataSource.login.mockResolvedValueOnce({
        user: mockUser,
        token: 'test-token',
      })

      mockDataSource.updateUser.mockRejectedValueOnce(new Error('Validation failed'))

      const authStore = useAuthStore()
      await authStore.login('test@example.com', 'password')

      await expect(authStore.updateProfile({ name: 'Invalid' })).rejects.toThrow(
        'Validation failed'
      )
    })
  })

  describe('isAuthenticated getter', () => {
    it('returns true when user is logged in', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        team_id: null,
      }

      mockDataSource.login.mockResolvedValueOnce({
        user: mockUser,
        token: 'test-token',
      })

      const authStore = useAuthStore()
      expect(authStore.isAuthenticated).toBe(false)

      await authStore.login('test@example.com', 'password')
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('returns false when user is logged out', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        team_id: null,
      }

      mockDataSource.login.mockResolvedValueOnce({
        user: mockUser,
        token: 'test-token',
      })

      const authStore = useAuthStore()
      await authStore.login('test@example.com', 'password')
      expect(authStore.isAuthenticated).toBe(true)

      await authStore.logout()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })
})
