<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useTeamsStore } from '@/stores/teams'
import type { UserSearchResult } from '@/types/models'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    teamId: string
    modelValue: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'user-selected': [user: UserSearchResult]
}>()

const teamsStore = useTeamsStore()

const input = ref<HTMLInputElement | null>(null)
const wrapper = ref<HTMLDivElement | null>(null)
const query = ref('')
const results = ref<UserSearchResult[]>([])
const isOpen = ref(false)
const isLoading = ref(false)
const highlightedIndex = ref(-1)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  query.value = value
  emit('update:modelValue', '')
  highlightedIndex.value = 0

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (value.length < 2) {
    results.value = []
    isOpen.value = false
    return
  }

  debounceTimer = setTimeout(async () => {
    isLoading.value = true
    isOpen.value = true
    try {
      results.value = await teamsStore.searchUsers(value, props.teamId)
      highlightedIndex.value = results.value.length > 0 ? 0 : -1
    } finally {
      isLoading.value = false
    }
  }, 300)
}

function selectUser(user: UserSearchResult): void {
  query.value = `${user.name} (${user.email})`
  emit('update:modelValue', user.email)
  emit('user-selected', user)
  isOpen.value = false
  results.value = []
  highlightedIndex.value = -1
}

function onFocus(): void {
  if (query.value.length >= 2 && results.value.length > 0) {
    isOpen.value = true
    highlightedIndex.value = -1
  }
}

function onClickOutside(event: MouseEvent): void {
  if (wrapper.value && !wrapper.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (!isOpen.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (results.value.length > 0) {
        isOpen.value = true
        event.preventDefault()
      }
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, results.value.length - 1)
      scrollToHighlighted()
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter': {
      event.preventDefault()
      const selected = results.value[highlightedIndex.value]
      if (highlightedIndex.value >= 0 && selected) {
        selectUser(selected)
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

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      query.value = ''
      results.value = []
    }
  }
)

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
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
      placeholder="Search by name or email..."
      :value="query"
      :disabled="disabled"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="isOpen"
      @input="onInput"
      @focus="onFocus"
      @keydown="onKeydown"
    />

    <div
      v-if="isOpen && isLoading"
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

    <ul
      v-show="isOpen && !isLoading && results.length > 0"
      role="listbox"
      class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"
    >
      <li
        v-for="(user, index) in results"
        :key="user.id"
        role="option"
        :aria-selected="user.email === modelValue"
        class="cursor-pointer px-4 py-2 text-sm"
        :class="{
          'bg-primary text-primary-content': index === highlightedIndex,
          'hover:bg-base-200': index !== highlightedIndex,
        }"
        @mousedown.prevent="selectUser(user)"
        @mouseenter="highlightedIndex = index"
      >
        <span class="font-medium">{{ user.name }}</span>
        <span class="ml-1 opacity-70">({{ user.email }})</span>
      </li>
    </ul>

    <div
      v-show="isOpen && !isLoading && query.length >= 2 && results.length === 0"
      class="absolute z-50 mt-1 w-full rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm text-base-content/60 shadow-lg"
    >
      No registered users found
    </div>
  </div>
</template>
