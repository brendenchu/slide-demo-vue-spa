import { storage } from './storage'
import type {
  DataSource,
  RegisterData,
  CreateProjectData,
  CreateUserData,
  CreateTeamData,
} from './types'
import type { User, Team, Project, Role } from '@/types/models'

/**
 * Local data source implementation using browser storage
 * (LocalStorage + IndexedDB via HybridStorage)
 */
export class LocalDataSource implements DataSource {
  // ===========================
  // Authentication Methods
  // ===========================

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // Demo: Check against seeded users
      // Map email to user ID for demo purposes
      const userId =
        email === 'client@example.com' ? '1' : email === 'admin@example.com' ? '2' : '3'

      const user = await storage.get<User>(`user:${userId}`)

      if (!user || password !== 'password') {
        throw new Error('Invalid credentials')
      }

      // Generate fake JWT token
      const token = btoa(
        JSON.stringify({
          userId: user.id,
          email: user.email,
          exp: Date.now() + 86400000, // 24 hours
        })
      )

      return { user, token }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      // Check if email already exists
      const allUsers = await this.getUsers()
      const emailExists = allUsers.some((u) => u.email === data.email)

      if (emailExists) {
        throw new Error('Email already registered')
      }

      // Generate new user ID
      const userId = `user-${Date.now()}`

      // Create new user with default client role and permissions
      const user: User = {
        id: userId,
        email: data.email,
        name: data.name,
        roles: ['client'], // Default role for new registrations
        permissions: ['view-project', 'create-project', 'update-project'],
        team_id: null,
        email_verified_at: null,
      }

      // Save to storage
      await storage.set(`user:${userId}`, user)

