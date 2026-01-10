# Frontend Testing Guide

**Project**: Vue Slide Demo - Vue 3 SPA
**Last Updated**: January 11, 2026

## Table of Contents

- [Overview](#overview)
- [Test Setup](#test-setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Vue SPA has comprehensive test coverage using Vitest and Vue Test Utils. Tests are organized into unit tests (data sources) and integration tests (Pinia stores).

### Test Statistics

- **Total Tests**: 128 passing
- **Coverage**: 96.49%
- **Test Framework**: Vitest
- **Test Environment**: happy-dom
- **Test Utils**: @vue/test-utils

### Test Organization

```
tests/
├── setup.ts                 # Global test setup
├── unit/                    # Unit tests
│   └── persistence/
│       ├── localDataSource.test.ts  (41 tests)
│       └── apiDataSource.test.ts    (45 tests)
└── integration/             # Integration tests
    └── stores/
        ├── auth.test.ts     (20 tests)
        └── projects.test.ts (22 tests)
```

---

## Test Setup

### Installation

Dependencies are already installed if you ran `npm install`. Test packages include:

```json
{
  "devDependencies": {
    "vitest": "^2.1.8",
    "@vitest/ui": "^2.1.8",
    "@vitest/coverage-v8": "^2.1.8",
    "@vue/test-utils": "^2.4.6",
    "happy-dom": "^15.11.7",
    "vitest-localstorage-mock": "^0.1.2"
  }
}
```

### Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        'dist/',
        '.git/',
        'src/main.ts',
        'src/**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

### Global Setup

**File**: `tests/setup.ts`

```typescript
import { vi } from 'vitest'
import 'vitest-localstorage-mock'

// Mock localforage for testing
vi.mock('localforage', () => {
  const createStoreMock = () => {
    const store: Map<string, unknown> = new Map()

    return {
      getItem: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
      setItem: vi.fn((key: string, value: unknown) => {
        store.set(key, value)
        return Promise.resolve(value)
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key)
        return Promise.resolve()
      }),
      clear: vi.fn(() => {
        store.clear()
        return Promise.resolve()
      }),
      keys: vi.fn(() => Promise.resolve(Array.from(store.keys()))),
      length: vi.fn(() => Promise.resolve(store.size)),
      iterate: vi.fn((iteratorCallback: (value: unknown, key: string) => void) => {
        store.forEach((value, key) => iteratorCallback(value, key))
        return Promise.resolve()
      }),
    }
  }

  const defaultInstance = createStoreMock()

  return {
    default: {
      ...defaultInstance,
      createInstance: vi.fn(() => createStoreMock()),
    },
  }
})
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI (interactive browser interface)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Watch Mode

Watch mode automatically re-runs tests when files change:

```bash
npm run test:watch

# Interactive commands in watch mode:
# a - run all tests
# f - run only failed tests
# t - filter by test name pattern
# q - quit watch mode
```

### UI Mode

UI mode provides an interactive web interface:

```bash
npm run test:ui

# Opens browser at http://localhost:51204/__vitest__/
# Features:
# - Visual test tree
# - Code coverage visualization
# - Test output and errors
# - Re-run individual tests
```

### Coverage Report

Generate HTML coverage report:

```bash
npm run test:coverage

# Output: coverage/index.html
# Open in browser to view coverage details
```

---

## Test Structure

### Test File Naming

Convention: `{filename}.test.ts`

```
src/stores/persistence/apiDataSource.ts
tests/unit/persistence/apiDataSource.test.ts
                      ^^^^^^^^^^^^^^^^.test.ts
```

### Test Organization

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('ApiDataSource', () => {
  describe('Authentication', () => {
    it('logs in with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'password'

      // Act
      const result = await dataSource.login(email, password)

      // Assert
      expect(result.user.email).toBe(email)
      expect(result.token).toBeDefined()
    })

    it('throws error with invalid credentials', async () => {
      // Arrange, Act, Assert
      await expect(dataSource.login('bad@example.com', 'wrong')).rejects.toThrow()
    })
  })

  describe('Projects', () => {
    // More tests...
  })
})
```

---

## Unit Testing

### LocalDataSource Tests

**File**: `tests/unit/persistence/localDataSource.test.ts`

**Coverage**: 41 tests testing local storage operations

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalDataSource } from '@/stores/persistence/localDataSource'
import { storage } from '@/stores/persistence/storage'

// Mock the storage module
vi.mock('@/stores/persistence/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    getAllByPrefix: vi.fn(),
  },
}))

