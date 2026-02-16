import type { StorageAdapter } from './types'

const PREFIX = 'vsd:'

export class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(PREFIX + key)
      if (!item) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error('LocalStorage get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (error) {
      console.error('LocalStorage set error:', error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch (error) {
      console.error('LocalStorage remove error:', error)
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('LocalStorage clear error:', error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith(PREFIX))
        .map((key) => key.replace(PREFIX, ''))
    } catch (error) {
      console.error('LocalStorage keys error:', error)
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

export const localStorageAdapter = new LocalStorageAdapter()
