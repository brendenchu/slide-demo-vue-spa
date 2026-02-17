import localforage from 'localforage'
import type { ExtendedStorageAdapter, IndexedDBConfig } from './types'

export class IndexedDBAdapter implements ExtendedStorageAdapter {
  private stores: Map<string, LocalForage> = new Map()
  private prefixRouting: Map<string, string> = new Map()
  private defaultStoreName: string

  constructor(config: IndexedDBConfig) {
    const storeNames = Object.keys(config.stores)
    this.defaultStoreName = storeNames[0] ?? 'default'

    // Create localforage instances for each store and build prefix routing
    for (const [storeName, prefixes] of Object.entries(config.stores)) {
      const instance = localforage.createInstance({
        name: config.dbName,
        storeName,
        driver: localforage.INDEXEDDB,
      })
      this.stores.set(storeName, instance)

      for (const prefix of prefixes) {
        this.prefixRouting.set(prefix, storeName)
      }
    }
  }

  private getStore(key: string): LocalForage {
    for (const [prefix, storeName] of this.prefixRouting) {
      if (key.startsWith(prefix)) {
        const store = this.stores.get(storeName)
        if (store) return store
      }
    }
    // Default to first store
    return this.stores.get(this.defaultStoreName)!
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const store = this.getStore(key)
      const value = await store.getItem<T>(key)
      return value
    } catch (error) {
      console.error('IndexedDB get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const store = this.getStore(key)
      await store.setItem(key, value)
    } catch (error) {
      console.error('IndexedDB set error:', error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const store = this.getStore(key)
      await store.removeItem(key)
    } catch (error) {
      console.error('IndexedDB remove error:', error)
    }
  }

  async clear(): Promise<void> {
    try {
      for (const store of this.stores.values()) {
        await store.clear()
      }
    } catch (error) {
      console.error('IndexedDB clear error:', error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      const allKeys: string[] = []
      for (const store of this.stores.values()) {
        const storeKeys = await store.keys()
        allKeys.push(...storeKeys)
      }
      return allKeys
    } catch (error) {
      console.error('IndexedDB keys error:', error)
      return []
    }
  }

  async getAllByPrefix<T>(prefix: string): Promise<Record<string, T>> {
    const result: Record<string, T> = {}
    const allKeys = await this.keys()
    const matchingKeys = allKeys.filter((key) => key.startsWith(prefix))

    for (const key of matchingKeys) {
      const value = await this.get<T>(key)
      if (value !== null) {
        result[key] = value
      }
    }

    return result
  }
}