describe('LocalDataSource', () => {
  let dataSource: LocalDataSource

  beforeEach(() => {
    dataSource = new LocalDataSource()
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('authenticates user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      }

      vi.mocked(storage.get).mockResolvedValueOnce([mockUser])

      const result = await dataSource.login('test@example.com', 'password')

      expect(result.user.email).toBe('test@example.com')
      expect(result.token).toBeDefined()
      expect(storage.set).toHaveBeenCalledWith('auth:token', expect.any(String))
    })

    it('throws error with invalid credentials', async () => {
      vi.mocked(storage.get).mockResolvedValueOnce([])

      await expect(dataSource.login('bad@example.com', 'wrong')).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('getProjects', () => {
    it('returns all projects', async () => {
      const mockProjects = [
        { id: '1', label: 'Project 1' },
        { id: '2', label: 'Project 2' },
      ]

      vi.mocked(storage.getAllByPrefix).mockResolvedValueOnce(mockProjects)

      const result = await dataSource.getProjects()

      expect(result).toEqual(mockProjects)
      expect(storage.getAllByPrefix).toHaveBeenCalledWith('project:')
    })
  })
})
```

### ApiDataSource Tests

**File**: `tests/unit/persistence/apiDataSource.test.ts`

**Coverage**: 45 tests testing API operations

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiDataSource } from '@/stores/persistence/apiDataSource'
import { getApiClient } from '@/lib/axios'

// Mock the axios module
vi.mock('@/lib/axios', () => ({
  getApiClient: vi.fn(),
  getErrorMessage: vi.fn((error) => error?.message || 'Unknown error'),
}))

describe('ApiDataSource', () => {
  let dataSource: ApiDataSource
  let mockApi: {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
    vi.mocked(getApiClient).mockReturnValue(mockApi as any)
    dataSource = new ApiDataSource()
  })

  describe('login', () => {
    it('logs in with valid credentials', async () => {
      const mockResponse = {
        data: {
          data: {
            user: { id: '1', email: 'test@example.com' },
            token: 'abc123',
          },
        },
      }

      mockApi.post.mockResolvedValueOnce(mockResponse)

      const result = await dataSource.login('test@example.com', 'password')

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      })
      expect(result.user.email).toBe('test@example.com')
      expect(result.token).toBe('abc123')
    })

    it('throws error with invalid credentials', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Invalid credentials'))

      await expect(dataSource.login('bad@example.com', 'wrong')).rejects.toThrow()
    })
  })

  describe('getProjects', () => {
    it('fetches all projects', async () => {
      const mockProjects = [
        { id: '1', label: 'Project 1' },
        { id: '2', label: 'Project 2' },
      ]

      mockApi.get.mockResolvedValueOnce({
        data: { data: mockProjects },
      })

      const result = await dataSource.getProjects()

      expect(mockApi.get).toHaveBeenCalledWith('/projects')
      expect(result).toEqual(mockProjects)
    })

    it('handles errors when fetching projects', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(dataSource.getProjects()).rejects.toThrow()
    })
  })

  describe('getProject', () => {
    it('returns null for 404 errors', async () => {
      mockApi.get.mockRejectedValueOnce({
        response: { status: 404 },
      })

      const result = await dataSource.getProject('999')

      expect(result).toBeNull()
    })
  })
})
```

---

## Integration Testing

### Auth Store Tests

**File**: `tests/integration/stores/auth.test.ts`

**Coverage**: 20 tests testing auth store integration

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { DataSourceFactory } from '@/stores/persistence/dataSourceFactory'

// Mock the DataSourceFactory
vi.mock('@/stores/persistence/dataSourceFactory', () => ({
  DataSourceFactory: {
    create: vi.fn(() => ({
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
    })),
  },
}))

describe('Auth Store Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('login', () => {
    it('logs in and stores user data', async () => {
      const store = useAuthStore()
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['client'],
        permissions: [],
      }
      const mockToken = 'abc123'

      vi.mocked(DataSourceFactory.create().login).mockResolvedValueOnce({
        user: mockUser,
        token: mockToken,
      })

      await store.login('test@example.com', 'password')

      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(localStorage.getItem('vsd:auth:token')).toBe(mockToken)
    })

    it('throws error on invalid credentials', async () => {
      const store = useAuthStore()

      vi.mocked(DataSourceFactory.create().login).mockRejectedValueOnce(
        new Error('Invalid credentials')
      )

      await expect(store.login('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials')

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears user data on logout', async () => {
      const store = useAuthStore()

      // Set up logged-in state
      store.user = { id: '1', email: 'test@example.com' }
      localStorage.setItem('vsd:auth:token', 'token123')

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('vsd:auth:token')).toBeNull()
    })
  })

  describe('permissions', () => {
    it('checks if user has permission', () => {
      const store = useAuthStore()
      store.user = {
        id: '1',
        email: 'test@example.com',
        permissions: ['view-project', 'create-project'],
      }

      expect(store.can('view-project')).toBe(true)
      expect(store.can('delete-project')).toBe(false)
    })

    it('checks if user has role', () => {
      const store = useAuthStore()
      store.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['client'],
      }

      expect(store.hasRole('client')).toBe(true)
      expect(store.hasRole('admin')).toBe(false)
    })
  })
})
```

### Projects Store Tests

**File**: `tests/integration/stores/projects.test.ts`

**Coverage**: 22 tests testing projects store integration

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectsStore } from '@/stores/projects'
import { DataSourceFactory } from '@/stores/persistence/dataSourceFactory'

vi.mock('@/stores/persistence/dataSourceFactory', () => ({
  DataSourceFactory: {
    create: vi.fn(() => ({
      getProjects: vi.fn(),
      getProject: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
      saveResponses: vi.fn(),
      completeProject: vi.fn(),
    })),
  },
}))

describe('Projects Store Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchAll', () => {
    it('fetches all projects', async () => {
      const store = useProjectsStore()
      const mockProjects = [
        { id: '1', label: 'Project 1', status: 'draft' },
        { id: '2', label: 'Project 2', status: 'completed' },
      ]

      vi.mocked(DataSourceFactory.create().getProjects).mockResolvedValueOnce(mockProjects)

      await store.fetchAll()

      expect(store.projects).toEqual(mockProjects)
    })
  })

  describe('computed getters', () => {
    it('filters completed projects', async () => {
      const store = useProjectsStore()
      store.projects = [
        { id: '1', status: 'draft' },
        { id: '2', status: 'completed' },
        { id: '3', status: 'completed' },
      ]

      expect(store.completedProjects).toHaveLength(2)
    })

    it('filters draft projects', async () => {
      const store = useProjectsStore()
      store.projects = [
        { id: '1', status: 'draft' },
        { id: '2', status: 'completed' },
      ]

      expect(store.draftProjects).toHaveLength(1)
    })
  })

  describe('create', () => {
    it('creates project and adds to list', async () => {
      const store = useProjectsStore()
      const newProject = { id: '3', label: 'New Project' }

      vi.mocked(DataSourceFactory.create().createProject).mockResolvedValueOnce(newProject)

      await store.create({ label: 'New Project' })

      expect(store.projects).toContainEqual(newProject)
    })
  })

  describe('deleteProject', () => {
    it('deletes project and removes from list', async () => {
      const store = useProjectsStore()
      store.projects = [
        { id: '1', label: 'Project 1' },
        { id: '2', label: 'Project 2' },
      ]

      await store.deleteProject('1')

      expect(store.projects).toHaveLength(1)
      expect(store.projects[0].id).toBe('2')
    })
  })
})
```

