import { vi } from 'vitest'
import 'vitest-localstorage-mock'

// Mock localforage for testing
vi.mock('localforage', () => {
  const createStoreMock = () => {
    const store: Map<string, unknown> = new Map()

    return {
      getItem: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
      setItem: vi.fn((key: string, value: unknown) => {
        store.set(key, value)
        return Promise.resolve(value)
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key)
        return Promise.resolve()
      }),
      clear: vi.fn(() => {
        store.clear()
        return Promise.resolve()
      }),
      keys: vi.fn(() => Promise.resolve(Array.from(store.keys()))),
      length: vi.fn(() => Promise.resolve(store.size)),
      iterate: vi.fn((iteratorCallback: (value: unknown, key: string) => void) => {
        store.forEach((value, key) => iteratorCallback(value, key))
        return Promise.resolve()
      }),
    }
  }

  const defaultInstance = createStoreMock()

  return {
    default: {
      ...defaultInstance,
      createInstance: vi.fn(() => createStoreMock()),
    },
  }
})

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
