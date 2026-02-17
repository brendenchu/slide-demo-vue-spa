# @bchu/vue-persistence

Generic, framework-agnostic data source abstraction layer with swappable local (localStorage + IndexedDB) and API (REST) backends. Uses generic type parameters and dependency injection for full decoupling from app-specific models.

## Installation

```bash
pnpm add @bchu/vue-persistence
```

Peer dependency: `localforage ^1.10.0`

## Quick Start

```typescript
import { DataSourceFactory } from '@bchu/vue-persistence'
import type { ModelMap, LocalDataSourceConfig } from '@bchu/vue-persistence'

// Define your app's model types
interface AppModels extends ModelMap {
  User: { id: string; email: string; name: string }
  Team: { id: string; name: string }
  Project: { id: string; title: string; status: string }
  Notification: { id: string; title: string }
}

// Create a data source
const ds = DataSourceFactory.create<AppModels>({
  mode: 'local',
  localConfig: { storage, validateCredentials, createUser, createProject, createTeam, mergeResponses, markCompleted },
})

// Use it
const user = await ds.login('user@example.com', 'password')
const projects = await ds.getProjects()
```

## Data Source Modes

### Local Mode

Uses `HybridStorage` (localStorage for small data, IndexedDB for large data like projects and responses). Works fully offline with no backend.

```typescript
const ds = DataSourceFactory.create<AppModels>({
  mode: 'local',
  localConfig: {
    storage: createHybridStorage(),
    validateCredentials: async (email, password, store) => { /* return user or null */ },
    createUser: (data) => ({ id: generateId(), ...data }),
    createProject: (data, user) => ({ id: generateId(), user_id: user.id, ...data }),
    createTeam: (data) => ({ id: generateId(), ...data }),
    mergeResponses: (project, step, responses) => ({ ...project, responses: { ...project.responses, [step]: responses } }),
    markCompleted: (project) => ({ status: 'completed' }),
  },
})
```

### API Mode

Calls a REST API backend via an injected `HttpClient` (any axios-compatible instance).

```typescript
import axios from 'axios'

const ds = DataSourceFactory.create<AppModels>({
  mode: 'api',
  httpClient: axios.create({ baseURL: '/api/v1' }),
  getErrorMessage: (error) => error.message,
})
```

### Hybrid Mode

Not yet implemented. Planned offline-first with background sync.

## Storage Adapters

### `HybridStorage`

Routes keys to localStorage or IndexedDB based on prefix patterns.

```typescript
import { createHybridStorage } from '@bchu/vue-persistence'

const storage = createHybridStorage({
  localStoragePrefix: 'myapp:',
  dbName: 'myapp_db',
  indexedDBStores: {
    projects: ['project:'],
    responses: ['response:'],
  },
})

await storage.set('project:1', { id: '1', title: 'Test' })  // → IndexedDB
await storage.set('user:token', 'abc123')                     // → localStorage
```

### `LocalStorageAdapter`

localStorage wrapper with configurable key prefix and JSON serialization.

### `IndexedDBAdapter`

IndexedDB wrapper via localforage with configurable database name and store routing.

## Exports

### Classes

- `DataSourceFactory` — Factory for creating data sources by mode
- `LocalDataSource` — Browser storage-backed data source
- `ApiDataSource` — REST API-backed data source
- `HybridStorage` — Hybrid localStorage/IndexedDB storage
- `LocalStorageAdapter` — localStorage wrapper
- `IndexedDBAdapter` — IndexedDB wrapper

### Factory Functions

- `createHybridStorage(config?)` — Create a `HybridStorage` instance with defaults

### Types

- `ModelMap` — Base constraint for app model types
- `DataSource<M>` — Full data source interface
- `StorageAdapter` / `ExtendedStorageAdapter` — Storage interfaces
- `HttpClient` — Minimal HTTP client interface (axios-compatible)
- `LocalDataSourceConfig<M>` — Config with factory callbacks for local mode
- `HybridStorageConfig` — Storage routing configuration
- `DataSourceMode` — `'local' | 'api' | 'hybrid'`
- `DataSourceFactoryConfig<M>` — Factory configuration
- `RegisterData`, `CreateProjectData`, `CreateTeamData` — DTO types
- `ErrorMessageExtractor` — Error message extraction function type

## Development

```bash
pnpm build    # tsc build
pnpm test     # vitest (watch mode)
```
