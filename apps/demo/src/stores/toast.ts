import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  timeout?: number
}

export const useToastStore = defineStore('toast', () => {
  const messages = ref<ToastMessage[]>([])

  function add(type: ToastType, message: string, timeout = 5000) {
    const id = Math.random().toString(36).substring(7)
    messages.value.push({ id, type, message, timeout })

    if (timeout > 0) {
      setTimeout(() => remove(id), timeout)
    }

    return id
  }

  function remove(id: string) {
    messages.value = messages.value.filter((m) => m.id !== id)
  }

  function clear() {
    messages.value = []
  }

  function success(message: string, timeout?: number) {
    return add('success', message, timeout)
  }

  function error(message: string, timeout?: number) {
    return add('error', message, timeout)
  }

  function warning(message: string, timeout?: number) {
    return add('warning', message, timeout)
  }

  function info(message: string, timeout?: number) {
    return add('info', message, timeout)
  }

  return {
    messages,
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info,
  }
})
