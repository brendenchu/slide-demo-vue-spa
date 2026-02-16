// Generic type system for the persistence layer

/**
 * Minimal constraints for model types used by the persistence layer.
 * Apps extend this by mapping their concrete model types.
 */
export interface ModelMap {
  User: { id: string }
  Team: { id: string }
  Project: { id: string }
  Notification: { id: string }
}

/**
 * Base storage adapter interface for key-value persistence
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

/**
 * Extended storage adapter with prefix-based bulk retrieval
 */
export interface ExtendedStorageAdapter extends StorageAdapter {
  getAllByPrefix<T>(prefix: string): Promise<Record<string, T>>
}

/**
 * Minimal HTTP client interface that any axios instance satisfies
 */
export interface HttpClient {
  get<T = unknown>(url: string, config?: unknown): Promise<{ data: T }>
  post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<{ data: T }>
  put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<{ data: T }>
  delete<T = unknown>(url: string, config?: unknown): Promise<{ data: T }>
}

/**
 * Main data source interface — abstracts storage vs API.
 * Generic over M so apps supply their own model types.
 */
export interface DataSource<M extends ModelMap = ModelMap> {
  // Authentication methods
  login(email: string, password: string): Promise<{ user: M['User']; token: string }>
  register(data: RegisterData): Promise<{ user: M['User']; token: string }>
  logout(): Promise<void>
  getUser(): Promise<M['User'] | null>
  updateUser(data: Partial<M['User']>): Promise<M['User']>

  // Project methods
  getProjects(params?: { team?: string }): Promise<M['Project'][]>
  getProject(id: string): Promise<M['Project'] | null>
  createProject(data: CreateProjectData): Promise<M['Project']>
  updateProject(id: string, data: Partial<M['Project']>): Promise<M['Project']>
  deleteProject(id: string): Promise<void>
  saveResponses(
    projectId: string,
    step: string,
    responses: Record<string, unknown>
  ): Promise<M['Project']>
  completeProject(projectId: string): Promise<M['Project']>

  // Team methods
  getTeams(): Promise<M['Team'][]>
  getTeam(id: string): Promise<M['Team'] | null>
  createTeam(data: CreateTeamData): Promise<M['Team']>
  updateTeam(id: string, data: Partial<M['Team']>): Promise<M['Team']>

  // Terms methods
  acceptTerms(): Promise<void>

  // Notification methods
  getNotifications(): Promise<{ notifications: M['Notification'][]; unread_count: number }>
  markNotificationAsRead(id: string): Promise<void>
  markAllNotificationsAsRead(): Promise<void>
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

/**
 * Extracts a human-readable error message from an unknown error
 */
export type ErrorMessageExtractor = (error: unknown) => string

/**
 * Configuration for LocalDataSource — factory callbacks replace hardcoded model construction
 */
export interface LocalDataSourceConfig<M extends ModelMap> {
  storage: ExtendedStorageAdapter

  /** Validate credentials and return user if valid, null if not found */
  validateCredentials(
    email: string,
    password: string,
    storage: ExtendedStorageAdapter
  ): Promise<M['User'] | null>

  /** Create a new user from registration data */
  createUser(data: RegisterData): M['User']

  /** Create a new project for the given user */
  createProject(data: CreateProjectData, user: M['User']): M['Project']

  /** Create a new team from the given data */
  createTeam(data: CreateTeamData): M['Team']

  /** Merge step responses into an existing project */
  mergeResponses(
    project: M['Project'],
    step: string,
    responses: Record<string, unknown>
  ): M['Project']

  /** Mark a project as completed */
  markCompleted(project: M['Project']): Partial<M['Project']>
}

/**
 * Configuration for HybridStorage
 */
export interface HybridStorageConfig {
  localStoragePrefix: string
  dbName: string
  indexedDBStores: Record<string, string[]>
  useIndexedDB?: (key: string) => boolean
}

/**
 * Configuration for IndexedDB adapter
 */
export interface IndexedDBConfig {
  dbName: string
  stores: Record<string, string[]>
}

/**
 * Data source mode
 */
export type DataSourceMode = 'local' | 'api' | 'hybrid'

/**
 * Configuration for DataSourceFactory
 */
export interface DataSourceFactoryConfig<M extends ModelMap> {
  mode: DataSourceMode
  httpClient?: HttpClient
  getErrorMessage?: ErrorMessageExtractor
  localConfig?: LocalDataSourceConfig<M>
}
