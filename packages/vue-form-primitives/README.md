# @bchu/vue-form-primitives

Vue 3 form input components styled with DaisyUI classes.

## Installation

```bash
pnpm add @bchu/vue-form-primitives
```

Peer dependency: `vue ^3.4.0`

## Components

| Component | Description | Key Props |
|---|---|---|
| `Field` | Text input with `v-model` | `modelValue` |
| `Textarea` | Textarea with `v-model` | `modelValue` |
| `Checkbox` | Checkbox comparing `checked` to `value` | `checked`, `value` |
| `Radio` | Radio button with `v-model`-style binding | `checked`, `value` |
| `Combobox` | Autocomplete input with dropdown | `modelValue`, `options`, `filterLocally` |
| `Label` | Form label (prop or slot content) | `value` |
| `Error` | Validation error message (hidden when empty) | `message` |
| `Fieldset` | Fieldset with legend, query heading, and column layout | `legend`, `query`, `columns` |
| `GroupWrapper` | Flex or grid wrapper for form groups | `grid` |

## Usage

```vue
<script setup>
import { Field, Label, Error, Fieldset } from '@bchu/vue-form-primitives'
import { ref } from 'vue'

const name = ref('')
const error = ref('')
</script>

<template>
  <Fieldset query="What is your name?">
    <Label value="Full Name" />
    <Field v-model="name" />
    <Error :message="error" />
  </Fieldset>
</template>
```

### Combobox

Supports both local filtering and async search:

```vue
<Combobox
  v-model="selected"
  :options="options"
  :filter-locally="true"
  placeholder="Search..."
/>
```

## Development

```bash
pnpm build    # vite build + vue-tsc declarations
pnpm test     # vitest (watch mode)
```
