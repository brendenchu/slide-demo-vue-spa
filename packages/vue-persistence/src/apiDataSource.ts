import type {
  ModelMap,
  DataSource,
  RegisterData,
  CreateProjectData,
  CreateTeamData,
  HttpClient,
  ErrorMessageExtractor,
} from './types'

/**
 * Default error message extractor fallback
 */
function defaultGetErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

/**
 * API Data Source implementation
 *
 * Connects to backend via REST API.
 * HTTP client and error extractor are injected via constructor.
 */
export class ApiDataSource<M extends ModelMap = ModelMap> implements DataSource<M> {
  private api: HttpClient
  private getErrorMessage: ErrorMessageExtractor

  constructor(api: HttpClient, getErrorMessage?: ErrorMessageExtractor) {
    this.api = api
    this.getErrorMessage = getErrorMessage ?? defaultGetErrorMessage
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  async login(email: string, password: string): Promise<{ user: M['User']; token: string }> {
    try {
      const response = await this.api.post<{ data: { user: M['User']; token: string } }>(
        '/auth/login',
        {
          email,
          password,
        }
      )

      const { user, token } = response.data.data

      return { user, token }
    } catch (error) {
      console.error('Login failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async register(data: RegisterData): Promise<{ user: M['User']; token: string }> {
    try {
      const response = await this.api.post<{ data: { user: M['User']; token: string } }>(
        '/auth/register',
        data
      )

      const { user, token } = response.data.data

      return { user, token }
    } catch (error) {
      console.error('Registration failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout')
    } catch (error) {
      console.error('Logout failed:', this.getErrorMessage(error))
    }
  }

  async getUser(): Promise<M['User'] | null> {
    try {
      const response = await this.api.get<{ data: { user: M['User'] } }>('/auth/user')
      return response.data.data.user
    } catch (error) {
      console.error('Get user failed:', this.getErrorMessage(error))
      return null
    }
  }

  async updateUser(data: Partial<M['User']>): Promise<M['User']> {
    try {
      const response = await this.api.put<{ data: M['User'] }>('/auth/user', data)
      const user = response.data.data

      return user
    } catch (error) {
      console.error('Update user failed:', this.getErrorMessage(error))
      throw error
    }
  }

  // ============================================================================
  // Project Methods
  // ============================================================================

  async getProjects(params?: { team?: string }): Promise<M['Project'][]> {
    try {
      const response = await this.api.get<{ data: M['Project'][] }>('/projects', { params })
      return response.data.data
    } catch (error) {
      console.error('Get projects failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async getProject(id: string): Promise<M['Project'] | null> {
    try {
      const response = await this.api.get<{ data: M['Project'] }>(`/projects/${id}`)
      return response.data.data
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null
      }
      console.error('Get project failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async createProject(data: CreateProjectData): Promise<M['Project']> {
    try {
      const response = await this.api.post<{ data: M['Project'] }>('/projects', data)
      return response.data.data
    } catch (error) {
      console.error('Create project failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async updateProject(id: string, data: Partial<M['Project']>): Promise<M['Project']> {
    try {
      const response = await this.api.put<{ data: M['Project'] }>(`/projects/${id}`, data)
      return response.data.data
    } catch (error) {
      console.error('Update project failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.api.delete(`/projects/${id}`)
    } catch (error) {
      console.error('Delete project failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async saveResponses(
    projectId: string,
    step: string,
    responses: Record<string, unknown>
  ): Promise<M['Project']> {
    try {
      const response = await this.api.post<{ data: M['Project'] }>(
        `/projects/${projectId}/responses`,
        {
          step,
          responses,
        }
      )
      return response.data.data
    } catch (error) {
      console.error('Save responses failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async completeProject(projectId: string): Promise<M['Project']> {
    try {
      const response = await this.api.post<{ data: M['Project'] }>(
        `/projects/${projectId}/complete`
      )
      return response.data.data
    } catch (error) {
      console.error('Complete project failed:', this.getErrorMessage(error))
      throw error
    }
  }

  // ============================================================================
  // Team Methods
  // ============================================================================

  async getTeams(): Promise<M['Team'][]> {
    try {
      const response = await this.api.get<{ data: M['Team'][] }>('/teams')
      return response.data.data
    } catch (error) {
      console.error('Get teams failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async getTeam(id: string): Promise<M['Team'] | null> {
    try {
      const response = await this.api.get<{ data: M['Team'] }>(`/teams/${id}`)
      return response.data.data
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null
      }
      console.error('Get team failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async createTeam(data: CreateTeamData): Promise<M['Team']> {
    try {
      const response = await this.api.post<{ data: M['Team'] }>('/teams', data)
      return response.data.data
    } catch (error) {
      console.error('Create team failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async updateTeam(id: string, data: Partial<M['Team']>): Promise<M['Team']> {
    try {
      const response = await this.api.put<{ data: M['Team'] }>(`/teams/${id}`, data)
      return response.data.data
    } catch (error) {
      console.error('Update team failed:', this.getErrorMessage(error))
      throw error
    }
  }

  // ============================================================================
  // Terms Methods
  // ============================================================================

  async acceptTerms(): Promise<void> {
    try {
      await this.api.post('/terms/accept', { accepted: true })
    } catch (error) {
      console.error('Accept terms failed:', this.getErrorMessage(error))
      throw error
    }
  }

  // ============================================================================
  // Notification Methods
  // ============================================================================

  async getNotifications(): Promise<{
    notifications: M['Notification'][]
    unread_count: number
  }> {
    try {
      const response = await this.api.get<{
        data: { notifications: M['Notification'][]; unread_count: number }
      }>('/notifications')
      return response.data.data
    } catch (error) {
      console.error('Get notifications failed:', this.getErrorMessage(error))
      return { notifications: [], unread_count: 0 }
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await this.api.post(`/notifications/${id}/read`)
    } catch (error) {
      console.error('Mark notification as read failed:', this.getErrorMessage(error))
      throw error
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await this.api.post('/notifications/read-all')
    } catch (error) {
      console.error('Mark all notifications as read failed:', this.getErrorMessage(error))
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
