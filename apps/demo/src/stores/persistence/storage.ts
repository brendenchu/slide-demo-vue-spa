import { LocalStorageAdapter } from './localStorage'
import { IndexedDBAdapter } from './indexedDB'
import type { StorageAdapter } from './types'

class HybridStorage implements StorageAdapter {
  private localStorage: LocalStorageAdapter
  private indexedDB: IndexedDBAdapter

  constructor() {
    this.localStorage = new LocalStorageAdapter()
    this.indexedDB = new IndexedDBAdapter()
  }

  /**
   * Determine which storage to use based on key prefix
   */
  private selectStorage(key: string): StorageAdapter {
    // Use IndexedDB for projects and responses (large data)
    if (key.startsWith('project:') || key.startsWith('response:')) {
      return this.indexedDB
    }

    // Use localStorage for everything else (auth, settings, etc.)
    return this.localStorage
  }

  async get<T>(key: string): Promise<T | null> {
    const storage = this.selectStorage(key)
    return storage.get<T>(key)
  }

  async set<T>(key: string, value: T): Promise<void> {
    const storage = this.selectStorage(key)
    return storage.set(key, value)
  }

  async remove(key: string): Promise<void> {
    const storage = this.selectStorage(key)
    return storage.remove(key)
  }

  async clear(): Promise<void> {
    await this.localStorage.clear()
    await this.indexedDB.clear()
  }

  async keys(): Promise<string[]> {
    const localKeys = await this.localStorage.keys()
    const indexedKeys = await this.indexedDB.keys()
    return [...localKeys, ...indexedKeys]
  }

  async getAllByPrefix<T>(prefix: string): Promise<Record<string, T>> {
    const storage = this.selectStorage(prefix)

    // Check if storage has getAllByPrefix method
    if ('getAllByPrefix' in storage) {
      return (storage as LocalStorageAdapter | IndexedDBAdapter).getAllByPrefix<T>(prefix)
    }

    // Fallback implementation
    const result: Record<string, T> = {}
    const allKeys = await storage.keys()
    const matchingKeys = allKeys.filter((key) => key.startsWith(prefix))

    for (const key of matchingKeys) {
      const value = await storage.get<T>(key)
      if (value !== null) {
        result[key] = value
      }
    }

    return result
  }
}

// Export singleton instance
export const storage = new HybridStorage()

// Export individual adapters for direct access if needed
export { LocalStorageAdapter } from './localStorage'
export { IndexedDBAdapter } from './indexedDB'
