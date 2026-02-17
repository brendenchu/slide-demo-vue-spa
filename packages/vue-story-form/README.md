# @bchu/vue-story-form

Vue 3 composables and utilities for multi-step story form orchestration. Manages step navigation, page-level slide transitions, form state, progress tracking, and save/validation flow.

## Installation

```bash
pnpm add @bchu/vue-story-form
```

Peer dependencies: `vue ^3.4.0`, `@bchu/vue-slide workspace:*`, `zod ^3.0.0`

## Composables

### `useStoryForm(options)`

Top-level orchestrator for multi-step forms. Manages which step/page is active, direction-aware transitions between sections, save callbacks, and error handling.

```typescript
import { useStoryForm } from '@bchu/vue-story-form'

const { step, page, direction, goToStep, actions, isSaving, saveError } = useStoryForm({
  projectId: 'project-1',
  initialStep: 'intro',
  initialPage: 1,
  onSave: async (step, responses) => { /* persist */ },
  onComplete: async () => { /* mark complete */ },
})
```

### `useSectionForm(props, options)`

Per-section form composable. Manages page navigation within a section, toggled fields (checkbox-controlled pages), and form submission.

```typescript
import { useSectionForm } from '@bchu/vue-story-form'

const { form, currentPage, totalPages, actions, validate } = useSectionForm(props, {
  fields: ['field_a', 'field_b'],
  pages: 3,
  toggledFields: { 1: { checkbox_a: 'field_a' } },
})
```

## Utilities

### Step Configuration

```typescript
import { STEP_CONFIGS, getStepConfig, getStepOrder } from '@bchu/vue-story-form'

getStepConfig('section-b')  // { step: 'section-b', fields: [...], pages: 3 }
getStepOrder('section-a')   // 1
```

### Progress Tracking

```typescript
import { calculateProgress, findLastPosition } from '@bchu/vue-story-form'

calculateProgress(project)   // 0-100
findLastPosition(project)    // { step: 'section-b', page: 2 }
```

### Workflow

```typescript
import { prevNextSteps } from '@bchu/vue-story-form'

prevNextSteps('section-b')  // { prev: 'section-a', next: 'section-c' }
```

### Form Helpers

```typescript
import { delta, nullifyFields, numChecked } from '@bchu/vue-story-form'

delta(page, form, toggledFields)       // 1 or 2 (skip page if no checkboxes checked)
nullifyFields(form, toggledFields, page)  // set unchecked toggled fields to null
numChecked(form, ['a', 'b', 'c'])      // count truthy fields
```

## Types

```typescript
import type {
  Direction,
  ProjectStep,
  StoryProject,
  SectionFormProps,
  StepConfig,
  LastPosition,
} from '@bchu/vue-story-form'
```

## Development

```bash
pnpm build    # vite build + vue-tsc declarations
pnpm test     # vitest (watch mode)
```
