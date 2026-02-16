import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalDataSource } from '../src/localDataSource'
import type { ExtendedStorageAdapter, LocalDataSourceConfig, ModelMap } from '../src/types'

// Test model types
interface TestUser {
  id: string
  email: string
  name: string
  team_id: string | null
}

interface TestTeam {
  id: string
  name: string
  status: string
  created_at?: string
  updated_at?: string
}

interface TestProject {
  id: string
  user_id: string
  team_id: string | null
  title: string
  status: string
  current_step: string
  responses: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface TestNotification {
  id: string
  title: string
  read_at: string | null
  created_at: string
}

interface TestModelMap extends ModelMap {
  User: TestUser
  Team: TestTeam
  Project: TestProject
  Notification: TestNotification
}

function createMockStorage(): ExtendedStorageAdapter & {
  get: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  remove: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
  keys: ReturnType<typeof vi.fn>
  getAllByPrefix: ReturnType<typeof vi.fn>
} {
  return {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    getAllByPrefix: vi.fn(),
  }
}

function createTestConfig(
  storage: ExtendedStorageAdapter
): LocalDataSourceConfig<TestModelMap> {
  return {
    storage,

    async validateCredentials(email, password, store) {
      if (password !== 'password') return null

      const keys = await store.keys()
      for (const key of keys) {
        if (key.startsWith('user:')) {
          const user = await store.get<TestUser>(key)
          if (user && user.email === email) return user
        }
      }
      return null
    },

    createUser(data) {
      const userId = `user-test-${Math.random().toString(36).substring(7)}`
      const suffix = Math.random().toString(36).substring(7)
      const email = `${data.first_name.toLowerCase()}.${data.last_name.toLowerCase()}.${suffix}@example.com`
      return {
        id: userId,
        email,
        name: `${data.first_name} ${data.last_name}`,
        team_id: null,
      }
    },

    createProject(data, user) {
      return {
        id: `project-${Math.random().toString(36).substring(7)}`,
        user_id: user.id,
        team_id: user.team_id,
        title: data.title || 'Untitled Story',
        status: 'draft',
        current_step: 'intro',
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },

    createTeam(data) {
      return {
        id: `team-${Date.now()}`,
        name: data.name,
        status: data.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },

    mergeResponses(project, step, responses) {
      return {
        ...project,
        responses: { ...project.responses, [step]: responses },
        current_step: step,
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      }
    },

    markCompleted() {
      return { status: 'completed', current_step: 'complete' } as Partial<TestProject>
    },
  }
}

describe('LocalDataSource', () => {
  let dataSource: LocalDataSource<TestModelMap>
  let mockStorage: ReturnType<typeof createMockStorage>

  beforeEach(() => {
    mockStorage = createMockStorage()
    const config = createTestConfig(mockStorage)
    dataSource = new LocalDataSource<TestModelMap>(config)
    vi.resetAllMocks()
    // Re-establish default for keys() after resetAllMocks
    mockStorage.keys.mockResolvedValue([])
  })

  describe('Authentication Methods', () => {
    describe('login', () => {
      it('successfully logs in with valid credentials', async () => {
        const mockUser: TestUser = {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          team_id: null,
        }

        mockStorage.keys.mockResolvedValueOnce(['user:1'])
        mockStorage.get.mockResolvedValueOnce(mockUser)

        const result = await dataSource.login('demo@example.com', 'password')

        expect(result.user).toEqual(mockUser)
        expect(result.token).toBeDefined()
        expect(typeof result.token).toBe('string')
      })

      it('throws error with invalid credentials', async () => {
        mockStorage.keys.mockResolvedValueOnce([])

        await expect(dataSource.login('invalid@example.com', 'wrong')).rejects.toThrow()
      })

      it('throws error with wrong password', async () => {
        await expect(
          dataSource.login('demo@example.com', 'wrongpassword')
        ).rejects.toThrow('Invalid credentials')
      })
    })

    describe('register', () => {
      it('successfully registers new user', async () => {
        const result = await dataSource.register({
          first_name: 'Jane',
          last_name: 'Doe',
        })

        expect(result.user.name).toBe('Jane Doe')
        expect(result.user.email).toContain('jane.doe.')
        expect(result.user.email).toContain('@example.com')
        expect(result.token).toBeDefined()
        expect(mockStorage.set).toHaveBeenCalled()
      })
    })

    describe('logout', () => {
      it('resolves successfully', async () => {
        await expect(dataSource.logout()).resolves.toBeUndefined()
      })
    })

    describe('getUser', () => {
      it('returns user when exists', async () => {
        const mockUser: TestUser = {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          team_id: null,
        }

        mockStorage.get.mockResolvedValueOnce(mockUser)

        const user = await dataSource.getUser()

        expect(user).toEqual(mockUser)
        expect(mockStorage.get).toHaveBeenCalledWith('auth:user')
      })

      it('returns null when user does not exist', async () => {
        mockStorage.get.mockResolvedValueOnce(null)

        const user = await dataSource.getUser()

        expect(user).toBeNull()
      })

      it('returns null on error', async () => {
        mockStorage.get.mockRejectedValueOnce(new Error('Storage error'))

        const user = await dataSource.getUser()

        expect(user).toBeNull()
      })
    })

    describe('updateUser', () => {
      it('successfully updates user', async () => {
        const currentUser: TestUser = {
          id: '1',
          email: 'old@example.com',
          name: 'Old Name',
          team_id: null,
        }

        mockStorage.get.mockResolvedValueOnce(currentUser)

        const updated = await dataSource.updateUser({
          name: 'New Name',
          email: 'new@example.com',
        })

        expect(updated.name).toBe('New Name')
        expect(updated.email).toBe('new@example.com')
        expect(mockStorage.set).toHaveBeenCalledWith('auth:user', expect.any(Object))
        expect(mockStorage.set).toHaveBeenCalledWith('user:1', expect.any(Object))
      })

      it('throws error when no user logged in', async () => {
        mockStorage.get.mockResolvedValueOnce(null)

        await expect(dataSource.updateUser({ name: 'New Name' })).rejects.toThrow(
          'No user logged in'
        )
      })
    })
  })

  describe('Project Methods', () => {
    describe('getProjects', () => {
      it('returns all projects', async () => {
        const mockProjects: Record<string, TestProject> = {
          'project:1': {
            id: '1',
            user_id: '1',
            team_id: null,
            title: 'Project 1',
            status: 'draft',
            current_step: 'intro',
            responses: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }

        mockStorage.getAllByPrefix.mockResolvedValueOnce(mockProjects)

        const projects = await dataSource.getProjects()

        expect(projects).toHaveLength(1)
        expect(projects[0]!.title).toBe('Project 1')
      })

      it('returns empty array on error', async () => {
        mockStorage.getAllByPrefix.mockRejectedValueOnce(new Error('Storage error'))

        const projects = await dataSource.getProjects()

        expect(projects).toEqual([])
      })
    })

    describe('getProject', () => {
      it('returns project when exists', async () => {
        const mockProject: TestProject = {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'Test Project',
          status: 'draft',
          current_step: 'intro',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockStorage.get.mockResolvedValueOnce(mockProject)

        const project = await dataSource.getProject('1')

        expect(project).toEqual(mockProject)
        expect(mockStorage.get).toHaveBeenCalledWith('project:1')
      })

      it('returns null when project does not exist', async () => {
        mockStorage.get.mockResolvedValueOnce(null)

        const project = await dataSource.getProject('999')

        expect(project).toBeNull()
      })
    })

    describe('createProject', () => {
      it('successfully creates project', async () => {
        const mockUser: TestUser = {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          team_id: '1',
        }

        mockStorage.get.mockResolvedValueOnce(mockUser)

        const project = await dataSource.createProject({ title: 'New Project' })

        expect(project.title).toBe('New Project')
        expect(project.user_id).toBe('1')
        expect(project.team_id).toBe('1')
        expect(project.status).toBe('draft')
        expect(mockStorage.set).toHaveBeenCalled()
      })

      it('throws error when not authenticated', async () => {
        mockStorage.get.mockResolvedValueOnce(null)

        await expect(dataSource.createProject({ title: 'New Project' })).rejects.toThrow(
          'Not authenticated'
        )
      })
    })

    describe('updateProject', () => {
      it('successfully updates project', async () => {
        const mockProject: TestProject = {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'Old Title',
          status: 'draft',
          current_step: 'intro',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockStorage.get.mockResolvedValueOnce(mockProject)

        const updated = await dataSource.updateProject('1', { title: 'New Title' })

        expect(updated.title).toBe('New Title')
        expect(mockStorage.set).toHaveBeenCalledWith('project:1', expect.any(Object))
      })

      it('throws error when project not found', async () => {
        mockStorage.get.mockResolvedValueOnce(null)

        await expect(
          dataSource.updateProject('999', { title: 'New Title' })
        ).rejects.toThrow('Project not found')
      })
    })

    describe('deleteProject', () => {
      it('successfully deletes project', async () => {
        await dataSource.deleteProject('1')

        expect(mockStorage.remove).toHaveBeenCalledWith('project:1')
      })
    })

    describe('saveResponses', () => {
      it('successfully saves responses', async () => {
        const mockProject: TestProject = {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'Test Project',
          status: 'draft',
          current_step: 'intro',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockStorage.get.mockResolvedValueOnce(mockProject)

        const updated = await dataSource.saveResponses('1', 'section_a', { answer: 'test' })

        expect(updated.responses).toHaveProperty('section_a')
        expect(updated.status).toBe('in_progress')
        expect(updated.current_step).toBe('section_a')
      })

      it('throws error when project not found', async () => {
        mockStorage.get.mockResolvedValueOnce(null)

        await expect(
          dataSource.saveResponses('999', 'section_a', { answer: 'test' })
        ).rejects.toThrow('Project not found')
      })
    })

    describe('completeProject', () => {
      it('successfully completes project', async () => {
        const mockProject: TestProject = {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'Test Project',
          status: 'in_progress',
          current_step: 'section_c',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // First get for markCompleted, second get for updateProject
        mockStorage.get.mockResolvedValueOnce(mockProject)
        mockStorage.get.mockResolvedValueOnce(mockProject)

        const updated = await dataSource.completeProject('1')

        expect(updated.status).toBe('completed')
        expect(updated.current_step).toBe('complete')
      })
    })
  })

  describe('Team Methods', () => {
    describe('getTeams', () => {
      it('returns all teams', async () => {
        const mockTeams: Record<string, TestTeam> = {
          'team:1': {
            id: '1',
            name: 'Team 1',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }

        mockStorage.getAllByPrefix.mockResolvedValueOnce(mockTeams)

        const teams = await dataSource.getTeams()

        expect(teams).toHaveLength(1)
        expect(teams[0]!.name).toBe('Team 1')
      })

      it('returns empty array on error', async () => {
        mockStorage.getAllByPrefix.mockRejectedValueOnce(new Error('Storage error'))

        const teams = await dataSource.getTeams()

        expect(teams).toEqual([])
      })
    })

    describe('getTeam', () => {
      it('returns team when exists', async () => {
        const mockTeam: TestTeam = {
          id: '1',
          name: 'Test Team',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockStorage.get.mockResolvedValueOnce(mockTeam)

        const team = await dataSource.getTeam('1')

        expect(team).toEqual(mockTeam)
        expect(mockStorage.get).toHaveBeenCalledWith('team:1')
      })

      it('returns null when team does not exist', async () => {
        mockStorage.get.mockResolvedValueOnce(null)

        const team = await dataSource.getTeam('999')

        expect(team).toBeNull()
      })
    })

    describe('createTeam', () => {
      it('successfully creates team', async () => {
        const team = await dataSource.createTeam({
          name: 'New Team',
          status: 'active',
        })

        expect(team.name).toBe('New Team')
        expect(team.status).toBe('active')
        expect(mockStorage.set).toHaveBeenCalled()
      })

      it('defaults to active status', async () => {
        const team = await dataSource.createTeam({
          name: 'New Team',
        })

        expect(team.status).toBe('active')
      })
    })

    describe('updateTeam', () => {
      it('successfully updates team', async () => {
        const mockTeam: TestTeam = {
          id: '1',
          name: 'Old Name',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockStorage.get.mockResolvedValueOnce(mockTeam)

        const updated = await dataSource.updateTeam('1', { name: 'New Name' })

        expect(updated.name).toBe('New Name')
        expect(mockStorage.set).toHaveBeenCalledWith('team:1', expect.any(Object))
      })

      it('throws error when team not found', async () => {
        mockStorage.get.mockResolvedValueOnce(null)

        await expect(
          dataSource.updateTeam('999', { name: 'New Name' })
        ).rejects.toThrow('Team not found')
      })
    })
  })
})
