import { LocalStorageAdapter } from './localStorage'
import { IndexedDBAdapter } from './indexedDB'
import type { ExtendedStorageAdapter, HybridStorageConfig } from './types'

export class HybridStorage implements ExtendedStorageAdapter {
  private localStorage: LocalStorageAdapter
  private indexedDB: IndexedDBAdapter
  private useIndexedDB: (key: string) => boolean

  constructor(config?: Partial<HybridStorageConfig>) {
    const prefix = config?.localStoragePrefix ?? 'vsd:'
    const dbName = config?.dbName ?? 'slide_form_demo'
    const stores = config?.indexedDBStores ?? {
      projects: ['project:'],
      responses: ['response:'],
    }
    this.useIndexedDB =
      config?.useIndexedDB ??
      ((key: string) => key.startsWith('project:') || key.startsWith('response:'))

    this.localStorage = new LocalStorageAdapter(prefix)
    this.indexedDB = new IndexedDBAdapter({ dbName, stores })
  }

  private selectStorage(key: string): ExtendedStorageAdapter {
    if (this.useIndexedDB(key)) {
      return this.indexedDB
    }
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
    return storage.getAllByPrefix<T>(prefix)
  }
}

/**
 * Factory function to create a HybridStorage instance
 */
export function createHybridStorage(config?: Partial<HybridStorageConfig>): HybridStorage {
  return new HybridStorage(config)
}