---

## Writing Tests

### Testing Best Practices

#### 1. Arrange-Act-Assert Pattern

```typescript
it('creates a new project', async () => {
  // Arrange - Set up test data and mocks
  const projectData = { label: 'Test Project', description: 'Test' }
  mockApi.post.mockResolvedValueOnce({ data: { data: newProject } })

  // Act - Perform the action
  const result = await dataSource.createProject(projectData)

  // Assert - Verify the results
  expect(result.id).toBeDefined()
  expect(result.label).toBe('Test Project')
})
```

#### 2. Clear Mocks Between Tests

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})
```

#### 3. Test Success and Error Cases

```typescript
describe('login', () => {
  it('succeeds with valid credentials', async () => {
    // Test success
  })

  it('fails with invalid credentials', async () => {
    // Test error
  })

  it('handles network errors', async () => {
    // Test network failure
  })
})
```

#### 4. Use Descriptive Test Names

```typescript
// ✅ Good - Clear what is being tested
it('logs in with valid credentials', async () => { ... })
it('throws error with invalid credentials', async () => { ... })
it('stores token in localStorage after login', async () => { ... })

// ❌ Bad - Vague or unclear
it('works', async () => { ... })
it('test login', async () => { ... })
```

### Mocking Strategies

#### Mock Modules

```typescript
vi.mock('@/lib/axios', () => ({
  getApiClient: vi.fn(),
  getErrorMessage: vi.fn(),
}))
```

#### Mock Return Values

```typescript
mockApi.get.mockResolvedValueOnce({ data: { data: mockData } })
mockApi.post.mockRejectedValueOnce(new Error('Failed'))
```

#### Mock Implementation

```typescript
vi.mocked(storage.get).mockImplementation((key: string) => {
  if (key === 'users') return Promise.resolve([mockUser])
  return Promise.resolve(null)
})
```

---

## Coverage

### Current Coverage

```
Test Files: 4 passed (4)
     Tests: 128 passed (128)
  Coverage: 96.49%
