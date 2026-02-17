import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { LocalStorageAdapter } from '../src/localStorage'

// Node 22+ has a native localStorage without full Web Storage API.
// Create a proper mock that the LocalStorageAdapter can use.
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
    [Symbol.iterator]: function* () {
      yield* store.keys()
    },
  } as Storage & Iterable<string>
}

// Patch Object.keys to work with our mock for localStorage
const originalLocalStorage = globalThis.localStorage
let mockStorage: Storage & { _store?: Map<string, string> }

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

// The LocalStorageAdapter uses Object.keys(localStorage) which requires
// the mock to support enumeration. Override Object.keys for localStorage.
const originalObjectKeys = Object.keys
vi.spyOn(Object, 'keys').mockImplementation((obj: object) => {
  if (obj === mockStorage) {
    // Enumerate via the Storage API
    const keys: string[] = []
    for (let i = 0; i < (obj as Storage).length; i++) {
      const key = (obj as Storage).key(i)
      if (key !== null) keys.push(key)
    }
    return keys
  }
  return originalObjectKeys(obj)
})

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    localStorage.clear()
    adapter = new LocalStorageAdapter('test:')
  })

  describe('get', () => {
    it('returns null for missing key', async () => {
      expect(await adapter.get('nonexistent')).toBeNull()
    })

    it('retrieves a stored string value', async () => {
      localStorage.setItem('test:name', JSON.stringify('Alice'))
      expect(await adapter.get<string>('name')).toBe('Alice')
    })

    it('retrieves a stored object', async () => {
      const obj = { id: '1', name: 'Project' }
      localStorage.setItem('test:project', JSON.stringify(obj))
      expect(await adapter.get('project')).toEqual(obj)
    })

    it('returns null for invalid JSON', async () => {
      localStorage.setItem('test:bad', 'not-json{')
      expect(await adapter.get('bad')).toBeNull()
    })
  })

  describe('set', () => {
    it('stores a string value', async () => {
      await adapter.set('key', 'value')
      expect(localStorage.getItem('test:key')).toBe('"value"')
    })

    it('stores an object', async () => {
      await adapter.set('obj', { a: 1 })
      expect(JSON.parse(localStorage.getItem('test:obj')!)).toEqual({ a: 1 })
    })

    it('stores a number', async () => {
      await adapter.set('num', 42)
      expect(await adapter.get<number>('num')).toBe(42)
    })
  })

  describe('remove', () => {
    it('removes a stored key', async () => {
      await adapter.set('key', 'value')
      await adapter.remove('key')
      expect(await adapter.get('key')).toBeNull()
    })

    it('does not throw for missing key', async () => {
      await expect(adapter.remove('nonexistent')).resolves.toBeUndefined()
    })
  })

  describe('clear', () => {
    it('removes only keys with the adapter prefix', async () => {
      await adapter.set('a', 1)
      await adapter.set('b', 2)
      localStorage.setItem('other:key', 'keep')

      await adapter.clear()

      expect(await adapter.get('a')).toBeNull()
      expect(await adapter.get('b')).toBeNull()
      expect(localStorage.getItem('other:key')).toBe('keep')
    })
  })

  describe('keys', () => {
    it('returns empty array when no keys', async () => {
      expect(await adapter.keys()).toEqual([])
    })

    it('returns only keys with the adapter prefix, without prefix', async () => {
      await adapter.set('a', 1)
      await adapter.set('b', 2)
      localStorage.setItem('other:key', 'skip')

      const keys = await adapter.keys()
      expect(keys.sort()).toEqual(['a', 'b'])
    })
  })

  describe('getAllByPrefix', () => {
    it('returns matching entries', async () => {
      await adapter.set('project:1', { id: '1' })
      await adapter.set('project:2', { id: '2' })
      await adapter.set('user:1', { id: 'u1' })

      const result = await adapter.getAllByPrefix<{ id: string }>('project:')
      expect(Object.keys(result)).toHaveLength(2)
      expect(result['project:1']).toEqual({ id: '1' })
      expect(result['project:2']).toEqual({ id: '2' })
    })

    it('returns empty object when no matches', async () => {
      await adapter.set('user:1', { id: 'u1' })
      const result = await adapter.getAllByPrefix('project:')
      expect(result).toEqual({})
    })
  })

  describe('custom prefix', () => {
    it('uses default prefix when none specified', async () => {
      const defaultAdapter = new LocalStorageAdapter()
      await defaultAdapter.set('key', 'val')
      expect(localStorage.getItem('vsd:key')).toBe('"val"')
    })

    it('isolates data between different prefixes', async () => {
      const adapter2 = new LocalStorageAdapter('other:')
      await adapter.set('key', 'from-test')
      await adapter2.set('key', 'from-other')

      expect(await adapter.get('key')).toBe('from-test')
      expect(await adapter2.get('key')).toBe('from-other')
    })
  })
})
