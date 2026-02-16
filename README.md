# Vue Slide Demo SPA

Vue 3 + TypeScript SPA with flexible data source abstraction supporting local browser storage and REST API backends.

## Features

- Multi-step slide form system
- Adapter pattern for data sources (local/API/hybrid)
- Token-based authentication
- Terms of service acceptance gate (enforced via router guard)
- Team-based access control (owner, admin, member roles)
- Team management with invitations and ownership transfer
- In-app notification system
- TypeScript with strict mode
- Pinia state management
- Zod schema validation
- 100 tests

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
npm install
cp .env.example .env
npm run dev
```

Application available at `http://localhost:5173`

## Data Source Modes

Configure via `VITE_DATA_SOURCE` environment variable.

### Local Mode

```bash
VITE_DATA_SOURCE=local
```

Data stored in browser (LocalStorage + IndexedDB via Localforage). Works offline, no backend required.

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
# Application
VITE_APP_NAME="Vue Slide Demo"
VITE_APP_URL=http://localhost:5173

# Storage
VITE_STORAGE_PREFIX=vsd

# Data Source Mode (local, api, hybrid)
VITE_DATA_SOURCE=local
VITE_API_URL=  # Required for api/hybrid modes

# Debug Mode
VITE_DEBUG=false
```

## Project Structure

```
src/
├── components/           # Vue components
│   ├── Slide/           # Slide form system
│   ├── Form/            # Form inputs
│   └── Common/          # Shared UI
├── router/              # Vue Router configuration
├── pages/               # Full-page views
│   └── Account/
│       └── AcceptTerms.vue
├── stores/              # Pinia stores
│   ├── auth.ts          # Authentication & terms acceptance
│   ├── projects.ts      # Projects
│   ├── teams.ts         # Teams & ownership
│   ├── flash.ts         # Flash messages
│   └── persistence/     # Data source layer
│       ├── types.ts
│       ├── dataSourceFactory.ts
│       ├── localDataSource.ts
│       ├── apiDataSource.ts
│       └── storage.ts
├── lib/                 # Libraries
│   └── axios.ts
├── types/               # TypeScript types
├── utils/               # Utilities (migration, helpers)
├── App.vue
└── main.ts

tests/
├── unit/
│   └── persistence/     # Data source unit tests
└── integration/
    └── stores/          # Store integration tests
```

## Routes

### Public (guest-only)

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | LoginUser | User login |
| `/register` | RegisterUser | User registration |

### Protected (auth required)

> After login, users who have not accepted the current terms are automatically redirected to `/terms/accept`. All other protected routes are blocked by a router navigation guard until terms are accepted.

| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | ClientDashboard | Main dashboard |
| `/profile` | EditProfile | Edit user profile |
| `/terms/accept` | AcceptTerms | Accept terms of service (gate) |
| `/team/select` | SelectTeam | Select active team |
| `/team/create` | CreateTeam | Create new team |
| `/team/:id` | ShowTeam | View team details, members, invitations |
| `/invitations` | Invitations | View pending invitations |
| `/story/new` | NewStory | Create new story/project |
| `/story/:id/continue` | ContinueStory | Resume story |
| `/story/:id/form` | StoryForm | Multi-step slide form |
| `/story/:id/complete` | CompleteStory | Completion screen |

`/` redirects to `/dashboard`.

## Development

```bash
# Development server
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Tests
npm run test
npm run test:e2e

# Code quality
npm run type-check
npm run lint
npm run format
```

## Testing

```bash
npm run test
```

100 tests passing across 4 test files:

- Unit: localDataSource, apiDataSource
- Integration: auth store, projects store

## Data Migration

Migrate from local storage to API backend:

```typescript
import { migrateLocalDataToAPI, downloadLocalDataBackup } from '@/utils/migrate'

// Backup first
await downloadLocalDataBackup()

// Migrate
const result = await migrateLocalDataToAPI('api-token')
console.log(`Migrated ${result.projectsMigrated} projects`)
```

Migrates:
- Projects (title, description, status)
- Project responses and form data
- Completion status

Does not migrate:
- User accounts (register via API)
- Teams (managed by admins)
- Authentication tokens

## Demo Credentials

All demo accounts use the password `password`.

### Local Mode

Any credentials work. Suggested: `client@demo.com` / `password`

### API Mode

Use backend database accounts:

| Role        | Email                    |
|-------------|--------------------------|
| Super Admin | admin@demo.com           |
| Admin       | admin@example.com        |
| Consultant  | consultant@example.com   |
| Client      | client@demo.com          |
| Guest       | guest@demo.com           |

## Deployment

```bash
npm run build
```

Deploy `dist/` folder to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages
- Nginx
- Any static host

Production configuration:

```bash
VITE_DATA_SOURCE=api
VITE_API_URL=https://api.your-domain.com
```

Ensure backend CORS allows SPA domain.

## Troubleshooting

**Cannot connect to API**
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Test API: `curl https://api.local.test/api/v1/auth/user`
- Check CORS configuration

**401 Unauthorized**
- Token may be expired (24-hour default)
- Try logging in again
- Clear browser cache and localStorage

**Stuck on terms acceptance page**
- The API returns `must_accept_terms: true` on the user resource until terms are accepted
- The router guard redirects to `/terms/accept` while this flag is set
- Accept terms or log out and back in after terms are accepted server-side

**Data not persisting (local mode)**
- Check browser allows LocalStorage/IndexedDB
- Verify `VITE_STORAGE_PREFIX` is set
- Check storage quota not exceeded

**Module not found**
- Delete node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server

**Type errors**
- Run `npm run type-check`
- Verify dependencies: `npm install`

Enable debug logging:

```bash
VITE_DEBUG=true
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## License

MIT
