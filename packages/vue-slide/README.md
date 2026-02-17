# @bchu/vue-slide

Vue 3 slide/carousel component system with index-based positioning, navigation controls, and action buttons.

## Installation

```bash
pnpm add @bchu/vue-slide
```

Peer dependency: `vue ^3.4.0`

## Components

### `Slide` (provider)

Top-level component that renders a `Frame` with positioned `Content` slots and optional `Controls`.

```vue
<script setup>
import { Slide } from '@bchu/vue-slide'
import { ref } from 'vue'

const current = ref(1)
const actions = {
  previous: { label: 'Back', callback: () => current.value-- },
  next: { label: 'Next', callback: () => current.value++ },
}
</script>

<template>
  <Slide :current="current" :pages="3" :actions="actions">
    <template #page-1>First page</template>
    <template #page-2>Second page</template>
    <template #page-3>Third page</template>
  </Slide>
</template>
```

### Sub-components

- **`Frame`** — Container section with `overflow-x-hidden` and relative positioning
- **`Content`** — Positioned slide panel using `translateX` based on `index` vs `current`
- **`Controls`** — Sticky bottom bar with previous/next navigation and page counter
- **`NavigationButton`** — Themed button (`primary`/`secondary`/`neutral`, optional `outline`)
- **`ActionButton`** — Primary action button (e.g., "Close")

## Types

```typescript
import type { Action, State, SlideOptions } from '@bchu/vue-slide'
```

- **`Action`** — `{ label?, forced?, blocked?, callback }` for slide navigation
- **`State`** — `'idle' | 'transitioning' | 'animating' | 'disabled'`
- **`SlideOptions<T>`** — `Record<string, T>` for action configuration

## Development

```bash
pnpm build    # vite build + vue-tsc declarations
pnpm test     # vitest (watch mode)
```
