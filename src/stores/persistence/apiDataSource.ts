import type { User, Team, Project } from '@/types/models'
import type {
  DataSource,
  RegisterData,
  CreateProjectData,
  CreateUserData,
  CreateTeamData,
} from './types'
import { getApiClient, getErrorMessage } from '@/lib/axios'
import type { AxiosInstance } from 'axios'

/**
 * API Data Source implementation
 *
 * Connects to backend via REST API
 * Uses token-based authentication
 */
export class ApiDataSource implements DataSource {
  private api: AxiosInstance

  constructor() {
    this.api = getApiClient()
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await this.api.post<{ data: { user: User; token: string } }>('/auth/login', {
        email,
        password,
      })

      const { user, token } = response.data.data

      // Note: Token storage is handled by auth store for consistency
      // The auth store will persist this through the storage adapter

      return { user, token }
    } catch (error) {
      console.error('Login failed:', getErrorMessage(error))
      throw error
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await this.api.post<{ data: { user: User; token: string } }>(
        '/auth/register',
        data
      )

      const { user, token } = response.data.data

      // Note: Token storage is handled by auth store for consistency
      // The auth store will persist this through the storage adapter

      return { user, token }
    } catch (error) {
      console.error('Registration failed:', getErrorMessage(error))
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout')
    } catch (error) {
      console.error('Logout failed:', getErrorMessage(error))
      // Continue even if API call fails - auth store will handle cleanup
    }
    // Note: Token cleanup is handled by auth store for consistency
  }

  async getUser(): Promise<User | null> {
    try {
      const response = await this.api.get<{ data: { user: User } }>('/auth/user')
      return response.data.data.user
    } catch (error) {
      console.error('Get user failed:', getErrorMessage(error))
      return null
    }
  }

  async updateUser(data: Partial<User>): Promise<User> {
    try {
      const response = await this.api.put<{ data: User }>('/auth/user', data)
      const user = response.data.data

      // Note: User cache update is handled by auth store for consistency

      return user
    } catch (error) {
      console.error('Update user failed:', getErrorMessage(error))
      throw error
    }
  }

  // ============================================================================
  // Project Methods
  // ============================================================================

  async getProjects(): Promise<Project[]> {
    try {
      const response = await this.api.get<{ data: Project[] }>('/projects')
      return response.data.data
    } catch (error) {
      console.error('Get projects failed:', getErrorMessage(error))
      throw error
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const response = await this.api.get<{ data: Project }>(`/projects/${id}`)
      return response.data.data
    } catch (error) {
      // Return null for 404, throw for other errors
      if (this.isNotFoundError(error)) {
        return null
      }
      console.error('Get project failed:', getErrorMessage(error))
      throw error
    }
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const response = await this.api.post<{ data: Project }>('/projects', data)
      return response.data.data
    } catch (error) {
      console.error('Create project failed:', getErrorMessage(error))
      throw error
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const response = await this.api.put<{ data: Project }>(`/projects/${id}`, data)
      return response.data.data
    } catch (error) {
      console.error('Update project failed:', getErrorMessage(error))
      throw error
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.api.delete(`/projects/${id}`)
    } catch (error) {
      console.error('Delete project failed:', getErrorMessage(error))
      throw error
    }
  }

  async saveResponses(
    projectId: string,
    step: string,
    responses: Record<string, unknown>
  ): Promise<Project> {
    try {
      const response = await this.api.post<{ data: Project }>(`/projects/${projectId}/responses`, {
        step,
        responses,
      })
      return response.data.data
    } catch (error) {
      console.error('Save responses failed:', getErrorMessage(error))
      throw error
    }
  }

  async completeProject(projectId: string): Promise<Project> {
    try {
      const response = await this.api.post<{ data: Project }>(`/projects/${projectId}/complete`)
      return response.data.data
    } catch (error) {
      console.error('Complete project failed:', getErrorMessage(error))
      throw error
    }
  }

  // ============================================================================
  // User Management Methods (Admin)
  // ============================================================================

  async getUsers(): Promise<User[]> {
    try {
      const response = await this.api.get<{ data: User[] }>('/admin/users')
      return response.data.data
    } catch (error) {
      console.error('Get users failed:', getErrorMessage(error))
      throw error
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await this.api.get<{ data: User }>(`/admin/users/${id}`)
      return response.data.data
    } catch (error) {
      // Return null for 404, throw for other errors
      if (this.isNotFoundError(error)) {
        return null
      }
      console.error('Get user by ID failed:', getErrorMessage(error))
      throw error
    }
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      const response = await this.api.post<{ data: User }>('/admin/users', data)
      return response.data.data
    } catch (error) {
      console.error('Create user failed:', getErrorMessage(error))
      throw error
    }
  }

  async updateUserById(id: string, data: Partial<User>): Promise<User> {
    try {
      const response = await this.api.put<{ data: User }>(`/admin/users/${id}`, data)
      return response.data.data
    } catch (error) {
      console.error('Update user by ID failed:', getErrorMessage(error))
      throw error
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.api.delete(`/admin/users/${id}`)
    } catch (error) {
      console.error('Delete user failed:', getErrorMessage(error))
      throw error
    }
  }

  // ============================================================================
  // Team Methods
  // ============================================================================

  async getTeams(): Promise<Team[]> {
    try {
      const response = await this.api.get<{ data: Team[] }>('/teams')
      return response.data.data
    } catch (error) {
      console.error('Get teams failed:', getErrorMessage(error))
      throw error
    }
  }

  async getTeam(id: string): Promise<Team | null> {
    try {
      const response = await this.api.get<{ data: Team }>(`/teams/${id}`)
      return response.data.data
    } catch (error) {
      // Return null for 404, throw for other errors
      if (this.isNotFoundError(error)) {
        return null
      }
      console.error('Get team failed:', getErrorMessage(error))
      throw error
    }
  }

  async createTeam(data: CreateTeamData): Promise<Team> {
    try {
      const response = await this.api.post<{ data: Team }>('/teams', data)
      return response.data.data
    } catch (error) {
      console.error('Create team failed:', getErrorMessage(error))
      throw error
    }
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    try {
      const response = await this.api.put<{ data: Team }>(`/teams/${id}`, data)
      return response.data.data
    } catch (error) {
      console.error('Update team failed:', getErrorMessage(error))
      throw error
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'status' in error.response &&
      error.response.status === 404
    )
  }
}