```

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html

# View in terminal
npm run test -- --coverage
```

### Coverage By File

| File                 | Coverage |
| -------------------- | -------- |
| `localDataSource.ts` | 100%     |
| `apiDataSource.ts`   | 100%     |
| `auth.ts`            | 95.2%    |
| `projects.ts`        | 93.7%    |

### Coverage Thresholds

**Configuration** (in `vitest.config.ts`):

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

---

## Troubleshooting

### Issue: Tests Failing After Changes

**Solution**:

```bash
# Clear test cache
npx vitest --clearCache

# Run tests again
npm run test
```

### Issue: Mocks Not Working

**Solution**:

```typescript
// Ensure mock is set up before import
vi.mock('@/lib/axios')

// Import AFTER mock
import { getApiClient } from '@/lib/axios'
```

### Issue: LocalStorage Not Mocked

**Solution**:

```bash
# Install vitest-localstorage-mock
npm install -D vitest-localstorage-mock

# Import in tests/setup.ts
import 'vitest-localstorage-mock'
```

### Issue: Coverage Not Updating

**Solution**:

```bash
# Delete coverage directory
rm -rf coverage

# Regenerate
npm run test:coverage
```

---

## Related Documentation

- [Configuration Guide](CONFIGURATION.md) - Environment setup
- [API Integration Guide](API_INTEGRATION.md) - API integration
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Vue SPA README](../README.md) - Main documentation

### External Resources

- [Vitest Documentation](https://vitest.dev)
- [Vue Test Utils](https://test-utils.vuejs.org)
- [Happy-DOM](https://github.com/capricorn86/happy-dom)

---

**Last Updated**: January 11, 2026
