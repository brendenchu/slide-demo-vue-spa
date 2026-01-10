import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiDataSource } from '@/stores/persistence/apiDataSource'
import { getApiClient } from '@/lib/axios'
import type { User, Project, Team } from '@/types/models'

// Mock the axios module
vi.mock('@/lib/axios', () => ({
  getApiClient: vi.fn(),
  getErrorMessage: vi.fn((error) => error?.message || 'Unknown error'),
}))

describe('ApiDataSource', () => {
  let dataSource: ApiDataSource
  let mockApi: {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }

    vi.mocked(getApiClient).mockReturnValue(mockApi as any)
    dataSource = new ApiDataSource()
    vi.clearAllMocks()
  })

  describe('Authentication Methods', () => {
    describe('login', () => {
      it('successfully logs in with valid credentials', async () => {
        const mockUser: User = {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['client'],
          permissions: ['view-project'],
          team_id: null,
          email_verified_at: new Date().toISOString(),
        }
        const mockToken = 'test-token-123'

        mockApi.post.mockResolvedValueOnce({
          data: {
            data: {
              user: mockUser,
              token: mockToken,
            },
          },
        })

        const result = await dataSource.login('test@example.com', 'password')

        expect(result.user).toEqual(mockUser)
        expect(result.token).toBe(mockToken)
        expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password',
        })
      })

      it('throws error on API failure', async () => {
        mockApi.post.mockRejectedValueOnce(new Error('Invalid credentials'))

        await expect(dataSource.login('wrong@example.com', 'wrongpass')).rejects.toThrow()
      })
    })

    describe('register', () => {
      it('successfully registers new user', async () => {
        const mockUser: User = {
          id: '1',
          email: 'new@example.com',
          name: 'New User',
          roles: ['client'],
          permissions: ['view-project'],
          team_id: null,
          email_verified_at: null,
        }
        const mockToken = 'new-token-123'

        mockApi.post.mockResolvedValueOnce({
          data: {
            data: {
              user: mockUser,
              token: mockToken,
            },
          },
        })

        const result = await dataSource.register({
          email: 'new@example.com',
          name: 'New User',
          password: 'password',
          password_confirmation: 'password',
        })

        expect(result.user).toEqual(mockUser)
        expect(result.token).toBe(mockToken)
        expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
          email: 'new@example.com',
          name: 'New User',
          password: 'password',
          password_confirmation: 'password',
        })
      })

      it('throws error when email already exists', async () => {
        mockApi.post.mockRejectedValueOnce(new Error('Email already registered'))

        await expect(
          dataSource.register({
            email: 'existing@example.com',
            name: 'User',
            password: 'password',
            password_confirmation: 'password',
          })
        ).rejects.toThrow()
      })
    })

    describe('logout', () => {
      it('successfully logs out', async () => {
        mockApi.post.mockResolvedValueOnce({ data: { success: true } })

        await expect(dataSource.logout()).resolves.toBeUndefined()
        expect(mockApi.post).toHaveBeenCalledWith('/auth/logout')
      })

      it('does not throw on API failure', async () => {
        mockApi.post.mockRejectedValueOnce(new Error('Network error'))

        // Should not throw - logout continues even if API call fails
        await expect(dataSource.logout()).resolves.toBeUndefined()
      })
    })

    describe('getUser', () => {
      it('returns user when API call succeeds', async () => {
        const mockUser: User = {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['client'],
          permissions: ['view-project'],
          team_id: null,
          email_verified_at: new Date().toISOString(),
        }

        mockApi.get.mockResolvedValueOnce({
          data: { data: mockUser },
        })

        const user = await dataSource.getUser()

        expect(user).toEqual(mockUser)
        expect(mockApi.get).toHaveBeenCalledWith('/auth/user')
      })

      it('returns null on API failure', async () => {
        mockApi.get.mockRejectedValueOnce(new Error('Unauthorized'))

        const user = await dataSource.getUser()

        expect(user).toBeNull()
      })
    })

    describe('updateUser', () => {
      it('successfully updates user', async () => {
        const updatedUser: User = {
          id: '1',
          email: 'updated@example.com',
          name: 'Updated Name',
          roles: ['client'],
          permissions: ['view-project'],
          team_id: null,
          email_verified_at: new Date().toISOString(),
        }

        mockApi.put.mockResolvedValueOnce({
          data: { data: updatedUser },
        })

        const result = await dataSource.updateUser({
          name: 'Updated Name',
          email: 'updated@example.com',
        })

        expect(result).toEqual(updatedUser)
        expect(mockApi.put).toHaveBeenCalledWith('/auth/user', {
          name: 'Updated Name',
          email: 'updated@example.com',
        })
      })

      it('throws error on API failure', async () => {
        mockApi.put.mockRejectedValueOnce(new Error('Validation failed'))

        await expect(dataSource.updateUser({ name: 'Invalid' })).rejects.toThrow()
      })
    })
  })

  describe('Project Methods', () => {
    describe('getProjects', () => {
      it('returns all projects', async () => {
        const mockProjects: Project[] = [
          {
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
        ]

        mockApi.get.mockResolvedValueOnce({
          data: { data: mockProjects },
        })

        const projects = await dataSource.getProjects()

        expect(projects).toEqual(mockProjects)
        expect(mockApi.get).toHaveBeenCalledWith('/projects')
      })

      it('throws error on API failure', async () => {
        mockApi.get.mockRejectedValueOnce(new Error('Network error'))

        await expect(dataSource.getProjects()).rejects.toThrow()
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

        mockApi.get.mockResolvedValueOnce({
          data: { data: mockProject },
        })

        const project = await dataSource.getProject('1')

        expect(project).toEqual(mockProject)
        expect(mockApi.get).toHaveBeenCalledWith('/projects/1')
      })

      it('returns null when project not found (404)', async () => {
        mockApi.get.mockRejectedValueOnce({
          response: { status: 404 },
        })

        const project = await dataSource.getProject('999')

        expect(project).toBeNull()
      })

      it('throws error on other API failures', async () => {
        mockApi.get.mockRejectedValueOnce({
          response: { status: 500 },
        })

        await expect(dataSource.getProject('1')).rejects.toThrow()
      })
    })

    describe('createProject', () => {
      it('successfully creates project', async () => {
        const mockProject: Project = {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'New Project',
          status: 'draft',
          current_step: 'intro',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockApi.post.mockResolvedValueOnce({
          data: { data: mockProject },
        })

        const project = await dataSource.createProject({ title: 'New Project' })

        expect(project).toEqual(mockProject)
        expect(mockApi.post).toHaveBeenCalledWith('/projects', { title: 'New Project' })
      })

      it('throws error on API failure', async () => {
        mockApi.post.mockRejectedValueOnce(new Error('Unauthorized'))

        await expect(dataSource.createProject({ title: 'Test' })).rejects.toThrow()
      })
    })

    describe('updateProject', () => {
      it('successfully updates project', async () => {
        const updatedProject: Project = {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'Updated Title',
          status: 'in_progress',
          current_step: 'section_a',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockApi.put.mockResolvedValueOnce({
          data: { data: updatedProject },
        })

        const project = await dataSource.updateProject('1', { title: 'Updated Title' })

        expect(project).toEqual(updatedProject)
        expect(mockApi.put).toHaveBeenCalledWith('/projects/1', { title: 'Updated Title' })
      })

      it('throws error on API failure', async () => {
        mockApi.put.mockRejectedValueOnce(new Error('Unauthorized'))

        await expect(dataSource.updateProject('1', { title: 'Test' })).rejects.toThrow()
      })
    })

    describe('deleteProject', () => {
      it('successfully deletes project', async () => {
        mockApi.delete.mockResolvedValueOnce({ data: { success: true } })

        await expect(dataSource.deleteProject('1')).resolves.toBeUndefined()
        expect(mockApi.delete).toHaveBeenCalledWith('/projects/1')
      })

      it('throws error on API failure', async () => {
        mockApi.delete.mockRejectedValueOnce(new Error('Unauthorized'))

        await expect(dataSource.deleteProject('1')).rejects.toThrow()
      })
    })

    describe('saveResponses', () => {
      it('successfully saves responses', async () => {
        const updatedProject: Project = {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'Test Project',
          status: 'in_progress',
          current_step: 'section_a',
          responses: { section_a: { answer: 'test' } },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockApi.post.mockResolvedValueOnce({
          data: { data: updatedProject },
        })

        const project = await dataSource.saveResponses('1', 'section_a', { answer: 'test' })

        expect(project).toEqual(updatedProject)
        expect(mockApi.post).toHaveBeenCalledWith('/projects/1/responses', {
          step: 'section_a',
          responses: { answer: 'test' },
        })
      })

      it('throws error on API failure', async () => {
        mockApi.post.mockRejectedValueOnce(new Error('Validation failed'))

        await expect(
          dataSource.saveResponses('1', 'section_a', { answer: 'test' })
        ).rejects.toThrow()
      })
    })

    describe('completeProject', () => {
      it('successfully completes project', async () => {
        const completedProject: Project = {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'Test Project',
          status: 'completed',
          current_step: 'complete',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockApi.post.mockResolvedValueOnce({
          data: { data: completedProject },
        })

        const project = await dataSource.completeProject('1')

        expect(project).toEqual(completedProject)
        expect(mockApi.post).toHaveBeenCalledWith('/projects/1/complete')
      })

      it('throws error on API failure', async () => {
        mockApi.post.mockRejectedValueOnce(new Error('Unauthorized'))

        await expect(dataSource.completeProject('1')).rejects.toThrow()
      })
    })
  })

  describe('User Management Methods (Admin)', () => {
    describe('getUsers', () => {
      it('returns all users', async () => {
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'user1@example.com',
            name: 'User 1',
            roles: ['client'],
            permissions: ['view-project'],
            team_id: null,
            email_verified_at: null,
          },
        ]

        mockApi.get.mockResolvedValueOnce({
          data: { data: mockUsers },
        })

        const users = await dataSource.getUsers()

        expect(users).toEqual(mockUsers)
        expect(mockApi.get).toHaveBeenCalledWith('/admin/users')
      })

      it('throws error on API failure', async () => {
        mockApi.get.mockRejectedValueOnce(new Error('Forbidden'))

        await expect(dataSource.getUsers()).rejects.toThrow()
      })
    })

    describe('getUserById', () => {
      it('returns user when exists', async () => {
        const mockUser: User = {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['client'],
          permissions: ['view-project'],
          team_id: null,
          email_verified_at: null,
        }

        mockApi.get.mockResolvedValueOnce({
          data: { data: mockUser },
        })

        const user = await dataSource.getUserById('1')

        expect(user).toEqual(mockUser)
        expect(mockApi.get).toHaveBeenCalledWith('/admin/users/1')
      })

      it('returns null when user not found (404)', async () => {
        mockApi.get.mockRejectedValueOnce({
          response: { status: 404 },
        })

        const user = await dataSource.getUserById('999')

        expect(user).toBeNull()
      })

      it('throws error on other API failures', async () => {
        mockApi.get.mockRejectedValueOnce({
          response: { status: 403 },
        })

        await expect(dataSource.getUserById('1')).rejects.toThrow()
      })
    })

    describe('createUser', () => {
      it('successfully creates user', async () => {
        const mockUser: User = {
          id: '1',
          email: 'new@example.com',
          name: 'New User',
          roles: ['client'],
          permissions: ['view-project'],
          team_id: null,
          email_verified_at: null,
        }

        mockApi.post.mockResolvedValueOnce({
          data: { data: mockUser },
        })

        const user = await dataSource.createUser({
          email: 'new@example.com',
          name: 'New User',
          password: 'password',
        })

        expect(user).toEqual(mockUser)
        expect(mockApi.post).toHaveBeenCalledWith('/admin/users', {
          email: 'new@example.com',
          name: 'New User',
          password: 'password',
        })
      })

      it('throws error on API failure', async () => {
        mockApi.post.mockRejectedValueOnce(new Error('Email already exists'))

        await expect(
          dataSource.createUser({
            email: 'existing@example.com',
            name: 'User',
            password: 'password',
          })
        ).rejects.toThrow()
      })
    })

    describe('updateUserById', () => {
      it('successfully updates user', async () => {
        const updatedUser: User = {
          id: '1',
          email: 'updated@example.com',
          name: 'Updated Name',
          roles: ['client'],
          permissions: ['view-project'],
          team_id: null,
          email_verified_at: null,
        }

        mockApi.put.mockResolvedValueOnce({
          data: { data: updatedUser },
        })

        const user = await dataSource.updateUserById('1', { name: 'Updated Name' })

        expect(user).toEqual(updatedUser)
        expect(mockApi.put).toHaveBeenCalledWith('/admin/users/1', { name: 'Updated Name' })
      })

      it('throws error on API failure', async () => {
        mockApi.put.mockRejectedValueOnce(new Error('Unauthorized'))

        await expect(dataSource.updateUserById('1', { name: 'Test' })).rejects.toThrow()
      })
    })

    describe('deleteUser', () => {
      it('successfully deletes user', async () => {
        mockApi.delete.mockResolvedValueOnce({ data: { success: true } })

        await expect(dataSource.deleteUser('1')).resolves.toBeUndefined()
        expect(mockApi.delete).toHaveBeenCalledWith('/admin/users/1')
      })

      it('throws error on API failure', async () => {
        mockApi.delete.mockRejectedValueOnce(new Error('Forbidden'))

        await expect(dataSource.deleteUser('1')).rejects.toThrow()
      })
    })
  })

  describe('Team Methods', () => {
    describe('getTeams', () => {
      it('returns all teams', async () => {
        const mockTeams: Team[] = [
          {
            id: '1',
            name: 'Team 1',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

        mockApi.get.mockResolvedValueOnce({
          data: { data: mockTeams },
        })

        const teams = await dataSource.getTeams()

        expect(teams).toEqual(mockTeams)
        expect(mockApi.get).toHaveBeenCalledWith('/teams')
      })

      it('throws error on API failure', async () => {
        mockApi.get.mockRejectedValueOnce(new Error('Network error'))

        await expect(dataSource.getTeams()).rejects.toThrow()
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

        mockApi.get.mockResolvedValueOnce({
          data: { data: mockTeam },
        })

        const team = await dataSource.getTeam('1')

        expect(team).toEqual(mockTeam)
        expect(mockApi.get).toHaveBeenCalledWith('/teams/1')
      })

      it('returns null when team not found (404)', async () => {
        mockApi.get.mockRejectedValueOnce({
          response: { status: 404 },
        })

        const team = await dataSource.getTeam('999')

        expect(team).toBeNull()
      })

      it('throws error on other API failures', async () => {
        mockApi.get.mockRejectedValueOnce({
          response: { status: 500 },
        })

        await expect(dataSource.getTeam('1')).rejects.toThrow()
      })
    })

    describe('createTeam', () => {
      it('successfully creates team', async () => {
        const mockTeam: Team = {
          id: '1',
          name: 'New Team',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockApi.post.mockResolvedValueOnce({
          data: { data: mockTeam },
        })

        const team = await dataSource.createTeam({ name: 'New Team', status: 'active' })

        expect(team).toEqual(mockTeam)
        expect(mockApi.post).toHaveBeenCalledWith('/teams', { name: 'New Team', status: 'active' })
      })

      it('throws error on API failure', async () => {
        mockApi.post.mockRejectedValueOnce(new Error('Validation failed'))

        await expect(dataSource.createTeam({ name: 'Test' })).rejects.toThrow()
      })
    })

    describe('updateTeam', () => {
      it('successfully updates team', async () => {
        const updatedTeam: Team = {
          id: '1',
          name: 'Updated Team',
          status: 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockApi.put.mockResolvedValueOnce({
          data: { data: updatedTeam },
        })

        const team = await dataSource.updateTeam('1', { name: 'Updated Team', status: 'inactive' })

        expect(team).toEqual(updatedTeam)
        expect(mockApi.put).toHaveBeenCalledWith('/teams/1', {
          name: 'Updated Team',
          status: 'inactive',
        })
      })

      it('throws error on API failure', async () => {
        mockApi.put.mockRejectedValueOnce(new Error('Unauthorized'))

        await expect(dataSource.updateTeam('1', { name: 'Test' })).rejects.toThrow()
      })
    })
  })
})
