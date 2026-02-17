import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { HybridStorage } from '../src/storage'

// Node 22+ has a native localStorage without full Web Storage API.
// Create a proper mock that the LocalStorageAdapter (used internally by HybridStorage) can use.
function createMockStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => {
      const keys = Array.from(store.keys())
      return keys[index] ?? null
    },
    get length() {
      return store.size
    },
  } as Storage
}

const originalLocalStorage = globalThis.localStorage
let mockStorage: Storage

beforeEach(() => {
  mockStorage = createMockStorage()
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  })
})

afterAll(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: originalLocalStorage,
    writable: true,
    configurable: true,
  })
})

// Override Object.keys for our mock localStorage
const originalObjectKeys = Object.keys
vi.spyOn(Object, 'keys').mockImplementation((obj: object) => {
  if (obj === mockStorage) {
    const keys: string[] = []
    for (let i = 0; i < (obj as Storage).length; i++) {
      const key = (obj as Storage).key(i)
      if (key !== null) keys.push(key)
    }
    return keys
  }
  return originalObjectKeys(obj)
})

// Mock localforage to avoid IndexedDB dependency in tests
vi.mock('localforage', () => {
  const stores = new Map<string, Map<string, unknown>>()

  return {
    default: {
      INDEXEDDB: 'asyncStorage',
      createInstance: ({ storeName }: { storeName: string }) => {
        if (!stores.has(storeName)) {
          stores.set(storeName, new Map())
        }
        const store = stores.get(storeName)!
        return {
          getItem: async (key: string) => store.get(key) ?? null,
          setItem: async (key: string, value: unknown) => {
            store.set(key, value)
          },
          removeItem: async (key: string) => {
            store.delete(key)
          },
          clear: async () => {
            store.clear()
          },
          keys: async () => Array.from(store.keys()),
        }
      },
    },
  }
})

describe('HybridStorage', () => {
  let storage: HybridStorage

  beforeEach(() => {
    localStorage.clear()
    storage = new HybridStorage({
      localStoragePrefix: 'test:',
      dbName: 'test_db',
      indexedDBStores: {
        projects: ['project:'],
        responses: ['response:'],
      },
    })
  })

  describe('routing', () => {
    it('routes project: keys to IndexedDB', async () => {
      await storage.set('project:1', { id: '1', name: 'Test' })
      const result = await storage.get('project:1')
      expect(result).toEqual({ id: '1', name: 'Test' })
      // Should NOT be in localStorage
      expect(localStorage.getItem('test:project:1')).toBeNull()
    })

    it('routes response: keys to IndexedDB', async () => {
      await storage.set('response:1', { data: 'test' })
      const result = await storage.get('response:1')
      expect(result).toEqual({ data: 'test' })
      expect(localStorage.getItem('test:response:1')).toBeNull()
    })

    it('routes other keys to localStorage', async () => {
      await storage.set('user:token', 'abc123')
      const result = await storage.get('user:token')
      expect(result).toBe('abc123')
      expect(localStorage.getItem('test:user:token')).toBe('"abc123"')
    })
  })

  describe('get/set', () => {
    it('stores and retrieves objects', async () => {
      const obj = { id: '1', name: 'Project', status: 'draft' }
      await storage.set('project:1', obj)
      expect(await storage.get('project:1')).toEqual(obj)
    })

    it('returns null for missing keys', async () => {
      expect(await storage.get('nonexistent')).toBeNull()
    })
  })

  describe('remove', () => {
    it('removes from correct storage backend', async () => {
      await storage.set('project:1', { id: '1' })
      await storage.set('user:name', 'Alice')

      await storage.remove('project:1')
      await storage.remove('user:name')

      expect(await storage.get('project:1')).toBeNull()
      expect(await storage.get('user:name')).toBeNull()
    })
  })

  describe('clear', () => {
    it('clears both storage backends', async () => {
      await storage.set('project:1', { id: '1' })
      await storage.set('user:name', 'Alice')

      await storage.clear()

      expect(await storage.get('project:1')).toBeNull()
      expect(await storage.get('user:name')).toBeNull()
    })
  })

  describe('keys', () => {
    it('returns keys from both backends', async () => {
      await storage.set('project:1', { id: '1' })
      await storage.set('user:name', 'Alice')

      const keys = await storage.keys()
      expect(keys).toContain('project:1')
      expect(keys).toContain('user:name')
    })
  })

  describe('getAllByPrefix', () => {
    it('retrieves all entries from IndexedDB for project: prefix', async () => {
      await storage.set('project:1', { id: '1' })
      await storage.set('project:2', { id: '2' })
      await storage.set('user:name', 'Alice')

      const projects = await storage.getAllByPrefix<{ id: string }>('project:')
      expect(Object.keys(projects)).toHaveLength(2)
      expect(projects['project:1']).toEqual({ id: '1' })
      expect(projects['project:2']).toEqual({ id: '2' })
    })

    it('retrieves all entries from localStorage for user: prefix', async () => {
      await storage.set('user:name', 'Alice')
      await storage.set('user:email', 'alice@example.com')

      const users = await storage.getAllByPrefix<string>('user:')
      expect(Object.keys(users)).toHaveLength(2)
      expect(users['user:name']).toBe('Alice')
      expect(users['user:email']).toBe('alice@example.com')
    })
  })

  describe('custom routing', () => {
    it('supports custom useIndexedDB function', async () => {
      const customStorage = new HybridStorage({
        localStoragePrefix: 'custom:',
        dbName: 'custom_db',
        indexedDBStores: { data: ['data:'] },
        useIndexedDB: (key) => key.startsWith('data:'),
      })

      await customStorage.set('data:1', 'indexed')
      await customStorage.set('other:1', 'local')

      expect(localStorage.getItem('custom:data:1')).toBeNull()
      expect(localStorage.getItem('custom:other:1')).toBe('"local"')
    })
  })
})
