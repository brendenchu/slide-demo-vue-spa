import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalDataSource } from '@/stores/persistence/localDataSource'
import { storage } from '@/stores/persistence/storage'
import type { User, Project, Team } from '@/types/models'

// Mock the storage module
vi.mock('@/stores/persistence/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    getAllByPrefix: vi.fn(),
  },
}))

describe('LocalDataSource', () => {
  let dataSource: LocalDataSource

  beforeEach(() => {
    dataSource = new LocalDataSource()
    vi.resetAllMocks()
  })

  describe('Authentication Methods', () => {
    describe('login', () => {
      it('successfully logs in with valid credentials', async () => {
        const mockUser: User = {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          team_id: null,
        }

        vi.mocked(storage.get).mockResolvedValueOnce(mockUser)

        const result = await dataSource.login('demo@example.com', 'password')

        expect(result.user).toEqual(mockUser)
        expect(result.token).toBeDefined()
        expect(typeof result.token).toBe('string')
      })

      it('throws error with invalid credentials', async () => {
        vi.mocked(storage.get).mockResolvedValueOnce(null)

        await expect(dataSource.login('invalid@example.com', 'wrong')).rejects.toThrow()
      })

      it('throws error with wrong password', async () => {
        const mockUser: User = {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          team_id: null,
        }

        vi.mocked(storage.get).mockResolvedValueOnce(mockUser)

        await expect(dataSource.login('demo@example.com', 'wrongpassword')).rejects.toThrow(
          'Invalid credentials'
        )
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
        expect(storage.set).toHaveBeenCalled()
      })
    })

    describe('logout', () => {
      it('resolves successfully', async () => {
        await expect(dataSource.logout()).resolves.toBeUndefined()
      })
    })

    describe('getUser', () => {
      it('returns user when exists', async () => {
        const mockUser: User = {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          team_id: null,
        }

        vi.mocked(storage.get).mockResolvedValueOnce(mockUser)

        const user = await dataSource.getUser()

        expect(user).toEqual(mockUser)
        expect(storage.get).toHaveBeenCalledWith('auth:user')
      })

      it('returns null when user does not exist', async () => {
        vi.mocked(storage.get).mockResolvedValueOnce(null)

        const user = await dataSource.getUser()

        expect(user).toBeNull()
      })

      it('returns null on error', async () => {
        vi.mocked(storage.get).mockRejectedValueOnce(new Error('Storage error'))

        const user = await dataSource.getUser()

        expect(user).toBeNull()
      })
    })

    describe('updateUser', () => {
      it('successfully updates user', async () => {
        const currentUser: User = {
          id: '1',
          email: 'old@example.com',
          name: 'Old Name',
          team_id: null,
        }

        vi.mocked(storage.get).mockResolvedValueOnce(currentUser)

        const updated = await dataSource.updateUser({
          name: 'New Name',
          email: 'new@example.com',
        })

        expect(updated.name).toBe('New Name')
        expect(updated.email).toBe('new@example.com')
        expect(storage.set).toHaveBeenCalledWith('auth:user', expect.any(Object))
        expect(storage.set).toHaveBeenCalledWith('user:1', expect.any(Object))
      })

      it('throws error when no user logged in', async () => {
        vi.mocked(storage.get).mockResolvedValueOnce(null)

        await expect(dataSource.updateUser({ name: 'New Name' })).rejects.toThrow(
          'No user logged in'
        )
      })
    })
  })

  describe('Project Methods', () => {
    describe('getProjects', () => {
      it('returns all projects', async () => {
        const mockProjects: Record<string, Project> = {
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

        vi.mocked(storage.getAllByPrefix).mockResolvedValueOnce(mockProjects)

        const projects = await dataSource.getProjects()

        expect(projects).toHaveLength(1)
        expect(projects[0]!.title).toBe('Project 1')
      })

      it('returns empty array on error', async () => {
        vi.mocked(storage.getAllByPrefix).mockRejectedValueOnce(new Error('Storage error'))

        const projects = await dataSource.getProjects()

        expect(projects).toEqual([])
      })
    })

    describe('getProject', () => {
      it('returns project when exists', async () => {
        const mockProject: Project = {
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

        vi.mocked(storage.get).mockResolvedValueOnce(mockProject)

        const project = await dataSource.getProject('1')

        expect(project).toEqual(mockProject)
        expect(storage.get).toHaveBeenCalledWith('project:1')
      })

      it('returns null when project does not exist', async () => {
        vi.mocked(storage.get).mockResolvedValueOnce(null)

        const project = await dataSource.getProject('999')

        expect(project).toBeNull()
      })
    })

    describe('createProject', () => {
      it('successfully creates project', async () => {
        const mockUser: User = {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          team_id: '1',
        }

        vi.mocked(storage.get).mockResolvedValueOnce(mockUser)

        const project = await dataSource.createProject({ title: 'New Project' })

        expect(project.title).toBe('New Project')
        expect(project.user_id).toBe('1')
        expect(project.team_id).toBe('1')
        expect(project.status).toBe('draft')
        expect(storage.set).toHaveBeenCalled()
      })

      it('throws error when not authenticated', async () => {
        vi.mocked(storage.get).mockResolvedValueOnce(null)

        await expect(dataSource.createProject({ title: 'New Project' })).rejects.toThrow(
          'Not authenticated'
        )
      })
    })

    describe('updateProject', () => {
      it('successfully updates project', async () => {
        const mockProject: Project = {
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

        vi.mocked(storage.get).mockResolvedValueOnce(mockProject)

        const updated = await dataSource.updateProject('1', { title: 'New Title' })

        expect(updated.title).toBe('New Title')
        expect(storage.set).toHaveBeenCalledWith('project:1', expect.any(Object))
      })

      it('throws error when project not found', async () => {
        vi.mocked(storage.get).mockResolvedValueOnce(null)

        await expect(dataSource.updateProject('999', { title: 'New Title' })).rejects.toThrow(
          'Project not found'
        )
      })
    })

    describe('deleteProject', () => {
      it('successfully deletes project', async () => {
        await dataSource.deleteProject('1')

        expect(storage.remove).toHaveBeenCalledWith('project:1')
      })
    })

    describe('saveResponses', () => {
      it('successfully saves responses', async () => {
        const mockProject: Project = {
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

        vi.mocked(storage.get).mockResolvedValueOnce(mockProject)

        const updated = await dataSource.saveResponses('1', 'section_a', { answer: 'test' })

        expect(updated.responses).toHaveProperty('section_a')
        expect(updated.status).toBe('in_progress')
        expect(updated.current_step).toBe('section_a')
      })

      it('throws error when project not found', async () => {
        vi.mocked(storage.get).mockResolvedValueOnce(null)

        await expect(
          dataSource.saveResponses('999', 'section_a', { answer: 'test' })
        ).rejects.toThrow('Project not found')
      })
    })

    describe('completeProject', () => {
      it('successfully completes project', async () => {
        const mockProject: Project = {
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

        vi.mocked(storage.get).mockResolvedValueOnce(mockProject)

        const updated = await dataSource.completeProject('1')

        expect(updated.status).toBe('completed')
        expect(updated.current_step).toBe('complete')
      })
    })
  })

  describe('Team Methods', () => {
    describe('getTeams', () => {
      it('returns all teams', async () => {
        const mockTeams: Record<string, Team> = {
          'team:1': {
            id: '1',
            name: 'Team 1',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }

        vi.mocked(storage.getAllByPrefix).mockResolvedValueOnce(mockTeams)

        const teams = await dataSource.getTeams()

        expect(teams).toHaveLength(1)
        expect(teams[0]!.name).toBe('Team 1')
      })

      it('returns empty array on error', async () => {
        vi.mocked(storage.getAllByPrefix).mockRejectedValueOnce(new Error('Storage error'))

        const teams = await dataSource.getTeams()

        expect(teams).toEqual([])
      })
    })

    describe('getTeam', () => {
      it('returns team when exists', async () => {
        const mockTeam: Team = {
          id: '1',
          name: 'Test Team',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        vi.mocked(storage.get).mockResolvedValueOnce(mockTeam)

        const team = await dataSource.getTeam('1')

        expect(team).toEqual(mockTeam)
        expect(storage.get).toHaveBeenCalledWith('team:1')
      })

      it('returns null when team does not exist', async () => {
        vi.mocked(storage.get).mockResolvedValueOnce(null)

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
        expect(storage.set).toHaveBeenCalled()
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
        const mockTeam: Team = {
          id: '1',
          name: 'Old Name',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        vi.mocked(storage.get).mockResolvedValueOnce(mockTeam)

        const updated = await dataSource.updateTeam('1', { name: 'New Name' })

        expect(updated.name).toBe('New Name')
        expect(storage.set).toHaveBeenCalledWith('team:1', expect.any(Object))
      })

      it('throws error when team not found', async () => {
        vi.mocked(storage.get).mockResolvedValueOnce(null)

        await expect(dataSource.updateTeam('999', { name: 'New Name' })).rejects.toThrow(
          'Team not found'
        )
      })
    })
  })
})
