import localforage from 'localforage'
import type { StorageAdapter } from './types'

const DB_NAME = 'vue_slide_demo'

// Configure localforage for IndexedDB
const projectsStore = localforage.createInstance({
  name: DB_NAME,
  storeName: 'projects',
  driver: localforage.INDEXEDDB,
})

const responsesStore = localforage.createInstance({
  name: DB_NAME,
  storeName: 'responses',
  driver: localforage.INDEXEDDB,
})

export class IndexedDBAdapter implements StorageAdapter {
  private getStore(key: string) {
    // Route to appropriate store based on key prefix
    if (key.startsWith('project:')) {
      return projectsStore
    }
    if (key.startsWith('response:')) {
      return responsesStore
    }
    // Default to projects store
    return projectsStore
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
      await projectsStore.clear()
      await responsesStore.clear()
    } catch (error) {
      console.error('IndexedDB clear error:', error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      const projectKeys = await projectsStore.keys()
      const responseKeys = await responsesStore.keys()
      return [...projectKeys, ...responseKeys] as string[]
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

export const indexedDBAdapter = new IndexedDBAdapter()
