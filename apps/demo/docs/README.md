# Vue SPA Documentation

**Project**: Vue Slide Demo - Vue 3 + TypeScript SPA
**Last Updated**: January 11, 2026

## Overview

This directory contains comprehensive documentation for the Vue SPA frontend. The application uses an adapter pattern to support both local browser storage and API-backed data persistence.

---

## Quick Links

### Getting Started

- [Main README](../README.md) - Project overview and quick start
- [Configuration Guide](CONFIGURATION.md) - Environment variables and setup

### Development

- [API Integration Guide](API_INTEGRATION.md) - Frontend API integration patterns
- [Testing Guide](TESTING.md) - Running and writing tests

### Production

- [Deployment Guide](DEPLOYMENT.md) - Deploy to various platforms

---

## Documentation Index

### 1. [Configuration Guide](CONFIGURATION.md)

Complete guide to configuring the Vue SPA.

**Topics Covered:**

- Environment variables reference
- Data source modes (local, API, hybrid)
- Development setup for each mode
- Production configuration
- Troubleshooting common configuration issues

**When to use:**

- Setting up the project for the first time
- Switching between local and API modes
- Configuring for production deployment
- Troubleshooting environment issues

---

### 2. [API Integration Guide](API_INTEGRATION.md)

Deep dive into how the Vue SPA integrates with a REST API backend.

**Topics Covered:**

- Adapter pattern architecture
- DataSource interface and implementations
- Authentication flow (login, logout, token management)
- Pinia store integration
- Error handling patterns
- Best practices for API integration

**When to use:**

- Understanding the application architecture
- Implementing new API endpoints
- Debugging API integration issues
- Learning the adapter pattern implementation

---

### 3. [Testing Guide](TESTING.md)

Guide to testing the Vue SPA frontend.

**Topics Covered:**

- Test setup and configuration
- Running tests (unit, integration, coverage)
- Test structure and organization
- Writing new tests
- Mocking strategies
- Coverage reports

**When to use:**

- Running tests before deployment
- Writing tests for new features
- Understanding test coverage
- Debugging test failures

**Current Test Stats:**

- 128 tests passing
- 96.49% code coverage
- 41 LocalDataSource unit tests
- 45 ApiDataSource unit tests
- 20 Auth store integration tests
- 22 Projects store integration tests

---

### 4. [Deployment Guide](DEPLOYMENT.md)

Comprehensive guide for deploying the Vue SPA to production.

**Topics Covered:**

- Build process and verification
- Platform-specific deployment guides:
  - Netlify (recommended for beginners)
  - Vercel (recommended for developers)
  - AWS S3 + CloudFront (enterprise)
  - Nginx (self-hosted)
  - Apache (shared hosting)
  - GitHub Pages (open source)
- Backend coordination (CORS setup)
- Environment configuration
- Post-deployment checklist
- Troubleshooting deployment issues

**When to use:**

- Deploying to production
- Setting up CI/CD pipelines
- Configuring hosting platforms
- Troubleshooting deployment issues

---

## Architecture Overview

### Adapter Pattern

The Vue SPA uses an adapter pattern for data persistence:

```
Vue Components
    ↓
Pinia Stores
    ↓
DataSourceFactory
    ↓
┌─────────────┬─────────────┬──────────────┐
│LocalDataSource│ApiDataSource│HybridDataSource│
└─────────────┴─────────────┴──────────────┘
```

**Benefits:**

- Switch between data sources with environment variable
- Single codebase for multiple backends
- Easy to test with mock implementations
- Future-proof for offline-first hybrid mode

### Data Source Modes

| Mode       | Status      | Storage                            | Use Case           |
| ---------- | ----------- | ---------------------------------- | ------------------ |
| **Local**  | ✅ Complete | Browser (LocalStorage + IndexedDB) | Development, demos |
| **API**    | ✅ Complete | REST API (Bearer token auth)       | Production         |
| **Hybrid** | 🚧 Phase 5  | Local + API sync queue             | Offline-first PWA  |

---

## Key Technologies

### Core

- **Vue 3** (Composition API) - Reactive UI framework
- **TypeScript** - Type safety and IDE support
- **Vite** - Fast build tool and dev server
- **Pinia** - State management

### UI & Styling

- **Tailwind CSS** - Utility-first CSS
- **DaisyUI** - Component library
- **Headless UI** - Accessible components
- **Heroicons** - Icon library

