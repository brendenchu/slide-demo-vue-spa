# Slide Form Demo

Vue 3 + TypeScript SPA with a multi-step slide form system, team-based access control, and a pluggable data source layer supporting local browser storage and REST API backends.

Part of the [`@bchu/monorepo`](../../README.md). Consumes all `@bchu/*` packages.

## Features

- Multi-step slide form system (via `@bchu/vue-slide` + `@bchu/vue-story-form`)
- Adapter pattern for data sources — local/API/hybrid (via `@bchu/vue-persistence`)
- Token-based authentication
- Terms of service acceptance gate (enforced via router guard)
- Team-based access control (owner, admin, member roles)
- Team management with invitations and ownership transfer
- In-app notification system with polling
- 6 switchable DaisyUI themes
- TypeScript strict mode
- Pinia state management (Composition API)
- Zod schema validation
- 121 tests

## Tech Stack

- Vue 3.5 (Composition API)
- TypeScript 5.9
- Vite 6.4
- Pinia 2.3
- Vue Router 4.6
- Tailwind CSS 3.4 + DaisyUI 4
- Axios
- Zod
- VueUse
- Localforage
- tsParticles
- Vitest 4.0

## Installation

```bash
# From monorepo root
pnpm install
cp apps/demo/.env.example apps/demo/.env
pnpm dev
```

Application available at `http://localhost:5173`.

## Data Source Modes

Configure via `VITE_DATA_SOURCE` environment variable.

### Local Mode

```bash
VITE_DATA_SOURCE=local
```

Data stored in browser (localStorage + IndexedDB via localforage). Works offline, no backend required.

### API Mode

```bash
VITE_DATA_SOURCE=api
VITE_API_URL=https://api.your-domain.com
```

Data fetched from REST API with bearer token authentication. Requires backend running with CORS enabled.

### Hybrid Mode

```bash
VITE_DATA_SOURCE=hybrid
```

Not yet implemented. Planned offline-first with background sync.

## Environment Variables

```bash
VITE_DATA_SOURCE=local          # local, api, or hybrid
VITE_API_URL=                   # Required for api/hybrid modes
VITE_STORAGE_PREFIX=vsd         # Key prefix for browser storage
VITE_DEBUG=false                # Enable debug logging
```

## Project Structure

```
src/
  components/           # Vue components
    Story/              # Story form flow (uses @bchu/vue-slide + @bchu/vue-story-form)
    Form/               # Form inputs (uses @bchu/vue-form-primitives)
    Common/             # Shared UI components
    Demo/               # Demo mode components
    Toast/              # Toast notification UI
    Notification/       # Notification panel
    Search/             # Search components
  pages/                # Full-page views
    Auth/               # Login, Register
    Account/            # Profile, Team, Terms
    Story/              # StoryForm, NewStory, ContinueStory, CompleteStory
  router/               # Vue Router configuration + navigation guards
  stores/               # Pinia stores
    auth.ts             # Authentication & terms acceptance
    projects.ts         # Projects CRUD
    teams.ts            # Teams & invitations (API-backed)
    theme.ts            # Theme switching (6 DaisyUI themes)
    toast.ts            # Toast messages
    notifications.ts    # Notification polling
    demo.ts             # Demo mode status
    persistence/        # Data source wiring
      index.ts          # AppModelMap, createDataSource(), storage singleton
      seed.ts           # Demo data seeding
  lib/
    axios.ts            # API client with interceptors
  composables/          # App-specific composition functions
  types/                # TypeScript model interfaces
  validation/           # Zod schemas per form step
  utils/                # Migration utility

tests/
  setup.ts              # Mocks localforage
  unit/
    stores/             # Store unit tests (theme, toast, demo, seed)
    lib/                # Axios utility tests
    utils/              # Migration utility tests
    persistence/        # Data source unit tests (localDataSource, apiDataSource)
  integration/
    stores/             # Store integration tests (auth, projects, notifications, teams)
```

## Routes

### Public (guest-only)

| Path        | Component    | Description       |
| ----------- | ------------ | ----------------- |
| `/login`    | LoginUser    | User login        |
| `/register` | RegisterUser | User registration |

### Protected (auth required)

After login, users who have not accepted the current terms are automatically redirected to `/terms/accept`.

| Path                  | Component       | Description                             |
| --------------------- | --------------- | --------------------------------------- |
| `/dashboard`          | ClientDashboard | Main dashboard                          |
| `/profile`            | EditProfile     | Edit user profile                       |
| `/terms/accept`       | AcceptTerms     | Accept terms of service (gate)          |
| `/team/select`        | SelectTeam      | Select active team                      |
| `/team/create`        | CreateTeam      | Create new team                         |
| `/team/:id`           | ShowTeam        | View team details, members, invitations |
| `/invitations`        | Invitations     | View pending invitations                |
| `/story/new`          | NewStory        | Create new story/project                |
| `/story/:id/continue` | ContinueStory   | Resume story                            |
| `/story/:id/form`     | StoryForm       | Multi-step slide form                   |
| `/story/:id/complete` | CompleteStory   | Completion screen                       |

`/` redirects to `/dashboard`.

## Development

```bash
pnpm dev                # Dev server
pnpm build              # Type-check + production build
pnpm test -- --run      # Run tests (single run)
pnpm type-check         # vue-tsc only
pnpm lint               # ESLint --fix
pnpm format             # Prettier --write
```

## Testing

121 tests across 10 test files:

- **Unit:** localDataSource, apiDataSource, theme store, toast store, demo store, seed data, axios utilities, migration utility
- **Integration:** auth store, projects store, notifications store, teams store

```bash
pnpm test -- --run                      # All tests
pnpm test -- tests/unit/stores          # Tests in a directory
pnpm test -- --reporter=verbose         # Verbose output
```

## Demo Credentials

All demo accounts use the password `password`.

### Local Mode

Login with `demo@example.com` / `password` (seeded on first run).

### API Mode

Use backend database accounts:

| Role        | Email                  |
| ----------- | ---------------------- |
| Super Admin | admin@demo.com         |
| Admin       | admin@example.com      |
| Consultant  | consultant@example.com |
| Client      | client@demo.com        |
| Guest       | guest@demo.com         |

## Data Migration

Migrate from local storage to API backend:

```typescript
import { migrateLocalDataToAPI, downloadLocalDataBackup } from '@/utils/migrate'

await downloadLocalDataBackup()
const result = await migrateLocalDataToAPI('api-token')
```

## Deployment

```bash
pnpm build
```

Deploy `dist/` folder to any static host (Netlify, Vercel, S3 + CloudFront, etc.).

Production configuration:

```bash
VITE_DATA_SOURCE=api
VITE_API_URL=https://api.your-domain.com
```

Ensure backend CORS allows SPA domain.

## License

MIT
