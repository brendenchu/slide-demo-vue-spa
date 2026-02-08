<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTeamsStore } from '@/stores/teams'
import type { UserSearchResult } from '@/types/models'

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

const query = ref('')
const results = ref<UserSearchResult[]>([])
const showDropdown = ref(false)
const isLoading = ref(false)
const wrapper = ref<HTMLElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onInput(value: string): void {
  query.value = value
  emit('update:modelValue', '')

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (value.length < 2) {
    results.value = []
    showDropdown.value = false
    return
  }

  debounceTimer = setTimeout(async () => {
    isLoading.value = true
    showDropdown.value = true
    try {
      results.value = await teamsStore.searchUsers(value, props.teamId)
    } finally {
      isLoading.value = false
    }
  }, 300)
}

function selectUser(user: UserSearchResult): void {
  query.value = `${user.name} (${user.email})`
  emit('update:modelValue', user.email)
  emit('user-selected', user)
  showDropdown.value = false
  results.value = []
}

function onClickOutside(event: MouseEvent): void {
  if (wrapper.value && !wrapper.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

watch(showDropdown, (open) => {
  if (open) {
    document.addEventListener('click', onClickOutside)
  } else {
    document.removeEventListener('click', onClickOutside)
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      query.value = ''
      results.value = []
    }
  }
)
</script>

<template>
  <div ref="wrapper" class="relative">
    <input
      type="text"
      class="input input-bordered input-sm w-full"
      placeholder="Search by name or email..."
      :value="query"
      :disabled="disabled"
      autocomplete="off"
      @input="onInput(($event.target as HTMLInputElement).value)"
      @focus="query.length >= 2 && results.length > 0 && (showDropdown = true)"
    />

    <div
      v-if="showDropdown"
      class="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto"
    >
      <div v-if="isLoading" class="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
        <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Searching...
      </div>

      <template v-else-if="results.length > 0">
        <button
          v-for="user in results"
          :key="user.id"
          type="button"
          class="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
          @click="selectUser(user)"
        >
          <span class="font-medium text-gray-900">{{ user.name }}</span>
          <span class="text-gray-500 ml-1">({{ user.email }})</span>
        </button>
      </template>

      <div v-else class="px-4 py-3 text-sm text-gray-500">
        No registered users found
      </div>
    </div>
  </div>
</template>
