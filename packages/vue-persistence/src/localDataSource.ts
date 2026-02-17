import type {
  ModelMap,
  DataSource,
  RegisterData,
  CreateProjectData,
  CreateTeamData,
  LocalDataSourceConfig,
  ExtendedStorageAdapter,
} from './types'

/**
 * Local Data Source implementation
 *
 * Uses browser storage (localStorage + IndexedDB via HybridStorage).
 * Model construction is delegated to config callbacks so the package
 * remains independent of app-specific model shapes.
 */
export class LocalDataSource<M extends ModelMap = ModelMap> implements DataSource<M> {
  private storage: ExtendedStorageAdapter
  private config: LocalDataSourceConfig<M>

  constructor(config: LocalDataSourceConfig<M>) {
    this.config = config
    this.storage = config.storage
  }

  // ===========================
  // Authentication Methods
  // ===========================

  async login(email: string, password: string): Promise<{ user: M['User']; token: string }> {
    try {
      const user = await this.config.validateCredentials(email, password, this.storage)
      if (!user) {
        throw new Error('Invalid credentials')
      }

      // Store user in auth storage
      await this.storage.set('auth:user', user)

      // Generate token
      const token = btoa(
        JSON.stringify({
          userId: user.id,
          email,
          exp: Date.now() + 86400000, // 24 hours
        })
      )

      return { user, token }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async register(data: RegisterData): Promise<{ user: M['User']; token: string }> {
    try {
      const user = this.config.createUser(data)

      // Save to storage
      await this.storage.set(`user:${user.id}`, user)

      // Generate token
      const token = btoa(
        JSON.stringify({
          userId: user.id,
          exp: Date.now() + 86400000, // 24 hours
        })
      )

      return { user, token }
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    return Promise.resolve()
  }

  async getUser(): Promise<M['User'] | null> {
    try {
      return await this.storage.get<M['User']>('auth:user')
    } catch (error) {
      console.error('Failed to get user:', error)
      return null
    }
  }

  async updateUser(data: Partial<M['User']>): Promise<M['User']> {
    try {
      const currentUser = await this.getUser()
      if (!currentUser) {
        throw new Error('No user logged in')
      }

      const updatedUser = {
        ...currentUser,
        ...data,
      } as M['User']

      await this.storage.set('auth:user', updatedUser)
      await this.storage.set(`user:${updatedUser.id}`, updatedUser)

      return updatedUser
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  // ===========================
  // Project Methods
  // ===========================

  async getProjects(params?: { team?: string }): Promise<M['Project'][]> {
    try {
      const projectsData = await this.storage.getAllByPrefix<M['Project']>('project:')
      let projects = Object.values(projectsData)
      if (params?.team) {
        projects = projects.filter(
          (p) => 'team_id' in p && (p as Record<string, unknown>).team_id === params.team
        )
      }
      return projects
    } catch (error) {
      console.error('Failed to get projects:', error)
      return []
    }
  }

  async getProject(id: string): Promise<M['Project'] | null> {
    try {
      return await this.storage.get<M['Project']>(`project:${id}`)
    } catch (error) {
      console.error('Failed to get project:', error)
      return null
    }
  }

  async createProject(data: CreateProjectData): Promise<M['Project']> {
    try {
      const currentUser = await this.getUser()
      if (!currentUser) {
        throw new Error('Not authenticated')
      }

      const project = this.config.createProject(data, currentUser)

      await this.storage.set(`project:${project.id}`, project)

      return project
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  async updateProject(id: string, data: Partial<M['Project']>): Promise<M['Project']> {
    try {
      const project = await this.storage.get<M['Project']>(`project:${id}`)
      if (!project) {
        throw new Error('Project not found')
      }

      const updated = {
        ...project,
        ...data,
        updated_at: new Date().toISOString(),
      } as M['Project']

      await this.storage.set(`project:${id}`, updated)

      return updated
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.storage.remove(`project:${id}`)
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }

  async saveResponses(
    projectId: string,
    step: string,
    responses: Record<string, unknown>
  ): Promise<M['Project']> {
    try {
      const project = await this.storage.get<M['Project']>(`project:${projectId}`)
      if (!project) {
        throw new Error('Project not found')
      }

      const updated = this.config.mergeResponses(project, step, responses)

      await this.storage.set(`project:${projectId}`, updated)

      return updated
    } catch (error) {
      console.error('Failed to save responses:', error)
      throw error
    }
  }

  async completeProject(projectId: string): Promise<M['Project']> {
    return this.updateProject(projectId, this.config.markCompleted(
      await this.storage.get<M['Project']>(`project:${projectId}`) as M['Project']
    ))
  }

  // ===========================
  // Team Methods
  // ===========================

  async getTeams(): Promise<M['Team'][]> {
    try {
      const teamsData = await this.storage.getAllByPrefix<M['Team']>('team:')
      return Object.values(teamsData)
    } catch (error) {
      console.error('Failed to get teams:', error)
      return []
    }
  }

  async getTeam(id: string): Promise<M['Team'] | null> {
    try {
      return await this.storage.get<M['Team']>(`team:${id}`)
    } catch (error) {
      console.error('Failed to get team:', error)
      return null
    }
  }

  async createTeam(data: CreateTeamData): Promise<M['Team']> {
    try {
      const team = this.config.createTeam(data)

      await this.storage.set(`team:${team.id}`, team)

      return team
    } catch (error) {
      console.error('Failed to create team:', error)
      throw error
    }
  }

  async updateTeam(id: string, data: Partial<M['Team']>): Promise<M['Team']> {
    try {
      const team = await this.storage.get<M['Team']>(`team:${id}`)
      if (!team) {
        throw new Error('Team not found')
      }

      const updated = {
        ...team,
        ...data,
        updated_at: new Date().toISOString(),
      } as M['Team']

      await this.storage.set(`team:${id}`, updated)

      return updated
    } catch (error) {
      console.error('Failed to update team:', error)
      throw error
    }
  }

  // ===========================
  // Terms Methods
  // ===========================

  async acceptTerms(): Promise<void> {
    return Promise.resolve()
  }

  // ===========================
  // Notification Methods
  // ===========================

  async getNotifications(): Promise<{
    notifications: M['Notification'][]
    unread_count: number
  }> {
    return { notifications: [], unread_count: 0 }
  }

  async markNotificationAsRead(_id: string): Promise<void> {
    return Promise.resolve()
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return Promise.resolve()
  }
}
