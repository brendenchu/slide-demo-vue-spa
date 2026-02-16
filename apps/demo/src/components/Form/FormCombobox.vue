<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

interface ComboboxOption {
  value: string
  label: string
  description?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: ComboboxOption[]
    placeholder?: string
    loading?: boolean
    filterLocally?: boolean
    noResultsText?: string
  }>(),
  {
    placeholder: '',
    loading: false,
    filterLocally: true,
    noResultsText: 'No matches found',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
  select: [option: ComboboxOption]
}>()

const input = ref<HTMLInputElement | null>(null)
const wrapper = ref<HTMLDivElement | null>(null)
const query = ref('')
const selectedLabel = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(-1)

// Initialize from modelValue if options are available
const initialMatch = props.options.find((o) => o.value === props.modelValue)
if (initialMatch) {
  query.value = initialMatch.label
  selectedLabel.value = initialMatch.label
}

const displayOptions = computed(() => {
  if (!props.filterLocally) return props.options
  if (!query.value) return props.options
  const q = query.value.toLowerCase()
  return props.options.filter((o) => o.label.toLowerCase().includes(q))
})

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      query.value = ''
      selectedLabel.value = ''
      return
    }
    if (props.filterLocally) {
      const match = props.options.find((o) => o.value === val)
      if (match) {
        query.value = match.label
        selectedLabel.value = match.label
      }
    }
  }
)

// When options change, resolve current modelValue and update highlight for async mode
watch(
  () => props.options,
  (opts) => {
    if (props.modelValue && !selectedLabel.value) {
      const match = opts.find((o) => o.value === props.modelValue)
      if (match) {
        query.value = match.label
        selectedLabel.value = match.label
      }
    }
    if (!props.filterLocally && isOpen.value) {
      highlightedIndex.value = opts.length > 0 ? 0 : -1
    }
  }
)

function selectOption(option: ComboboxOption): void {
  query.value = option.label
  selectedLabel.value = option.label
  emit('update:modelValue', option.value)
  emit('select', option)
  isOpen.value = false
  highlightedIndex.value = -1
}

function onInput(event: Event): void {
  const val = (event.target as HTMLInputElement).value
  query.value = val
  isOpen.value = true
  highlightedIndex.value = 0

  if (props.filterLocally) {
    const match = props.options.find((o) => o.label.toLowerCase() === val.toLowerCase())
    emit('update:modelValue', match ? match.value : '')
  } else {
    emit('update:modelValue', '')
    emit('search', val)
  }
}

function onFocus(): void {
  if (props.filterLocally) {
    isOpen.value = true
    highlightedIndex.value = -1
  } else if (displayOptions.value.length > 0) {
    isOpen.value = true
    highlightedIndex.value = -1
  }
}

function onClickOutside(event: MouseEvent): void {
  if (wrapper.value && !wrapper.value.contains(event.target as Node)) {
    isOpen.value = false
    if (props.modelValue && selectedLabel.value) {
      query.value = selectedLabel.value
    }
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (!isOpen.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (displayOptions.value.length > 0) {
        isOpen.value = true
        event.preventDefault()
      }
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, displayOptions.value.length - 1)
      scrollToHighlighted()
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter': {
      event.preventDefault()
      const selected = displayOptions.value[highlightedIndex.value]
      if (highlightedIndex.value >= 0 && selected) {
        selectOption(selected)
      }
      break
    }
    case 'Escape':
      isOpen.value = false
      break
  }
}

function scrollToHighlighted(): void {
  const list = wrapper.value?.querySelector('[role="listbox"]')
  const item = list?.children[highlightedIndex.value] as HTMLElement | undefined
  item?.scrollIntoView({ block: 'nearest' })
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  if (input.value?.hasAttribute('autofocus')) {
    input.value?.focus()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div ref="wrapper" class="relative">
    <input
      ref="input"
      v-bind="$attrs"
      type="text"
      class="input input-bordered input-md w-full"
      :value="query"
      :placeholder="placeholder"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="isOpen"
      @input="onInput"
      @focus="onFocus"
      @keydown="onKeydown"
    />

    <!-- Loading spinner (async mode) -->
    <div
      v-if="isOpen && loading"
      class="absolute z-50 mt-1 w-full rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm text-base-content/60 shadow-lg flex items-center gap-2"
    >
      <svg
        class="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      Searching...
    </div>

    <!-- Options list -->
    <ul
      v-show="isOpen && !loading && displayOptions.length > 0"
      role="listbox"
      class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"
    >
      <li
        v-for="(option, index) in displayOptions"
        :key="option.value"
        role="option"
        :aria-selected="option.value === modelValue"
        class="cursor-pointer px-4 py-2 text-sm"
        :class="{
          'bg-primary text-primary-content': index === highlightedIndex,
          'bg-base-200 font-medium': option.value === modelValue && index !== highlightedIndex,
          'hover:bg-base-200': index !== highlightedIndex,
        }"
        @mousedown.prevent="selectOption(option)"
        @mouseenter="highlightedIndex = index"
      >
        <span>{{ option.label }}</span>
        <span v-if="option.description" class="ml-1 opacity-70">({{ option.description }})</span>
      </li>
    </ul>

    <!-- No results -->
    <div
      v-show="isOpen && !loading && query && displayOptions.length === 0"
      class="absolute z-50 mt-1 w-full rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm text-base-content/60 shadow-lg"
    >
      {{ noResultsText }}
    </div>
  </div>
</template>
