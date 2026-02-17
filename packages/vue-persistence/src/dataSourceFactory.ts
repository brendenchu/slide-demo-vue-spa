import { LocalDataSource } from './localDataSource'
import { ApiDataSource } from './apiDataSource'
import type { ModelMap, DataSource, DataSourceFactoryConfig } from './types'

/**
 * Factory class for creating data source instances based on configuration.
 * No `import.meta.env` access — the app reads env vars and passes the mode.
 */
export class DataSourceFactory {
  static create<M extends ModelMap>(config: DataSourceFactoryConfig<M>): DataSource<M> {
    switch (config.mode) {
      case 'api': {
        if (!config.httpClient) {
          throw new Error('httpClient is required for API mode')
        }
        return new ApiDataSource<M>(config.httpClient, config.getErrorMessage)
      }

      case 'hybrid':
        throw new Error(
          'Hybrid mode not yet implemented. Please use "local" or "api" mode.'
        )

      case 'local':
      default: {
        if (!config.localConfig) {
          throw new Error('localConfig is required for local mode')
        }
        return new LocalDataSource<M>(config.localConfig)
      }
    }
  }
}
