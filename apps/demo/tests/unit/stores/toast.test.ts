import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '@/stores/toast'

describe('Toast Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('add', () => {
    it('creates a message with correct type and content', () => {
      const store = useToastStore()
      store.add('success', 'Test message')
      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]!.type).toBe('success')
      expect(store.messages[0]!.message).toBe('Test message')
    })

    it('returns a string id', () => {
      const store = useToastStore()
      const id = store.add('info', 'Test')
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('auto-removes after timeout', () => {
      const store = useToastStore()
      store.add('success', 'Temp', 3000)
      expect(store.messages).toHaveLength(1)

      vi.advanceTimersByTime(3000)
      expect(store.messages).toHaveLength(0)
    })

    it('does not auto-remove when timeout is 0', () => {
      const store = useToastStore()
      store.add('success', 'Persistent', 0)

      vi.advanceTimersByTime(60000)
      expect(store.messages).toHaveLength(1)
    })

    it('uses default timeout of 5000ms', () => {
      const store = useToastStore()
      store.add('info', 'Default timeout')

      vi.advanceTimersByTime(4999)
      expect(store.messages).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(store.messages).toHaveLength(0)
    })

    it('supports multiple concurrent messages', () => {
      const store = useToastStore()
      store.add('info', 'First', 0)
      store.add('warning', 'Second', 0)
      store.add('error', 'Third', 0)
      expect(store.messages).toHaveLength(3)
    })
  })

  describe('remove', () => {
    it('removes a specific message by id', () => {
      const store = useToastStore()
      const id = store.add('info', 'Target', 0)
      store.add('warning', 'Keep', 0)

      store.remove(id)
      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]!.type).toBe('warning')
    })

    it('does nothing for unknown id', () => {
      const store = useToastStore()
      store.add('info', 'Keep', 0)
      store.remove('nonexistent')
      expect(store.messages).toHaveLength(1)
    })
  })

  describe('clear', () => {
    it('removes all messages', () => {
      const store = useToastStore()
      store.add('info', 'A', 0)
      store.add('warning', 'B', 0)
      store.add('error', 'C', 0)

      store.clear()
      expect(store.messages).toHaveLength(0)
    })
  })

  describe('convenience methods', () => {
    it('success creates a success toast', () => {
      const store = useToastStore()
      store.success('It worked')
      expect(store.messages[0]!.type).toBe('success')
      expect(store.messages[0]!.message).toBe('It worked')
    })

    it('error creates an error toast', () => {
      const store = useToastStore()
      store.error('Oops')
      expect(store.messages[0]!.type).toBe('error')
    })

    it('warning creates a warning toast', () => {
      const store = useToastStore()
      store.warning('Watch out')
      expect(store.messages[0]!.type).toBe('warning')
    })

    it('info creates an info toast', () => {
      const store = useToastStore()
      store.info('FYI')
      expect(store.messages[0]!.type).toBe('info')
    })

    it('convenience methods accept custom timeout', () => {
      const store = useToastStore()
      store.success('Quick', 1000)

      vi.advanceTimersByTime(1000)
      expect(store.messages).toHaveLength(0)
    })
  })
})
