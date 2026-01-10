# Vue SPA Setup Instructions

This document provides step-by-step instructions to set up the Vue SPA project according to the migration plan.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+

## Phase 1: Initial Setup

### Step 1: Install Core Dependencies

```bash
cd vue-spa

# Install Vue 3 and core libraries
npm install vue@^3.5 vue-router@^4.5 pinia@^2.3

# Install VueUse utilities
npm install @vueuse/core@^11.3 @vueuse/head@^2.0

# Install HTTP client and utilities
npm install axios@^1.7 localforage@^1.10 zod@^3.24
```

### Step 2: Install Development Dependencies

```bash
# Install Vite and Vue plugin
npm install -D vite@^6.0 @vitejs/plugin-vue@^5.2

# Install TypeScript
npm install -D typescript@^5.7 vue-tsc@^2.2 @types/node@^22.10

# Install Tailwind CSS and plugins
npm install -D tailwindcss@^3.4 postcss@^8 autoprefixer@^10
npm install -D daisyui@^4.12
npm install -D @tailwindcss/forms @tailwindcss/typography tailwindcss-animate

# Install testing libraries
npm install -D vitest@^2.1 @vue/test-utils@^2.4 happy-dom@^15.11
npm install -D @playwright/test@^1.49

# Install linting and formatting
npm install -D eslint@^9 prettier@^3
npm install -D @vue/eslint-config-typescript @vue/eslint-config-prettier
npm install -D eslint-plugin-vue
```

### Step 3: Configure Vite

Create `vite.config.ts`:

```typescript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    strictPort: false
  }
})
```

### Step 4: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

### Step 5: Configure Tailwind CSS

Copy from parent Laravel project:

```bash
# Copy Tailwind config from Laravel project
cp ../tailwind.config.js ./tailwind.config.ts

# Copy PostCSS config
cp ../postcss.config.js ./postcss.config.js
```

Update paths in `tailwind.config.ts`:

```typescript
// Change from:
content: ['./resources/**/*.{vue,js,ts,jsx,tsx}']

// To:
content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}']
```

### Step 6: Update package.json Scripts

Update `package.json`:

```json
{
  "name": "vue-slide-demo-spa",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "format": "prettier --write src/",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

## Phase 2: Copy Components

### Step 1: Copy Pure Components

From the Laravel project root (`/Users/brendenchu/Code/Projects/PHP/demos/vue-slide-demo`):

```bash
# Copy Slide system (100% portable)
cp -r resources/js/Components/Slide vue-spa/src/components/

# Copy Form components (100% portable)
cp -r resources/js/Components/Form vue-spa/src/components/

# Copy Common UI (mostly portable)
cp -r resources/js/Components/Common vue-spa/src/components/

# Copy Flash system (needs minor refactoring)
cp -r resources/js/Components/Flash vue-spa/src/components/

# Copy Story form components (needs refactoring)
cp -r resources/js/Components/Story vue-spa/src/components/

# Copy Search components
cp -r resources/js/Components/Search vue-spa/src/components/
```

### Step 2: Copy Layouts

```bash
cp -r resources/js/Layouts vue-spa/src/layouts/
```

### Step 3: Copy Pages

```bash
cp -r resources/js/Pages vue-spa/src/pages/
```

### Step 4: Copy Utilities

```bash
cp -r resources/js/utils vue-spa/src/
```

### Step 5: Copy Types

```bash
cp -r resources/js/types vue-spa/src/
```

### Step 6: Copy CSS

```bash
cp resources/css/app.css vue-spa/src/assets/main.css
```

## Phase 3: Create New Files

### Step 1: Create Router

Create `src/router/index.ts` - see MIGRATION_PLAN.md Section 6 for full implementation.

### Step 2: Create Stores

Create Pinia stores - see MIGRATION_PLAN.md Section 5 for full implementations:

- `src/stores/auth.ts`
- `src/stores/flash.ts`
- `src/stores/projects.ts`
- `src/stores/teams.ts`
- `src/stores/admin.ts`

### Step 3: Create Storage Layer

Create persistence layer - see MIGRATION_PLAN.md Section 4:

- `src/stores/persistence/storage.ts`
- `src/stores/persistence/localStorage.ts`
- `src/stores/persistence/indexedDB.ts`
- `src/stores/persistence/seed.ts`

### Step 4: Create Composables

Create Vue composables - see MIGRATION_PLAN.md Section 9:

- `src/composables/useForm.ts`
- `src/composables/useStoryForm.ts`
- `src/composables/useAuth.ts`

### Step 5: Create Utility Helpers

Create `src/utils/route.ts` for route helpers.

## Phase 4: Refactor Components

Follow the refactoring patterns in MIGRATION_PLAN.md Section 9:

1. Replace `@inertiajs/vue3` imports with Vue equivalents
2. Replace `Link` with `RouterLink`
3. Replace `useForm()` with custom composable
4. Replace `usePage()` with Pinia stores
5. Replace `Head` with `@vueuse/head`
6. Replace `route()` helper with router navigation

## Phase 5: Testing

### Step 1: Configure Vitest

Create `vitest.config.ts`:

```typescript
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### Step 2: Configure Playwright

```bash
npx playwright install
```

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
})
```

## Phase 6: Run and Test

### Step 1: Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173

### Step 2: Test Login

Use demo credentials:
- Email: `client@demo.com`
- Password: `password`

### Step 3: Test Form Flow

1. Create new story
2. Fill out multi-step form
3. Save & continue
4. Verify data persistence
5. Complete story

### Step 4: Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## Troubleshooting

### Common Issues

**Issue: Module not found errors**
- Solution: Check `tsconfig.json` paths configuration
- Ensure `@` alias points to `./src`

**Issue: Tailwind classes not working**
- Solution: Verify `tailwind.config.ts` content paths
- Check that `main.css` imports Tailwind directives

**Issue: Components not rendering**
- Solution: Check console for TypeScript errors
- Verify component imports and exports

**Issue: Router not working**
- Solution: Ensure router is registered in `main.ts`
- Check route definitions in `router/index.ts`

**Issue: Store not reactive**
- Solution: Verify Pinia is registered before router
- Check store composition with `defineStore`

## Next Steps

After setup is complete:

1. Review MIGRATION_PLAN.md for detailed refactoring patterns
2. Implement storage layer and seed demo data
3. Refactor components according to migration patterns
4. Write tests for critical paths
5. Perform manual QA testing
6. Optimize bundle size and performance

## Resources

- [Migration Plan](../MIGRATION_PLAN.md)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [DaisyUI Documentation](https://daisyui.com/)
