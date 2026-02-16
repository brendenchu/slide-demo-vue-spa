import { describe, it, expect, beforeEach, vi } from 'vitest'
import { seedDemoData, clearAllData, checkIfSeeded } from '@/stores/persistence/seed'
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

describe('seedDemoData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('seeds a demo user', async () => {
    await seedDemoData()

    expect(storage.set).toHaveBeenCalledWith(
      'user:1',
      expect.objectContaining({
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        team_id: '1',
      })
    )
  })

  it('seeds a demo team', async () => {
    await seedDemoData()

    expect(storage.set).toHaveBeenCalledWith(
      'team:1',
      expect.objectContaining({
        id: '1',
        name: 'Acme Corporation',
        status: 'active',
      })
    )
  })

  it('seeds an in-progress project', async () => {
    await seedDemoData()

    expect(storage.set).toHaveBeenCalledWith(
      'project:demo-project-1',
      expect.objectContaining({
        id: 'demo-project-1',
        status: 'in_progress',
        current_step: 'section_a',
      })
    )
  })

  it('seeds a completed project', async () => {
    await seedDemoData()

    expect(storage.set).toHaveBeenCalledWith(
      'project:demo-project-2',
      expect.objectContaining({
        id: 'demo-project-2',
        status: 'completed',
        current_step: 'complete',
      })
    )
  })

  it('seeds exactly 4 items (user, team, 2 projects)', async () => {
    await seedDemoData()
    expect(storage.set).toHaveBeenCalledTimes(4)
  })
})

describe('clearAllData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls storage.clear', async () => {
    await clearAllData()
    expect(storage.clear).toHaveBeenCalledOnce()
  })
})

describe('checkIfSeeded', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true when user:1 exists', async () => {
    vi.mocked(storage.get).mockResolvedValueOnce({ id: '1', name: 'Demo User' })

    const result = await checkIfSeeded()
    expect(result).toBe(true)
    expect(storage.get).toHaveBeenCalledWith('user:1')
  })

  it('returns false when user:1 does not exist', async () => {
    vi.mocked(storage.get).mockResolvedValueOnce(null)

    const result = await checkIfSeeded()
    expect(result).toBe(false)
  })
})
