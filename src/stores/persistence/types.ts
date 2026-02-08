// Storage layer type definitions

import type { User, Team, Project, AppNotification } from '@/types/models'

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

export interface StorageOptions {
  prefix?: string
}

// Data transfer objects for create operations
export interface RegisterData {
  first_name: string
  last_name: string
}

export interface CreateProjectData {
  title: string
  description?: string
}

export interface CreateTeamData {
  name: string
  description?: string
  status?: 'active' | 'inactive'
}

// Main data source interface - abstracts storage vs API
export interface DataSource {
  // Authentication methods
  login(email: string, password: string): Promise<{ user: User; token: string }>
  register(data: RegisterData): Promise<{ user: User; token: string }>
  logout(): Promise<void>
  getUser(): Promise<User | null>
  updateUser(data: Partial<User>): Promise<User>

  // Project methods
  getProjects(params?: { team?: string }): Promise<Project[]>
  getProject(id: string): Promise<Project | null>
  createProject(data: CreateProjectData): Promise<Project>
  updateProject(id: string, data: Partial<Project>): Promise<Project>
  deleteProject(id: string): Promise<void>
  saveResponses(
    projectId: string,
    step: string,
    responses: Record<string, unknown>
  ): Promise<Project>
  completeProject(projectId: string): Promise<Project>

  // Team methods
  getTeams(): Promise<Team[]>
  getTeam(id: string): Promise<Team | null>
  createTeam(data: CreateTeamData): Promise<Team>
  updateTeam(id: string, data: Partial<Team>): Promise<Team>

  // Notification methods
  getNotifications(): Promise<{ notifications: AppNotification[]; unread_count: number }>
  markNotificationAsRead(id: string): Promise<void>
  markAllNotificationsAsRead(): Promise<void>
}