### Data & HTTP

- **Axios** - HTTP client for API requests
- **LocalForage** - IndexedDB wrapper
- **Zod** - Schema validation

### Testing

- **Vitest** - Unit and integration testing
- **@vue/test-utils** - Vue component testing
- **Happy-DOM** - Lightweight DOM environment

---

## Common Tasks

### Setup for Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Configure data source
# For local mode: VITE_DATA_SOURCE=local
# For API mode: VITE_DATA_SOURCE=api and VITE_API_URL=...

# 4. Start dev server
npm run dev
```

### Run Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

### Build for Production

```bash
# 1. Create production env file
cp .env.example .env.production

# 2. Configure for production
# VITE_DATA_SOURCE=api
# VITE_API_URL=https://api.yourdomain.com
# VITE_DEBUG=false

# 3. Build
npm run build

# 4. Preview
npm run preview

# 5. Deploy dist/ folder
```

### Switch Data Source Modes

```bash
# Local mode (browser storage only)
echo "VITE_DATA_SOURCE=local" > .env

# API mode (connect to backend)
echo "VITE_DATA_SOURCE=api" > .env
echo "VITE_API_URL=https://vue-slide-demo.test" >> .env

# Restart dev server
npm run dev
```

---

## File Structure

```
vue-spa/
├── docs/                    # 📚 This documentation
│   ├── README.md           # Documentation index (you are here)
│   ├── CONFIGURATION.md    # Environment and setup
│   ├── API_INTEGRATION.md  # API integration guide
│   ├── TESTING.md          # Testing guide
│   └── DEPLOYMENT.md       # Deployment guide
├── src/
│   ├── stores/             # Pinia stores
│   │   ├── auth.ts         # Authentication store
│   │   ├── projects.ts     # Projects store
│   │   └── persistence/    # 🎯 Data layer (adapter pattern)
│   │       ├── types.ts                # DataSource interface
│   │       ├── dataSourceFactory.ts    # Factory
│   │       ├── localDataSource.ts      # Local implementation
│   │       ├── apiDataSource.ts        # API implementation
│   │       └── storage.ts              # Storage adapters
│   ├── components/         # Vue components
│   ├── lib/
│   │   └── axios.ts        # Axios configuration
│   ├── types/
│   │   └── models.ts       # TypeScript data models
│   └── utils/              # Utility functions
├── tests/                  # Test files
│   ├── setup.ts            # Global test setup
│   ├── unit/               # Unit tests (data sources)
│   └── integration/        # Integration tests (stores)
├── .env.example            # Environment template
├── README.md               # Main documentation
└── package.json
```

---

## Additional Resources

### External Documentation

- [Vue 3 Documentation](https://vuejs.org)
- [Vite Documentation](https://vitejs.dev)
- [Pinia Documentation](https://pinia.vuejs.org)
- [Vitest Documentation](https://vitest.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

---

## Getting Help

### Troubleshooting

Each guide has a dedicated troubleshooting section:

- [Configuration Troubleshooting](CONFIGURATION.md#troubleshooting)
- [API Integration Troubleshooting](API_INTEGRATION.md#troubleshooting)
- [Testing Troubleshooting](TESTING.md#troubleshooting)
- [Deployment Troubleshooting](DEPLOYMENT.md#troubleshooting)

### Common Issues

1. **Environment variables not working** → See [Configuration Guide](CONFIGURATION.md#issue-environment-variables-not-loading)
2. **Cannot connect to API** → See [Configuration Guide](CONFIGURATION.md#issue-cannot-connect-to-api)
3. **401 Unauthorized errors** → See [API Integration Guide](API_INTEGRATION.md#issue-401-unauthorized-on-all-requests)
4. **Tests failing** → See [Testing Guide](TESTING.md#issue-tests-failing-after-changes)
5. **404 on page refresh** → See [Deployment Guide](DEPLOYMENT.md#issue-404-on-page-refresh)

---

## Contributing

When adding new documentation:

1. **Update this index** - Add links to new docs
2. **Follow the template**:
   - Table of contents at top
   - Overview section
   - Main content organized by topic
   - Troubleshooting section
   - Related documentation links
   - Last updated date
3. **Cross-link related docs** - Help readers navigate
4. **Include code examples** - Show, don't just tell
5. **Test all commands** - Ensure accuracy

---

**Last Updated**: January 11, 2026
