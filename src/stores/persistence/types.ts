// Storage layer type definitions

import type { User, Team, Project } from '@/types/models'

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
  name: string
  email: string
  password: string
}

export interface CreateProjectData {
  title: string
  description?: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role?: string
  team_id?: string | null
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
  getProjects(): Promise<Project[]>
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

  // User management methods (admin)
  getUsers(): Promise<User[]>
  getUserById(id: string): Promise<User | null>
  createUser(data: CreateUserData): Promise<User>
  updateUserById(id: string, data: Partial<User>): Promise<User>
  deleteUser(id: string): Promise<void>

  // Team methods
  getTeams(): Promise<Team[]>
  getTeam(id: string): Promise<Team | null>
  createTeam(data: CreateTeamData): Promise<Team>
  updateTeam(id: string, data: Partial<Team>): Promise<Team>
}
