import { LocalDataSource } from './localDataSource'
import { ApiDataSource } from './apiDataSource'
import type { DataSource } from './types'

/**
 * Data source mode types
 */
export type DataSourceMode = 'local' | 'api' | 'hybrid'

/**
 * Factory class for creating data source instances based on configuration
 */
export class DataSourceFactory {
  /**
   * Create a data source based on the configured mode
   *
   * @param mode - Optional override for the data source mode
   * @returns DataSource instance
   */
  static create(mode?: DataSourceMode): DataSource {
    // Read from environment variable, fallback to parameter or 'local'
    const configMode = (import.meta.env.VITE_DATA_SOURCE as DataSourceMode) || mode || 'local'

    switch (configMode) {
      case 'api':
        // API mode - connects to backend API
        return new ApiDataSource()

      case 'hybrid':
        // Hybrid mode will be implemented in Phase 5
        // For now, throw an error if hybrid mode is requested
        throw new Error(
          'Hybrid mode not yet implemented. Please set VITE_DATA_SOURCE=local in your .env file.'
        )

      case 'local':
      default:
        return new LocalDataSource()
    }
  }
}
