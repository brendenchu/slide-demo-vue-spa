# Vue Slide Demo SPA

Vue 3 + TypeScript SPA with flexible data source abstraction supporting local browser storage and REST API backends.

## Features

- Multi-step slide form system
- Adapter pattern for data sources (local/API/hybrid)
- Token-based authentication
- Role-based access control
- TypeScript with strict mode
- Pinia state management
- Team ownership and transfer
- 128 tests

## Tech Stack

- Vue 3 (Composition API)
- TypeScript 5+
- Vite 6+
- Pinia
- Vue Router 4+
- Tailwind CSS 3+
- DaisyUI
- Axios
- Vitest

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

Data stored in browser (LocalStorage + IndexedDB). Works offline, no backend required.

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
VITE_APP_NAME="Vue Slide Demo"
VITE_STORAGE_PREFIX=vsd
VITE_DATA_SOURCE=local
VITE_API_URL=
VITE_DEBUG=false
```

## Project Structure

```
src/
├── components/           # Vue components
│   ├── Slide/           # Slide form system
│   ├── Form/            # Form inputs
│   └── Common/          # Shared UI
├── stores/              # Pinia stores
│   ├── auth.ts          # Authentication
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
├── utils/               # Utilities
├── App.vue
└── main.ts

tests/
├── unit/
│   └── persistence/
└── integration/
    └── stores/
```

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
npm run test:coverage

# Code quality
npm run type-check
npm run lint
npm run format
```

## Testing

```bash
npm run test
```

128 tests passing:

- Unit: 86 tests (localDataSource: 41, apiDataSource: 45)
- Integration: 42 tests (auth: 20, projects: 22)

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

### Local Mode

Any credentials work. Suggested:

- client@demo.com / password
- admin@demo.com / password

### API Mode

Use backend database accounts:

- client@demo.com / password (Client role)
- admin@demo.com / password (Super Admin role)
- consultant@example.com / password (Consultant role)
- guest@demo.com / password (Guest role)

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

- Token may be expired
- Try logging in again
- Clear browser cache and localStorage

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
- Update TypeScript: `npm install -D typescript@latest`

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
