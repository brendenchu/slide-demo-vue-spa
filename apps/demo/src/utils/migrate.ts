import { storage } from '@/stores/persistence/storage'
import { ApiDataSource } from '@/stores/persistence/apiDataSource'
import type { Project } from '@/types/models'

export interface MigrationResult {
  success: boolean
  projectsMigrated: number
  errors: string[]
  timestamp: string
}

/**
 * Migrate local data to API backend
 *
 * This utility helps users transition from local-only mode to API mode
 * by uploading their locally stored projects and data to the backend.
 *
 * Prerequisites:
 * - User must be authenticated (have a valid token)
 * - API must be accessible
 *
 * What gets migrated:
 * - Projects and their responses
 * - Project metadata (status, current step, etc.)
 *
 * What does NOT get migrated:
 * - User data (users manage their own accounts via registration)
 * - Team data (teams are managed by admins via API)
 * - Authentication tokens (new tokens issued by API)
 *
 * @param token - Valid API authentication token
 * @returns Migration result with success status and statistics
 */
export async function migrateLocalDataToAPI(token: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    projectsMigrated: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  }

  try {
    // Initialize API data source
    const apiDataSource = new ApiDataSource()

    // Set the authentication token
    localStorage.setItem('auth_token', token)

    // Get all projects from local storage
    const allKeys = await storage.keys()
    const projectKeys = allKeys.filter((key) => key.startsWith('project:'))

    if (projectKeys.length === 0) {
      result.success = true
      result.errors.push('No local projects found to migrate')
      return result
    }

    // eslint-disable-next-line no-console
    console.log(`Found ${projectKeys.length} local projects to migrate`)

    // Migrate each project
    for (const key of projectKeys) {
      try {
        const localProject = await storage.get<Project>(key)

        if (!localProject) {
          result.errors.push(`Failed to read project from key: ${key}`)
          continue
        }

        // Create project via API
        const apiProject = await apiDataSource.createProject({
          title: localProject.title || 'Untitled Project',
          description: localProject.description || '',
        })

        // eslint-disable-next-line no-console
        console.log(`Created project "${apiProject.title}" with ID: ${apiProject.id}`)

        // If project has responses, save them step by step
        if (localProject.responses && Object.keys(localProject.responses).length > 0) {
          try {
            // Save all responses at once (assuming current_step is the last completed step)
            await apiDataSource.saveResponses(
              apiProject.id,
              localProject.current_step,
              localProject.responses
            )
            // eslint-disable-next-line no-console
            console.log(`Migrated ${Object.keys(localProject.responses).length} responses`)
          } catch (error) {
            result.errors.push(
              `Failed to migrate responses for project "${localProject.title}": ${error instanceof Error ? error.message : String(error)}`
            )
          }
        }

        // If project was completed locally, complete it on API
        if (localProject.status === 'completed') {
          try {
            await apiDataSource.completeProject(apiProject.id)
            // eslint-disable-next-line no-console
            console.log(`Marked project "${apiProject.title}" as completed`)
          } catch (error) {
            result.errors.push(
              `Failed to complete project "${localProject.title}": ${error instanceof Error ? error.message : String(error)}`
            )
          }
        }

        result.projectsMigrated++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        result.errors.push(`Failed to migrate project ${key}: ${errorMessage}`)
        console.error(`Migration error for ${key}:`, error)
      }
    }

    // Migration successful if at least one project was migrated
    result.success = result.projectsMigrated > 0

    // eslint-disable-next-line no-console
    console.log(
      `Migration complete: ${result.projectsMigrated}/${projectKeys.length} projects migrated`
    )

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    result.errors.push(`Migration failed: ${errorMessage}`)
    console.error('Migration error:', error)
    return result
  }
}

/**
 * Clear all local data after successful migration
 *
 * WARNING: This will permanently delete all locally stored data.
 * Only call this after confirming successful migration to API.
 *
 * @returns Promise that resolves when local data is cleared
 */
export async function clearLocalDataAfterMigration(): Promise<void> {
  console.warn('Clearing all local data...')

  try {
    // Clear all storage
    await storage.clear()

    // Clear auth token (will be replaced by API token)
    localStorage.removeItem('auth_token')

    // eslint-disable-next-line no-console
    console.log('Local data cleared successfully')
  } catch (error) {
    console.error('Failed to clear local data:', error)
    throw error
  }
}

/**
 * Export local data as JSON for backup before migration
 *
 * This creates a downloadable JSON file containing all local data
 * as a safety backup before migration.
 *
 * @returns JSON string of all local data
 */
export async function exportLocalDataAsJSON(): Promise<string> {
  try {
    const allKeys = await storage.keys()
    const data: Record<string, unknown> = {}

    for (const key of allKeys) {
      const value = await storage.get(key)
      if (value !== null) {
        data[key] = value
      }
    }

    return JSON.stringify(
      {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data,
      },
      null,
      2
    )
  } catch (error) {
    console.error('Failed to export local data:', error)
    throw error
  }
}

/**
 * Download exported data as a file
 *
 * @param filename - Name of the file to download
 */
export async function downloadLocalDataBackup(filename = 'local-data-backup.json'): Promise<void> {
  try {
    const jsonData = await exportLocalDataAsJSON()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download backup:', error)
    throw error
  }
}
