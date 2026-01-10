# Vue Slide Demo SPA

A standalone Vue 3 SPA demonstrating a multi-step slide form system with TypeScript, Vue Router, Pinia, and Tailwind CSS.

## Overview

This project is a migration of the Laravel + Inertia.js slide form application to a pure Vue 3 SPA. It preserves the excellent slide form system and component architecture while replacing server-side dependencies with client-side Vue paradigms.

## Features

- **Multi-step Slide Form System** - Smooth animated transitions between form steps
- **Role-based Access Control** - Client, Consultant, Admin, Super Admin roles
- **Client-side Data Persistence** - LocalStorage + IndexedDB hybrid storage
- **TypeScript** - Full type safety throughout the application
- **Vue 3 Composition API** - Modern, maintainable component structure
- **Tailwind CSS + DaisyUI** - Beautiful, customizable UI components

## Tech Stack

### Core
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server

### Routing & State
- **Vue Router** - Client-side routing
- **Pinia** - State management

### UI
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind

### Data Persistence
- **LocalStorage** - Simple key-value storage
- **IndexedDB** - Complex object storage via LocalForage

### Utilities
- **@vueuse/core** - Vue composition utilities
- **@vueuse/head** - Document head management
- **Axios** - HTTP client
- **Zod** - Schema validation

## Project Structure

```
vue-spa/
├── src/
│   ├── assets/          # CSS, images
│   ├── components/      # Reusable Vue components
│   ├── composables/     # Vue composables
│   ├── layouts/         # Layout components
│   ├── pages/           # Page components
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia stores
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── public/              # Static assets
├── index.html           # HTML entry point
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use latest LTS)
- npm 9+ or pnpm 8+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

```bash
# Run type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e
```

## Demo Credentials

### Client User
- Email: `client@demo.com`
- Password: `password`

### Admin User
- Email: `admin@demo.com`
- Password: `password`

## Key Features Preserved from Laravel App

### Slide Form System
- `SlideProvider` - Main provider component managing slide state
- `SlideContent` - Content container with directional transitions
- `SlideControls` - Navigation buttons and page indicators
- Full TypeScript type definitions

### Form Components
- `FormField` - Text/number input with validation
- `FormCheckbox` - Checkbox with v-model support
- `FormRadio` - Radio button options
- `FormLabel`, `FormError`, `FormFieldset` - Supporting form components

### Progress Tracking
- `ProgressBar` - Linear progress indicator
- `ProgressTimeline` - Step-based timeline navigation

### Flash Messages
- `FlashProvider` - Auto-dismissing notification system
- `FlashModal` - Toast-style messages

## Migration from Laravel + Inertia

This project was migrated from a Laravel + Inertia.js application. Key changes:

| Laravel/Inertia | Vue SPA Replacement |
|----------------|---------------------|
| `useForm()` | Custom `useForm()` composable |
| `usePage()` | Pinia stores |
| `Link` component | `RouterLink` |
| `route()` helper | Route name mapping |
| `Head` component | `@vueuse/head` |
| Laravel backend | Mock API + IndexedDB |
| Database | LocalStorage + IndexedDB |

See [MIGRATION_PLAN.md](../MIGRATION_PLAN.md) for comprehensive migration documentation.

## Data Persistence

The application uses a hybrid storage approach:

- **LocalStorage** - User auth tokens, profiles, settings (small, frequently accessed data)
- **IndexedDB** - Form responses, completed stories (large objects, versioning)

### Storage Keys Convention

All keys are prefixed with `vsd:` for namespace isolation:

```
vsd:auth:token         # JWT token
vsd:auth:user          # Current user object
vsd:settings           # App settings
user:{id}              # User by ID
project:{id}           # Project by ID
```

### Data Export/Import

Users can export and import their demo data:

1. Go to Settings → Export Data
2. Download JSON file
3. Import on another device/browser via Settings → Import Data

## Component Architecture

### Preserved Components (95-100% Portable)
- ✅ Slide System
- ✅ Form Components
- ✅ Common UI Components
- ✅ Flash System
- ✅ Utility Functions

### Refactored Components (60-80% Portable)
- 🔄 Story Form Sections
- 🔄 Layouts
- 🔄 Progress Components
- 🔄 Navigation Components

### Rewritten Components (30-50% Portable)
- ⚠️ Auth Pages
- ⚠️ Dashboard Pages
- ⚠️ Admin Pages

## State Management

### Pinia Stores

- **auth.ts** - Authentication, current user, permissions
- **flash.ts** - Flash messages, notifications
- **projects.ts** - Story/project management, CRUD operations
- **teams.ts** - Team data
- **admin.ts** - Admin functionality

### Composables

- **useForm.ts** - Form state management (Inertia replacement)
- **useStoryForm.ts** - Story-specific form logic
- **useAuth.ts** - Auth helpers
- **usePagination.ts** - Client-side pagination

## Testing

### Unit Tests (Vitest)

```bash
npm run test
```

Tests are located in `src/**/__tests__/*.spec.ts`

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Tests are located in `e2e/*.spec.ts`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+

## Known Limitations

- Demo application - not intended for production use
- Client-side storage only - data stored locally in browser
- No real backend API - uses mock data
- Browser storage limits apply (~10MB LocalStorage, ~50MB+ IndexedDB)

## License

MIT

## Credits

Migrated from Laravel + Inertia.js application by Brenden Chu.
