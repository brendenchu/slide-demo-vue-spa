import type { User, Team, Project, AppNotification } from '@/types/models'
import type {
  DataSource,
  DataSourceMode,
  LocalDataSourceConfig,
  ModelMap,
} from '@bchu/vue-persistence'
import { createHybridStorage, DataSourceFactory } from '@bchu/vue-persistence'
import { getApiClient, getErrorMessage } from '@/lib/axios'

/**
 * App-specific model map satisfying the generic ModelMap constraint
 */
export interface AppModelMap extends ModelMap {
  User: User
  Team: Team
  Project: Project
  Notification: AppNotification
}

/**
 * Singleton HybridStorage instance for the app
 */
export const storage = createHybridStorage()

/**
 * App-specific local data source configuration with demo credentials and model defaults
 */
const localConfig: LocalDataSourceConfig<AppModelMap> = {
  storage,

  async validateCredentials(email, password, store) {
    // Demo credentials: any seeded user with password "password"
    if (password !== 'password') {
      return null
    }

    // Look up user by email in storage
    const keys = await store.keys()
    for (const key of keys) {
      if (key.startsWith('user:')) {
        const user = await store.get<User>(key)
        if (user && user.email === email) {
          return user
        }
      }
    }

    return null
  },

  createUser(data) {
    const userId = `user-${Math.random().toString(36).substring(7)}`
    const suffix = Math.random().toString(36).substring(7)
    const email = `${data.first_name.toLowerCase()}.${data.last_name.toLowerCase()}.${suffix}@example.com`

    return {
      id: userId,
      email,
      name: `${data.first_name} ${data.last_name}`,
      team_id: null,
    }
  },

  createProject(data, user) {
    return {
      id: `project-${Math.random().toString(36).substring(7)}`,
      user_id: user.id,
      team_id: user.team_id,
      title: data.title || 'Untitled Story',
      status: 'draft',
      current_step: 'intro',
      responses: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },

  createTeam(data) {
    const teamId = `team-${Date.now()}`

    return {
      id: teamId,
      name: data.name,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },

  mergeResponses(project, step, responses) {
    return {
      ...project,
      responses: {
        ...project.responses,
        [step]: responses,
      },
      current_step: step as Project['current_step'],
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    }
  },

  markCompleted() {
    return {
      status: 'completed',
      current_step: 'complete',
    } as Partial<Project>
  },
}

/**
 * Create a DataSource configured from the app's environment variable
 */
export function createDataSource(): DataSource<AppModelMap> {
  const mode = (import.meta.env.VITE_DATA_SOURCE as DataSourceMode) || 'local'

  return DataSourceFactory.create<AppModelMap>({
    mode,
    httpClient: mode === 'api' ? getApiClient() : undefined,
    getErrorMessage: mode === 'api' ? getErrorMessage : undefined,
    localConfig: mode === 'local' ? localConfig : undefined,
  })
}
