import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exportLocalDataAsJSON, clearLocalDataAfterMigration } from '@/utils/migrate'
import { storage } from '@/stores/persistence'

vi.mock('@/stores/persistence', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    keys: vi.fn(),
    getAllByPrefix: vi.fn(),
  },
  createDataSource: vi.fn(),
}))

vi.mock('@/lib/axios', () => ({
  getApiClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
  getErrorMessage: vi.fn(),
}))

describe('exportLocalDataAsJSON', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports all storage data as JSON', async () => {
    vi.mocked(storage.keys).mockResolvedValueOnce(['user:1', 'project:1'])
    vi.mocked(storage.get)
      .mockResolvedValueOnce({ id: '1', name: 'User' })
      .mockResolvedValueOnce({ id: '1', title: 'Project' })

    const json = await exportLocalDataAsJSON()
    const parsed = JSON.parse(json)

    expect(parsed.version).toBe('1.0')
    expect(parsed.exportDate).toBeTruthy()
    expect(parsed.data['user:1']).toEqual({ id: '1', name: 'User' })
    expect(parsed.data['project:1']).toEqual({ id: '1', title: 'Project' })
  })

  it('skips null values', async () => {
    vi.mocked(storage.keys).mockResolvedValueOnce(['key1', 'key2'])
    vi.mocked(storage.get).mockResolvedValueOnce('value').mockResolvedValueOnce(null)

    const json = await exportLocalDataAsJSON()
    const parsed = JSON.parse(json)

    expect(parsed.data['key1']).toBe('value')
    expect(parsed.data['key2']).toBeUndefined()
  })

  it('returns valid JSON for empty storage', async () => {
    vi.mocked(storage.keys).mockResolvedValueOnce([])

    const json = await exportLocalDataAsJSON()
    const parsed = JSON.parse(json)

    expect(parsed.data).toEqual({})
  })

  it('throws on storage error', async () => {
    vi.mocked(storage.keys).mockRejectedValueOnce(new Error('Storage error'))

    await expect(exportLocalDataAsJSON()).rejects.toThrow('Storage error')
  })
})

describe('clearLocalDataAfterMigration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clears storage and removes auth_token', async () => {
    await clearLocalDataAfterMigration()

    expect(storage.clear).toHaveBeenCalledOnce()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('throws on storage error', async () => {
    vi.mocked(storage.clear).mockRejectedValueOnce(new Error('Clear failed'))

    await expect(clearLocalDataAfterMigration()).rejects.toThrow('Clear failed')
  })
})
