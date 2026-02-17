import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createDataSource } from './persistence'
import type { AppNotification } from '@/types/models'

export const useNotificationStore = defineStore('notifications', () => {
  const dataSource = createDataSource()

  // State
  const notifications = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  let pollInterval: ReturnType<typeof setInterval> | null = null

  // Getters
  const hasUnread = computed(() => unreadCount.value > 0)

  // Actions
  async function fetchNotifications() {
    try {
      const result = await dataSource.getNotifications()
      notifications.value = result.notifications
      unreadCount.value = result.unread_count
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  async function markAsRead(id: string) {
    try {
      await dataSource.markNotificationAsRead(id)
      const notification = notifications.value.find((n) => n.id === id)
      if (notification) {
        notification.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  async function markAllAsRead() {
    try {
      await dataSource.markAllNotificationsAsRead()
      notifications.value.forEach((n) => {
        if (!n.read_at) {
          n.read_at = new Date().toISOString()
        }
      })
      unreadCount.value = 0
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  function startPolling() {
    if (pollInterval) return
    fetchNotifications()
    pollInterval = setInterval(fetchNotifications, 30000)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  return {
    // State
    notifications,
    unreadCount,
    // Getters
    hasUnread,
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  }
})
