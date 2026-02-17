# Slide Form Demo

pnpm monorepo containing a Vue 3 + TypeScript SPA with a multi-step slide form system, team-based access control, and a pluggable data source layer (browser storage or REST API).

## Monorepo Structure

```
apps/
  demo/                     # Vue 3 SPA
packages/
  utils/                    # @bchu/utils — pure TS utility functions
  vue-slide/                # @bchu/vue-slide — slide/carousel component system
  vue-form-primitives/      # @bchu/vue-form-primitives — form input components
  vue-story-form/           # @bchu/vue-story-form — multi-step form orchestration
  vue-persistence/          # @bchu/vue-persistence — data source abstraction layer
```

## Requirements

- Node.js >= 24
- pnpm >= 10

## Getting Started

```bash
pnpm install
cp apps/demo/.env.example apps/demo/.env
pnpm dev
```

Application available at `http://localhost:5173`.

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Vite dev server (demo app) |
| `pnpm build` | Build all packages + demo app (topological order) |
| `pnpm build:packages` | Build packages only |
| `pnpm test -- --run` | Run all 333 tests across all workspaces |
| `pnpm lint` | ESLint --fix (workspaces with lint configured) |
| `pnpm format` | Prettier --write (workspaces with format configured) |

## Packages

| Package | Description | Tests |
|---|---|---|
| [`@bchu/utils`](packages/utils) | `divide`, `toMoney`, `toPercent`, `delay` | 25 |
| [`@bchu/vue-slide`](packages/vue-slide) | `Slide` provider with `Frame`, `Content`, `Controls` | 19 |
| [`@bchu/vue-form-primitives`](packages/vue-form-primitives) | `Field`, `Checkbox`, `Radio`, `Combobox`, `Textarea`, `Label`, `Error`, `Fieldset` | 33 |
| [`@bchu/vue-story-form`](packages/vue-story-form) | `useStoryForm`, `useSectionForm`, step config, progress tracking | 38 |
| [`@bchu/vue-persistence`](packages/vue-persistence) | `DataSourceFactory`, `LocalDataSource`, `ApiDataSource`, `HybridStorage` | 97 |
| [demo app](apps/demo) | Vue 3 SPA consuming all packages | 121 |

## License

MIT
