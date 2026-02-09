<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import Dropdown from '@/components/Common/UI/Navigation/DropdownMenu.vue'

const router = useRouter()
const notificationStore = useNotificationStore()

onMounted(() => {
  notificationStore.startPolling()
})

onUnmounted(() => {
  notificationStore.stopPolling()
})

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

async function handleNotificationClick(notification: {
  id: string
  link: string | null
  read_at: string | null
}) {
  if (!notification.read_at) {
    await notificationStore.markAsRead(notification.id)
  }
  if (notification.link) {
    router.push(notification.link)
  }
}

async function handleMarkAllAsRead() {
  await notificationStore.markAllAsRead()
}
</script>

<template>
  <div class="relative">
    <Dropdown align="right" width="80" content-classes="py-0 bg-base-200 border border-base-300">
      <template #trigger>
        <button
          class="relative inline-flex items-center p-2 text-base-content/60 hover:text-base-content focus:outline-none transition"
          type="button"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            v-if="notificationStore.hasUnread"
            class="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-secondary-content bg-secondary rounded-full"
          >
            {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
          </span>
        </button>
      </template>

      <template #content>
        <div class="w-80">
          <div class="flex items-center justify-between px-4 py-3 border-b border-base-300">
            <span class="text-sm font-semibold text-base-content">Notifications</span>
            <button
              v-if="notificationStore.hasUnread"
              class="text-xs text-primary hover:text-primary/80"
              @click.stop="handleMarkAllAsRead"
            >
              Mark all as read
            </button>
          </div>

          <div class="max-h-72 overflow-y-auto">
            <div
              v-if="notificationStore.notifications.length === 0"
              class="px-4 py-6 text-center text-sm text-base-content/50"
            >
              No notifications
            </div>

            <button
              v-for="notification in notificationStore.notifications"
              :key="notification.id"
              class="w-full text-left px-4 py-3 border-b border-base-300 last:border-b-0 hover:bg-base-300 transition"
              :class="{ 'bg-primary/10': !notification.read_at }"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start gap-2">
                <span
                  v-if="!notification.read_at"
                  class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                ></span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-base-content truncate">{{ notification.title }}</p>
                  <p v-if="notification.content" class="text-xs text-base-content/60 mt-0.5 truncate">
                    {{ notification.content }}
                  </p>
                  <p class="text-xs text-base-content/40 mt-1">{{ timeAgo(notification.created_at) }}</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </template>
    </Dropdown>
  </div>
</template>
