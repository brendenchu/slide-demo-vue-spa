import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import { DataSourceFactory } from '@/stores/persistence/dataSourceFactory'
import type { Project, User } from '@/types/models'

// Mock the data source factory
vi.mock('@/stores/persistence/dataSourceFactory', () => ({
  DataSourceFactory: {
    create: vi.fn(() => ({
      getProjects: vi.fn(),
      getProject: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      saveResponses: vi.fn(),
      completeProject: vi.fn(),
      deleteProject: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
    })),
  },
}))

// Mock storage
vi.mock('@/stores/persistence/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}))

describe('Projects Store Integration', () => {
  let mockDataSource: {
    getProjects: ReturnType<typeof vi.fn>
    getProject: ReturnType<typeof vi.fn>
    createProject: ReturnType<typeof vi.fn>
    updateProject: ReturnType<typeof vi.fn>
    saveResponses: ReturnType<typeof vi.fn>
    completeProject: ReturnType<typeof vi.fn>
    deleteProject: ReturnType<typeof vi.fn>
    login: ReturnType<typeof vi.fn>
  }

  let mockUser: User

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      roles: ['client'],
      permissions: ['view-project', 'create-project', 'update-project'],
      team_id: null,
      email_verified_at: new Date().toISOString(),
    }

    mockDataSource = {
      getProjects: vi.fn(),
      getProject: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      saveResponses: vi.fn(),
      completeProject: vi.fn(),
      deleteProject: vi.fn(),
      login: vi.fn(),
    }

    vi.mocked(DataSourceFactory.create).mockReturnValue(mockDataSource as any)
  })

  describe('fetchAll', () => {
    it('fetches all projects and updates state', async () => {
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
        {
          id: '2',
          user_id: '1',
          team_id: null,
          title: 'Project 2',
          status: 'in_progress',
          current_step: 'section_a',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockDataSource.getProjects.mockResolvedValueOnce(mockProjects)

      const projectsStore = useProjectsStore()

      expect(projectsStore.isLoading).toBe(false)

      const promise = projectsStore.fetchAll()

      expect(projectsStore.isLoading).toBe(true)

      await promise

      expect(projectsStore.projects).toEqual(mockProjects)
      expect(projectsStore.isLoading).toBe(false)
      expect(mockDataSource.getProjects).toHaveBeenCalledOnce()
    })

    it('sets isLoading to false on error', async () => {
      mockDataSource.getProjects.mockRejectedValueOnce(new Error('Network error'))

      const projectsStore = useProjectsStore()

      await expect(projectsStore.fetchAll()).rejects.toThrow('Network error')

      expect(projectsStore.isLoading).toBe(false)
    })
  })

  describe('fetchById', () => {
    it('fetches project and sets as currentProject', async () => {
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

      mockDataSource.getProject.mockResolvedValueOnce(mockProject)

      const projectsStore = useProjectsStore()
      const result = await projectsStore.fetchById('1')

      expect(result).toEqual(mockProject)
      expect(projectsStore.currentProject).toEqual(mockProject)
      expect(mockDataSource.getProject).toHaveBeenCalledWith('1')
    })

    it('returns null and does not set currentProject when project not found', async () => {
      mockDataSource.getProject.mockResolvedValueOnce(null)

      const projectsStore = useProjectsStore()
      const result = await projectsStore.fetchById('999')

      expect(result).toBeNull()
      expect(projectsStore.currentProject).toBeNull()
    })

    it('throws error on fetch failure', async () => {
      mockDataSource.getProject.mockRejectedValueOnce(new Error('Network error'))

      const projectsStore = useProjectsStore()

      await expect(projectsStore.fetchById('1')).rejects.toThrow('Network error')
    })
  })

  describe('create', () => {
    it('creates project and adds to local cache', async () => {
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

      mockDataSource.createProject.mockResolvedValueOnce(mockProject)

      const projectsStore = useProjectsStore()
      const result = await projectsStore.create({ title: 'New Project' })

      expect(result).toEqual(mockProject)
      expect(projectsStore.projects).toHaveLength(1)
      expect(projectsStore.projects[0]).toEqual(mockProject)
      expect(mockDataSource.createProject).toHaveBeenCalledWith({ title: 'New Project' })
    })

    it('uses default title when not provided', async () => {
      const mockProject: Project = {
        id: '1',
        user_id: '1',
        team_id: null,
        title: 'Untitled Story',
        status: 'draft',
        current_step: 'intro',
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataSource.createProject.mockResolvedValueOnce(mockProject)

      const projectsStore = useProjectsStore()
      await projectsStore.create({})

      expect(mockDataSource.createProject).toHaveBeenCalledWith({ title: 'Untitled Story' })
    })

    it('throws error on create failure', async () => {
      mockDataSource.createProject.mockRejectedValueOnce(new Error('Unauthorized'))

      const projectsStore = useProjectsStore()

      await expect(projectsStore.create({ title: 'Test' })).rejects.toThrow('Unauthorized')
      expect(projectsStore.projects).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('updates project in local cache and currentProject', async () => {
      const originalProject: Project = {
        id: '1',
        user_id: '1',
        team_id: null,
        title: 'Original Title',
        status: 'draft',
        current_step: 'intro',
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const updatedProject: Project = {
        ...originalProject,
        title: 'Updated Title',
        updated_at: new Date().toISOString(),
      }

      mockDataSource.getProjects.mockResolvedValueOnce([originalProject])
      mockDataSource.getProject.mockResolvedValueOnce(originalProject)
      mockDataSource.updateProject.mockResolvedValueOnce(updatedProject)

      const projectsStore = useProjectsStore()

      await projectsStore.fetchAll()
      await projectsStore.fetchById('1')

      const result = await projectsStore.update('1', { title: 'Updated Title' })

      expect(result).toEqual(updatedProject)
      expect(projectsStore.projects[0]).toEqual(updatedProject)
      expect(projectsStore.currentProject).toEqual(updatedProject)
      expect(mockDataSource.updateProject).toHaveBeenCalledWith('1', { title: 'Updated Title' })
    })

    it('does not update currentProject if different project is current', async () => {
      const project1: Project = {
        id: '1',
        user_id: '1',
        team_id: null,
        title: 'Project 1',
        status: 'draft',
        current_step: 'intro',
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const project2: Project = {
        id: '2',
        user_id: '1',
        team_id: null,
        title: 'Project 2',
        status: 'draft',
        current_step: 'intro',
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const updatedProject1: Project = {
        ...project1,
        title: 'Updated Project 1',
      }

      mockDataSource.getProjects.mockResolvedValueOnce([project1, project2])
      mockDataSource.getProject.mockResolvedValueOnce(project2)
      mockDataSource.updateProject.mockResolvedValueOnce(updatedProject1)

      const projectsStore = useProjectsStore()

      await projectsStore.fetchAll()
      await projectsStore.fetchById('2')

      await projectsStore.update('1', { title: 'Updated Project 1' })

      expect(projectsStore.currentProject).toEqual(project2)
      expect(projectsStore.projects[0]).toEqual(updatedProject1)
    })

    it('throws error on update failure', async () => {
      mockDataSource.updateProject.mockRejectedValueOnce(new Error('Unauthorized'))

      const projectsStore = useProjectsStore()

      await expect(projectsStore.update('1', { title: 'Test' })).rejects.toThrow('Unauthorized')
    })
  })

  describe('saveResponses', () => {
    it('saves responses and updates local cache', async () => {
      const originalProject: Project = {
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

      const updatedProject: Project = {
        ...originalProject,
        responses: { section_a: { answer: 'test' } },
        current_step: 'section_a',
        status: 'in_progress',
      }

      mockDataSource.getProjects.mockResolvedValueOnce([originalProject])
      mockDataSource.getProject.mockResolvedValueOnce(originalProject)
      mockDataSource.saveResponses.mockResolvedValueOnce(updatedProject)

      const projectsStore = useProjectsStore()

      await projectsStore.fetchAll()
      await projectsStore.fetchById('1')

      const result = await projectsStore.saveResponses('1', 'section_a', { answer: 'test' })

      expect(result).toEqual(updatedProject)
      expect(projectsStore.projects[0]).toEqual(updatedProject)
      expect(projectsStore.currentProject).toEqual(updatedProject)
      expect(mockDataSource.saveResponses).toHaveBeenCalledWith('1', 'section_a', {
        answer: 'test',
      })
    })

    it('throws error on save failure', async () => {
      mockDataSource.saveResponses.mockRejectedValueOnce(new Error('Validation failed'))

      const projectsStore = useProjectsStore()

      await expect(
        projectsStore.saveResponses('1', 'section_a', { answer: 'test' })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('complete', () => {
    it('completes project and updates local cache', async () => {
      const inProgressProject: Project = {
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

      const completedProject: Project = {
        ...inProgressProject,
        status: 'completed',
        current_step: 'complete',
      }

      mockDataSource.getProjects.mockResolvedValueOnce([inProgressProject])
      mockDataSource.getProject.mockResolvedValueOnce(inProgressProject)
      mockDataSource.completeProject.mockResolvedValueOnce(completedProject)

      const projectsStore = useProjectsStore()

      await projectsStore.fetchAll()
      await projectsStore.fetchById('1')

      const result = await projectsStore.complete('1')

      expect(result).toEqual(completedProject)
      expect(projectsStore.projects[0]).toEqual(completedProject)
      expect(projectsStore.currentProject).toEqual(completedProject)
      expect(mockDataSource.completeProject).toHaveBeenCalledWith('1')
    })

    it('throws error on complete failure', async () => {
      mockDataSource.completeProject.mockRejectedValueOnce(new Error('Unauthorized'))

      const projectsStore = useProjectsStore()

      await expect(projectsStore.complete('1')).rejects.toThrow('Unauthorized')
    })
  })

  describe('deleteProject', () => {
    it('deletes project and removes from local cache', async () => {
      const project1: Project = {
        id: '1',
        user_id: '1',
        team_id: null,
        title: 'Project 1',
        status: 'draft',
        current_step: 'intro',
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const project2: Project = {
        id: '2',
        user_id: '1',
        team_id: null,
        title: 'Project 2',
        status: 'draft',
        current_step: 'intro',
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataSource.getProjects.mockResolvedValueOnce([project1, project2])

      const projectsStore = useProjectsStore()

      await projectsStore.fetchAll()
      expect(projectsStore.projects).toHaveLength(2)

      await projectsStore.deleteProject('1')

      expect(projectsStore.projects).toHaveLength(1)
      expect(projectsStore.projects[0]).toEqual(project2)
      expect(mockDataSource.deleteProject).toHaveBeenCalledWith('1')
    })

    it('clears currentProject if deleted project was current', async () => {
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

      mockDataSource.getProject.mockResolvedValueOnce(mockProject)

      const projectsStore = useProjectsStore()

      await projectsStore.fetchById('1')
      expect(projectsStore.currentProject).toEqual(mockProject)

      await projectsStore.deleteProject('1')

      expect(projectsStore.currentProject).toBeNull()
    })

    it('throws error on delete failure', async () => {
      mockDataSource.deleteProject.mockRejectedValueOnce(new Error('Unauthorized'))

      const projectsStore = useProjectsStore()

      await expect(projectsStore.deleteProject('1')).rejects.toThrow('Unauthorized')
    })
  })

  describe('computed getters', () => {
    beforeEach(async () => {
      // Set up auth store with user
      mockDataSource.login.mockResolvedValueOnce({
        user: mockUser,
        token: 'test-token',
      })

      const authStore = useAuthStore()
      await authStore.login('test@example.com', 'password')
    })

    it('userProjects returns all projects from API response', async () => {
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
        {
          id: '2',
          user_id: '1',
          team_id: null,
          title: 'Project 2',
          status: 'in_progress',
          current_step: 'intro',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockDataSource.getProjects.mockResolvedValueOnce(mockProjects)

      const projectsStore = useProjectsStore()
      await projectsStore.fetchAll()

      expect(projectsStore.userProjects).toHaveLength(2)
    })

    it('inProgressProjects filters by in_progress status', async () => {
      const mockProjects: Project[] = [
        {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'Project 1',
          status: 'in_progress',
          current_step: 'section_a',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: '1',
          team_id: null,
          title: 'Project 2',
          status: 'draft',
          current_step: 'intro',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockDataSource.getProjects.mockResolvedValueOnce(mockProjects)

      const projectsStore = useProjectsStore()
      await projectsStore.fetchAll()

      expect(projectsStore.inProgressProjects).toHaveLength(1)
      expect(projectsStore.inProgressProjects[0]!.status).toBe('in_progress')
    })

    it('completedProjects filters by completed status', async () => {
      const mockProjects: Project[] = [
        {
          id: '1',
          user_id: '1',
          team_id: null,
          title: 'Project 1',
          status: 'completed',
          current_step: 'complete',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: '1',
          team_id: null,
          title: 'Project 2',
          status: 'in_progress',
          current_step: 'section_a',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockDataSource.getProjects.mockResolvedValueOnce(mockProjects)

      const projectsStore = useProjectsStore()
      await projectsStore.fetchAll()

      expect(projectsStore.completedProjects).toHaveLength(1)
      expect(projectsStore.completedProjects[0]!.status).toBe('completed')
    })

    it('draftProjects filters by draft status', async () => {
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
        {
          id: '2',
          user_id: '1',
          team_id: null,
          title: 'Project 2',
          status: 'completed',
          current_step: 'complete',
          responses: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockDataSource.getProjects.mockResolvedValueOnce(mockProjects)

      const projectsStore = useProjectsStore()
      await projectsStore.fetchAll()

      expect(projectsStore.draftProjects).toHaveLength(1)
      expect(projectsStore.draftProjects[0]!.status).toBe('draft')
    })
  })
})
