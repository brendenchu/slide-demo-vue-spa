import { describe, it, expect } from 'vitest'
import { DataSourceFactory } from '../src/dataSourceFactory'
import { LocalDataSource } from '../src/localDataSource'
import { ApiDataSource } from '../src/apiDataSource'
import type { ModelMap, HttpClient, LocalDataSourceConfig, ExtendedStorageAdapter } from '../src/types'

// Minimal mock HttpClient
function mockHttpClient(): HttpClient {
  return {
    get: async () => ({ data: {} }),
    post: async () => ({ data: {} }),
    put: async () => ({ data: {} }),
    delete: async () => ({ data: {} }),
  }
}

// Minimal mock storage
function mockStorage(): ExtendedStorageAdapter {
  return {
    get: async () => null,
    set: async () => {},
    remove: async () => {},
    clear: async () => {},
    keys: async () => [],
    getAllByPrefix: async () => ({}),
  }
}

// Minimal local config
function mockLocalConfig(): LocalDataSourceConfig<ModelMap> {
  return {
    storage: mockStorage(),
    validateCredentials: async () => ({ id: '1' }),
    createUser: (data) => ({ id: '1', ...data }),
    createProject: (data) => ({ id: '1', ...data }),
    createTeam: (data) => ({ id: '1', ...data }),
    mergeResponses: (existing, incoming) => ({ ...existing, ...incoming }),
    markCompleted: (project) => project,
  }
}

describe('DataSourceFactory', () => {
  describe('local mode', () => {
    it('creates a LocalDataSource', () => {
      const ds = DataSourceFactory.create<ModelMap>({
        mode: 'local',
        localConfig: mockLocalConfig(),
      })
      expect(ds).toBeInstanceOf(LocalDataSource)
    })

    it('throws when localConfig is missing', () => {
      expect(() =>
        DataSourceFactory.create<ModelMap>({ mode: 'local' })
      ).toThrow('localConfig is required for local mode')
    })
  })

  describe('api mode', () => {
    it('creates an ApiDataSource', () => {
      const ds = DataSourceFactory.create<ModelMap>({
        mode: 'api',
        httpClient: mockHttpClient(),
      })
      expect(ds).toBeInstanceOf(ApiDataSource)
    })

    it('throws when httpClient is missing', () => {
      expect(() =>
        DataSourceFactory.create<ModelMap>({ mode: 'api' })
      ).toThrow('httpClient is required for API mode')
    })
  })

  describe('hybrid mode', () => {
    it('throws not implemented error', () => {
      expect(() =>
        DataSourceFactory.create<ModelMap>({ mode: 'hybrid' })
      ).toThrow('Hybrid mode not yet implemented')
    })
  })

  describe('default mode', () => {
    it('defaults to local mode', () => {
      const ds = DataSourceFactory.create<ModelMap>({
        mode: 'local',
        localConfig: mockLocalConfig(),
      })
      expect(ds).toBeInstanceOf(LocalDataSource)
    })
  })
})
