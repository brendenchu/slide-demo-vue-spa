# Frontend API Integration Guide

**Project**: Vue Slide Demo - Vue 3 SPA
**Last Updated**: January 11, 2026

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Source Adapter Pattern](#data-source-adapter-pattern)
- [API Data Source Implementation](#api-data-source-implementation)
- [Authentication Flow](#authentication-flow)
- [Pinia Store Integration](#pinia-store-integration)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Vue SPA integrates with a REST API backend through a flexible adapter pattern that allows switching between local browser storage and API-backed data persistence.

### Key Features

- ✅ Adapter pattern for multiple data sources
- ✅ Token-based authentication (Bearer tokens)
- ✅ Axios HTTP client with interceptors
- ✅ Automatic error handling
- ✅ Type-safe TypeScript interfaces
- ✅ Pinia state management
- ✅ 100% test coverage (128 tests, 96.49%)

### How It Works

```
Vue Components
    ↓
Pinia Stores (auth, projects)
    ↓
DataSourceFactory
    ↓
┌─────────────┬─────────────┬───────────────┐
│LocalDataSource│ApiDataSource│HybridDataSource│
└─────────────┴─────────────┴───────────────┘
    ↓               ↓              ↓
LocalStorage    REST API       Local + API
IndexedDB       (Bearer tokens) (Sync Queue)
```

---

## Architecture

### File Structure

```
vue-spa/src/
├── stores/
│   ├── auth.ts                    # Authentication store
│   ├── projects.ts                # Projects store
│   └── persistence/               # Data layer
│       ├── types.ts               # DataSource interface
│       ├── dataSourceFactory.ts   # Factory pattern
│       ├── localDataSource.ts     # Local storage implementation
│       ├── apiDataSource.ts       # API implementation
│       └── storage.ts             # Storage adapters
├── lib/
│   └── axios.ts                   # Axios configuration
├── types/
│   └── models.ts                  # Data model types
└── utils/
    └── errorMapper.ts             # Error message extraction
```

### Technology Stack

| Layer            | Technology  | Purpose                |
| ---------------- | ----------- | ---------------------- |
| State Management | Pinia       | Reactive stores        |
| HTTP Client      | Axios       | API requests           |
| Storage          | LocalForage | IndexedDB wrapper      |
| Type Safety      | TypeScript  | Compile-time checking  |
| Testing          | Vitest      | Unit/integration tests |

---

## Data Source Adapter Pattern

### DataSource Interface

The `DataSource` interface defines all data operations:

**File**: `src/stores/persistence/types.ts`

```typescript
export interface DataSource {
  // Authentication
  login(email: string, password: string): Promise<{ user: User; token: string }>
  register(data: RegisterData): Promise<{ user: User; token: string }>
  logout(): Promise<void>
  getUser(): Promise<User | null>
  updateUser(data: Partial<User>): Promise<User>

  // Projects
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

  // Admin - User Management
  getUsers(): Promise<User[]>
  getUserById(id: string): Promise<User | null>
  createUser(data: CreateUserData): Promise<User>
  updateUserById(id: string, data: Partial<User>): Promise<User>
  deleteUser(id: string): Promise<void>

  // Teams
  getTeams(): Promise<Team[]>
  getTeam(id: string): Promise<Team | null>
  createTeam(data: CreateTeamData): Promise<Team>
  updateTeam(id: string, data: Partial<Team>): Promise<Team>
}
```

### DataSourceFactory

The factory creates the appropriate implementation based on environment configuration:

**File**: `src/stores/persistence/dataSourceFactory.ts`

```typescript
export type DataSourceMode = 'local' | 'api' | 'hybrid'

export class DataSourceFactory {
  static create(mode?: DataSourceMode): DataSource {
    // Read from environment variable
    const configMode = import.meta.env.VITE_DATA_SOURCE || mode || 'local'

    switch (configMode) {
      case 'api':
        return new ApiDataSource()

      case 'hybrid':
        throw new Error('Hybrid mode not yet implemented')

      case 'local':
      default:
        return new LocalDataSource()
    }
  }
}
```

**Usage in Pinia Stores:**

```typescript
import { DataSourceFactory } from './persistence/dataSourceFactory'

export const useAuthStore = defineStore('auth', () => {
  const dataSource = DataSourceFactory.create()

  const login = async (email: string, password: string) => {
    const { user, token } = await dataSource.login(email, password)
    // Store user and token...
  }

  return { login, ... }
})
```

---

## API Data Source Implementation

### ApiDataSource Class

**File**: `src/stores/persistence/apiDataSource.ts`

The `ApiDataSource` implements the `DataSource` interface using Axios to communicate with the REST API:

```typescript
import { getApiClient, getErrorMessage } from '@/lib/axios'
import type { AxiosInstance } from 'axios'

export class ApiDataSource implements DataSource {
  private api: AxiosInstance

  constructor() {
    this.api = getApiClient()
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await this.api.post<{ data: { user: User; token: string } }>('/auth/login', {
        email,
        password,
      })
      return response.data.data
    } catch (error) {
      console.error('Login failed:', getErrorMessage(error))
      throw error
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const response = await this.api.get<{ data: Project[] }>('/projects')
      return response.data.data
    } catch (error) {
      console.error('Get projects failed:', getErrorMessage(error))
      throw error
    }
  }

  // ... other methods
}
```

### Key Implementation Details

#### 1. Response Unwrapping

The API returns data in this standardized format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

The ApiDataSource extracts the `data` property:

```typescript
const response = await this.api.get<{ data: User[] }>('/users')
return response.data.data // Extract inner data
```

#### 2. Error Handling

```typescript
try {
  const response = await this.api.get('/projects')
  return response.data.data
} catch (error) {
  console.error('Operation failed:', getErrorMessage(error))
  throw error // Re-throw for store to handle
}
```

#### 3. 404 Handling

For GET operations, 404 returns `null` instead of throwing:

```typescript
async getProject(id: string): Promise<Project | null> {
  try {
    const response = await this.api.get(`/projects/${id}`)
    return response.data.data
  } catch (error) {
    if (this.isNotFoundError(error)) {
      return null  // Not found = null, not error
    }
    throw error
  }
}

private isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    error.response?.status === 404
  )
}
```

---

## Authentication Flow

### 1. Login Flow

```typescript
// User submits login form
const authStore = useAuthStore()
await authStore.login('user@example.com', 'password')

// ↓ Auth Store
const { user, token } = await dataSource.login(email, password)

// ↓ ApiDataSource
const response = await this.api.post('/auth/login', { email, password })

// ↓ Backend API
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// ↑ Backend Response
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "1|AbCdEf..."
  }
}

// ↑ Auth Store stores token and user
localStorage.setItem('vsd:auth:token', token)
localStorage.setItem('vsd:auth:user', JSON.stringify(user))
```

### 2. Authenticated Request Flow

```typescript
// User fetches projects
const projectsStore = useProjectsStore()
await projectsStore.fetchAll()

// ↓ Projects Store
const projects = await dataSource.getProjects()

// ↓ ApiDataSource
const response = await this.api.get('/projects')

// ↓ Axios Interceptor (automatically adds token)
GET /api/v1/projects
Headers:
  Authorization: Bearer {token}

// ↑ Backend API (validates Bearer token)
{
  "success": true,
  "data": [...]
}
```

### 3. Logout Flow

```typescript
// User logs out
await authStore.logout()

// ↓ Auth Store
await dataSource.logout()

// ↓ ApiDataSource
await this.api.post('/auth/logout')

// ↓ Backend API (deletes token)
POST / api / v1 / auth / logout

// ↑ Auth Store clears local state
localStorage.removeItem('vsd:auth:token')
localStorage.removeItem('vsd:auth:user')
```

---

## Pinia Store Integration

### Auth Store

**File**: `src/stores/auth.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DataSourceFactory } from './persistence/dataSourceFactory'
import type { User } from '@/types/models'

export const useAuthStore = defineStore('auth', () => {
  const dataSource = DataSourceFactory.create()
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)

  // Actions
  const login = async (email: string, password: string) => {
    const result = await dataSource.login(email, password)
    user.value = result.user
    token.value = result.token

    // Persist to localStorage
    localStorage.setItem('vsd:auth:token', result.token)
    localStorage.setItem('vsd:auth:user', JSON.stringify(result.user))
  }

  const logout = async () => {
    try {
      await dataSource.logout()
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('vsd:auth:token')
      localStorage.removeItem('vsd:auth:user')
    }
  }

  const loadUser = async () => {
    const storedToken = localStorage.getItem('vsd:auth:token')
    const storedUser = localStorage.getItem('vsd:auth:user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    loadUser,
  }
})
```

### Projects Store

**File**: `src/stores/projects.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DataSourceFactory } from './persistence/dataSourceFactory'
import type { Project } from '@/types/models'

export const useProjectsStore = defineStore('projects', () => {
  const dataSource = DataSourceFactory.create()
  const projects = ref<Project[]>([])
  const loading = ref(false)

  // Computed
  const completedProjects = computed(() => projects.value.filter((p) => p.status === 'completed'))

  // Actions
  const fetchAll = async () => {
    loading.value = true
    try {
      projects.value = await dataSource.getProjects()
    } finally {
      loading.value = false
    }
  }

  const create = async (data: CreateProjectData) => {
    const project = await dataSource.createProject(data)
    projects.value.push(project)
    return project
  }

  const deleteProject = async (id: string) => {
    await dataSource.deleteProject(id)
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  return {
    projects,
    loading,
    completedProjects,
    fetchAll,
    create,
    deleteProject,
  }
})
```

---

## Error Handling

### Axios Configuration

**File**: `src/lib/axios.ts`

```typescript
import axios from 'axios'
import type { AxiosInstance } from 'axios'

export function getApiClient(): AxiosInstance {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const baseURL = `${apiUrl}/api/v1`

  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: false, // Token auth, not cookies
  })

  // Request interceptor - add auth token
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('vsd:auth:token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // 401 = token invalid or expired
      if (error.response?.status === 401) {
        // Clear auth and redirect to login
        localStorage.removeItem('vsd:auth:token')
        localStorage.removeItem('vsd:auth:user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return client
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if ('response' in error && typeof error.response === 'object') {
      const response = error.response as any
      return response?.data?.message || 'An error occurred'
    }
    if ('message' in error) {
      return String(error.message)
    }
  }
  return 'Unknown error'
}
```

### Error Handling Patterns

#### 1. Try-Catch in Store Actions

```typescript
const login = async (email: string, password: string) => {
  try {
    const { user, token } = await dataSource.login(email, password)
    // Success - store data
  } catch (error) {
    // Error - show message to user
    throw new Error(getErrorMessage(error))
  }
}
```

#### 2. Component Error Handling

```typescript
const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.message
  }
}
```

#### 3. Validation Errors (422)

The API returns validation errors in this format:

```json
{
  "success": false,
  "message": "The given data was invalid",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

Extract and display:

```typescript
try {
  await authStore.register(formData)
} catch (error) {
  if (error.response?.status === 422) {
    validationErrors.value = error.response.data.errors
    // Display: validationErrors.value.email[0]
  }
}
```

---

## Best Practices

### 1. Always Use DataSource Interface

```typescript
// ✅ Good - Uses adapter pattern
const dataSource = DataSourceFactory.create()
const projects = await dataSource.getProjects()

// ❌ Bad - Directly uses API
const response = await axios.get('/api/v1/projects')
```

### 2. Centralize API Calls in Stores

```typescript
// ✅ Good - Call through store
const projectsStore = useProjectsStore()
await projectsStore.fetchAll()

// ❌ Bad - Direct API call in component
const { data } = await axios.get('/api/v1/projects')
```

### 3. Handle Errors Gracefully

```typescript
// ✅ Good - Try-catch with user feedback
try {
  await store.deleteProject(id)
  toast.success('Project deleted')
} catch (error) {
  toast.error(getErrorMessage(error))
}

// ❌ Bad - No error handling
await store.deleteProject(id)
```

### 4. Type Everything

```typescript
// ✅ Good - Fully typed
async createProject(data: CreateProjectData): Promise<Project> {
  const response = await this.api.post<{ data: Project }>('/projects', data)
  return response.data.data
}

// ❌ Bad - No types
async createProject(data: any): Promise<any> {
  const response = await this.api.post('/projects', data)
  return response.data.data
}
```

### 5. Don't Store Sensitive Data Locally

```typescript
// ✅ Good - Only store token
localStorage.setItem('vsd:auth:token', token)

// ❌ Bad - Never store passwords
localStorage.setItem('password', password)
```

### 6. Clear Auth on Logout

```typescript
// ✅ Good - Clean logout
const logout = async () => {
  try {
    await dataSource.logout() // Tell API
  } finally {
    // Always clear local state
    user.value = null
    token.value = null
    localStorage.removeItem('vsd:auth:token')
    localStorage.removeItem('vsd:auth:user')
  }
}
```

---

## Troubleshooting

### Issue: 401 Unauthorized on All Requests

**Cause**: Token not being sent or invalid

**Solutions**:

1. Check token exists:

```javascript
console.log(localStorage.getItem('vsd:auth:token'))
```

2. Check Axios interceptor adding header:

```javascript
// Should see: Authorization: Bearer {token}
```

3. Log in again to get fresh token

### Issue: CORS Errors

**Cause**: Backend not configured for SPA origin

**Solutions**:

1. Check backend configuration:

```bash
FRONTEND_URL=http://localhost:5173
```

2. Verify CORS configuration allows the SPA origin

3. Restart backend server:
   After updating CORS configuration, restart your backend API server to apply changes.

### Issue: Network Error / Cannot Connect

**Cause**: API URL incorrect or API not running

**Solutions**:

1. Check `VITE_API_URL`:

```bash
# .env
VITE_API_URL=https://vue-slide-demo.test
```

2. Test API manually:

```bash
curl https://vue-slide-demo.test/api/v1/auth/user
```

3. Ensure backend API server is running

### Issue: Data Not Updating

**Cause**: Using wrong data source or caching issue

**Solutions**:

1. Verify data source mode:

```javascript
console.log(import.meta.env.VITE_DATA_SOURCE)
// Should be: 'api'
```

2. Check if actually calling API:

```javascript
// Network tab in DevTools
// Should see requests to /api/v1/*
```

3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)

---

## Related Documentation

- [Configuration Guide](CONFIGURATION.md) - Environment setup
- [Testing Guide](TESTING.md) - Testing API integration
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Vue SPA README](../README.md) - Main documentation

---

**Last Updated**: January 11, 2026