      // Generate token
      const token = btoa(
        JSON.stringify({
          userId: user.id,
          email: user.email,
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
    // Local logout just clears auth data (done by auth store)
    // No server call needed
    return Promise.resolve()
  }

  async getUser(): Promise<User | null> {
    try {
      return await storage.get<User>('auth:user')
    } catch (error) {
      console.error('Failed to get user:', error)
      return null
    }
  }

  async updateUser(data: Partial<User>): Promise<User> {
    try {
      const currentUser = await this.getUser()
      if (!currentUser) {
        throw new Error('No user logged in')
      }

      const updatedUser: User = {
        ...currentUser,
        ...data,
      }

      // Update both auth:user and user:{id}
      await storage.set('auth:user', updatedUser)
      await storage.set(`user:${updatedUser.id}`, updatedUser)

      return updatedUser
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  // ===========================
  // Project Methods
  // ===========================

  async getProjects(): Promise<Project[]> {
    try {
      const projectsData = await storage.getAllByPrefix<Project>('project:')
      return Object.values(projectsData)
    } catch (error) {
      console.error('Failed to get projects:', error)
      return []
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      return await storage.get<Project>(`project:${id}`)
    } catch (error) {
      console.error('Failed to get project:', error)
      return null
    }
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const currentUser = await this.getUser()
      if (!currentUser) {
        throw new Error('Not authenticated')
      }

      const project: Project = {
        id: `project-${Math.random().toString(36).substring(7)}`,
        user_id: currentUser.id,
        team_id: currentUser.team_id,
        title: data.title || 'Untitled Story',
        status: 'draft',
        current_step: 'intro',
        responses: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await storage.set(`project:${project.id}`, project)

      return project
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const project = await storage.get<Project>(`project:${id}`)
      if (!project) {
        throw new Error('Project not found')
      }

      const updated: Project = {
        ...project,
        ...data,
        updated_at: new Date().toISOString(),
      }

      await storage.set(`project:${id}`, updated)

      return updated
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await storage.remove(`project:${id}`)
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }

  async saveResponses(
    projectId: string,
    step: string,
    responses: Record<string, unknown>
  ): Promise<Project> {
    try {
      const project = await storage.get<Project>(`project:${projectId}`)
      if (!project) {
        throw new Error('Project not found')
      }

      const updated: Project = {
        ...project,
        responses: {
          ...project.responses,
          [step]: responses,
        },
        current_step: step as Project['current_step'],
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      }

      await storage.set(`project:${projectId}`, updated)

      return updated
    } catch (error) {
      console.error('Failed to save responses:', error)
      throw error
    }
  }

  async completeProject(projectId: string): Promise<Project> {
    return this.updateProject(projectId, {
      status: 'completed',
      current_step: 'complete',
    })
  }

  // ===========================
  // User Management Methods (Admin)
  // ===========================

  async getUsers(): Promise<User[]> {
    try {
      const usersData = await storage.getAllByPrefix<User>('user:')
      // Filter out the auth:user entry
      return Object.entries(usersData)
        .filter(([key]) => key.startsWith('user:') && !key.startsWith('user:auth'))
        .map(([, user]) => user)
    } catch (error) {
      console.error('Failed to get users:', error)
      return []
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await storage.get<User>(`user:${id}`)
    } catch (error) {
      console.error('Failed to get user by ID:', error)
      return null
    }
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      // Check if email already exists
      const allUsers = await this.getUsers()
      const emailExists = allUsers.some((u) => u.email === data.email)

      if (emailExists) {
        throw new Error('Email already registered')
      }

      // Generate new user ID
      const userId = `user-${Date.now()}`

      // Determine role and permissions
      const role = (data.role || 'client') as Role
      const rolePermissionsMap: Record<Role, string[]> = {
        'super-admin': [
          'view-user',
          'create-user',
          'update-user',
          'delete-user',
          'view-project',
          'create-project',
          'update-project',
          'delete-project',
        ],
        admin: ['view-user', 'create-user', 'update-user', 'view-project', 'create-project'],
        consultant: ['view-project', 'create-project', 'update-project'],
        client: ['view-project', 'create-project', 'update-project'],
        guest: ['view-project'],
      }

      // Create new user
      const user: User = {
        id: userId,
        email: data.email,
        name: data.name,
        roles: [role],
        permissions: rolePermissionsMap[role],
        team_id: data.team_id || null,
        email_verified_at: null,
      }

      // Save to storage
      await storage.set(`user:${userId}`, user)

      return user
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }

  async updateUserById(id: string, data: Partial<User>): Promise<User> {
    try {
      const user = await storage.get<User>(`user:${id}`)
      if (!user) {
        throw new Error('User not found')
      }

      const updated: User = {
        ...user,
        ...data,
      }

      await storage.set(`user:${id}`, updated)

      // If updating current user, also update auth:user
      const currentUser = await this.getUser()
      if (currentUser && currentUser.id === id) {
        await storage.set('auth:user', updated)
      }

      return updated
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await storage.remove(`user:${id}`)

      // Also delete user's projects
      const projects = await this.getProjects()
      const userProjects = projects.filter((p) => p.user_id === id)

      for (const project of userProjects) {
        await this.deleteProject(project.id)
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  // ===========================
  // Team Methods
  // ===========================

  async getTeams(): Promise<Team[]> {
    try {
      const teamsData = await storage.getAllByPrefix<Team>('team:')
      return Object.values(teamsData)
    } catch (error) {
      console.error('Failed to get teams:', error)
      return []
    }
  }

  async getTeam(id: string): Promise<Team | null> {
    try {
      return await storage.get<Team>(`team:${id}`)
    } catch (error) {
      console.error('Failed to get team:', error)
      return null
    }
  }

  async createTeam(data: CreateTeamData): Promise<Team> {
    try {
      const teamId = `team-${Date.now()}`

      const team: Team = {
        id: teamId,
        name: data.name,
        status: data.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await storage.set(`team:${teamId}`, team)

      return team
    } catch (error) {
      console.error('Failed to create team:', error)
      throw error
    }
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    try {
      const team = await storage.get<Team>(`team:${id}`)
      if (!team) {
        throw new Error('Team not found')
      }

      const updated: Team = {
        ...team,
        ...data,
        updated_at: new Date().toISOString(),
      }

      await storage.set(`team:${id}`, updated)

      return updated
    } catch (error) {
      console.error('Failed to update team:', error)
      throw error
    }
  }
}
