<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const input = ref<HTMLInputElement | null>(null)
const wrapper = ref<HTMLDivElement | null>(null)
const query = ref(props.modelValue || '')
const isOpen = ref(false)
const highlightedIndex = ref(-1)

const filteredOptions = computed(() => {
  if (!query.value) return props.options
  const q = query.value.toLowerCase()
  return props.options.filter((o) => o.label.toLowerCase().includes(q))
})

watch(
  () => props.modelValue,
  (val) => {
    query.value = val || ''
  }
)

function selectOption(option: { value: string; label: string }) {
  query.value = option.label
  emit('update:modelValue', option.value)
  isOpen.value = false
  highlightedIndex.value = -1
}

function onInput(event: Event) {
  const val = (event.target as HTMLInputElement).value
  query.value = val
  isOpen.value = true
  highlightedIndex.value = 0

  // Clear selection if typed value doesn't exactly match an option
  const match = props.options.find((o) => o.label.toLowerCase() === val.toLowerCase())
  if (match) {
    emit('update:modelValue', match.value)
  } else {
    emit('update:modelValue', '')
  }
}

function onFocus() {
  isOpen.value = true
  highlightedIndex.value = -1
}

function onClickOutside(event: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(event.target as Node)) {
    isOpen.value = false
    // Snap to selected value if query doesn't match
    if (props.modelValue) {
      const match = props.options.find((o) => o.value === props.modelValue)
      if (match) query.value = match.label
    }
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      isOpen.value = true
      event.preventDefault()
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
      scrollToHighlighted()
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter': {
      event.preventDefault()
      const selected = filteredOptions.value[highlightedIndex.value]
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

function scrollToHighlighted() {
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
      class="input input-bordered input-lg w-full"
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
    <ul
      v-show="isOpen && filteredOptions.length > 0"
      role="listbox"
      class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"
    >
      <li
        v-for="(option, index) in filteredOptions"
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
        {{ option.label }}
      </li>
    </ul>
    <div
      v-show="isOpen && query && filteredOptions.length === 0"
      class="absolute z-50 mt-1 w-full rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm text-base-content/60 shadow-lg"
    >
      No matches found
    </div>
  </div>
</template>
