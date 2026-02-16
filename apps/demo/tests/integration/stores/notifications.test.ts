import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '@/stores/notifications'

const mockDataSource = {
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  // Stubs for other DataSource methods
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  acceptTerms: vi.fn(),
  getProjects: vi.fn(),
  getProject: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  saveResponses: vi.fn(),
  completeProject: vi.fn(),
  deleteProject: vi.fn(),
  createTeam: vi.fn(),
  getTeams: vi.fn(),
}

vi.mock('@/stores/persistence', () => ({
  createDataSource: vi.fn(() => mockDataSource),
  storage: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}))

describe('Notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('fetchNotifications', () => {
    it('populates notifications and unread count', async () => {
      mockDataSource.getNotifications.mockResolvedValueOnce({
        notifications: [
          {
            id: '1',
            title: 'Test',
            content: null,
            type: null,
            link: null,
            read_at: null,
            created_at: '2025-01-01',
          },
          {
            id: '2',
            title: 'Read',
            content: null,
            type: null,
            link: null,
            read_at: '2025-01-01',
            created_at: '2025-01-01',
          },
        ],
        unread_count: 1,
      })

      const store = useNotificationStore()
      await store.fetchNotifications()

      expect(store.notifications).toHaveLength(2)
      expect(store.unreadCount).toBe(1)
    })

    it('handles fetch errors gracefully', async () => {
      mockDataSource.getNotifications.mockRejectedValueOnce(new Error('Network error'))

      const store = useNotificationStore()
      await store.fetchNotifications()

      expect(store.notifications).toHaveLength(0)
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('markAsRead', () => {
    it('marks a notification as read and decrements unread count', async () => {
      mockDataSource.getNotifications.mockResolvedValueOnce({
        notifications: [
          {
            id: '1',
            title: 'Unread',
            content: null,
            type: null,
            link: null,
            read_at: null,
            created_at: '2025-01-01',
          },
        ],
        unread_count: 1,
      })
      mockDataSource.markNotificationAsRead.mockResolvedValueOnce(undefined)

      const store = useNotificationStore()
      await store.fetchNotifications()

      await store.markAsRead('1')

      expect(store.notifications[0]!.read_at).toBeTruthy()
      expect(store.unreadCount).toBe(0)
    })

    it('does not decrement below 0', async () => {
      mockDataSource.getNotifications.mockResolvedValueOnce({
        notifications: [
          {
            id: '1',
            title: 'Test',
            content: null,
            type: null,
            link: null,
            read_at: null,
            created_at: '2025-01-01',
          },
        ],
        unread_count: 0,
      })
      mockDataSource.markNotificationAsRead.mockResolvedValueOnce(undefined)

      const store = useNotificationStore()
      await store.fetchNotifications()
      await store.markAsRead('1')

      expect(store.unreadCount).toBe(0)
    })

    it('handles errors gracefully', async () => {
      mockDataSource.getNotifications.mockResolvedValueOnce({
        notifications: [
          {
            id: '1',
            title: 'Test',
            content: null,
            type: null,
            link: null,
            read_at: null,
            created_at: '2025-01-01',
          },
        ],
        unread_count: 1,
      })
      mockDataSource.markNotificationAsRead.mockRejectedValueOnce(new Error('Failed'))

      const store = useNotificationStore()
      await store.fetchNotifications()
      await store.markAsRead('1')

      // State should not change on error
      expect(store.unreadCount).toBe(1)
    })
  })

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
      mockDataSource.getNotifications.mockResolvedValueOnce({
        notifications: [
          {
            id: '1',
            title: 'A',
            content: null,
            type: null,
            link: null,
            read_at: null,
            created_at: '2025-01-01',
          },
          {
            id: '2',
            title: 'B',
            content: null,
            type: null,
            link: null,
            read_at: null,
            created_at: '2025-01-01',
          },
        ],
        unread_count: 2,
      })
      mockDataSource.markAllNotificationsAsRead.mockResolvedValueOnce(undefined)

      const store = useNotificationStore()
      await store.fetchNotifications()
      await store.markAllAsRead()

      expect(store.unreadCount).toBe(0)
      expect(store.notifications.every((n) => n.read_at !== null)).toBe(true)
    })

    it('handles errors gracefully', async () => {
      mockDataSource.getNotifications.mockResolvedValueOnce({
        notifications: [
          {
            id: '1',
            title: 'A',
            content: null,
            type: null,
            link: null,
            read_at: null,
            created_at: '2025-01-01',
          },
        ],
        unread_count: 1,
      })
      mockDataSource.markAllNotificationsAsRead.mockRejectedValueOnce(new Error('Failed'))

      const store = useNotificationStore()
      await store.fetchNotifications()
      await store.markAllAsRead()

      expect(store.unreadCount).toBe(1)
    })
  })

  describe('hasUnread', () => {
    it('returns true when unread count > 0', async () => {
      mockDataSource.getNotifications.mockResolvedValueOnce({
        notifications: [],
        unread_count: 3,
      })

      const store = useNotificationStore()
      await store.fetchNotifications()

      expect(store.hasUnread).toBe(true)
    })

    it('returns false when unread count is 0', () => {
      const store = useNotificationStore()
      expect(store.hasUnread).toBe(false)
    })
  })

  describe('polling', () => {
    it('startPolling fetches immediately and sets interval', async () => {
      mockDataSource.getNotifications.mockResolvedValue({
        notifications: [],
        unread_count: 0,
      })

      const store = useNotificationStore()
      store.startPolling()

      // Should fetch immediately
      expect(mockDataSource.getNotifications).toHaveBeenCalledTimes(1)

      // Advance 30 seconds - should fetch again
      await vi.advanceTimersByTimeAsync(30000)
      expect(mockDataSource.getNotifications).toHaveBeenCalledTimes(2)
    })

    it('startPolling does not create duplicate intervals', async () => {
      mockDataSource.getNotifications.mockResolvedValue({
        notifications: [],
        unread_count: 0,
      })

      const store = useNotificationStore()
      store.startPolling()
      store.startPolling()

      expect(mockDataSource.getNotifications).toHaveBeenCalledTimes(1)
    })

    it('stopPolling clears the interval', async () => {
      mockDataSource.getNotifications.mockResolvedValue({
        notifications: [],
        unread_count: 0,
      })

      const store = useNotificationStore()
      store.startPolling()
      store.stopPolling()

      await vi.advanceTimersByTimeAsync(60000)
      // Only the initial call from startPolling
      expect(mockDataSource.getNotifications).toHaveBeenCalledTimes(1)
    })
  })
})
