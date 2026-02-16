import { ref } from 'vue'
import { getApiClient } from '@/lib/axios'

const firstNames = ref<string[]>([])
const lastNames = ref<string[]>([])
const loaded = ref(false)

async function fetchNames(): Promise<void> {
  if (loaded.value) return

  try {
    const api = getApiClient()
    const response = await api.get<{ data: { first_names: string[]; last_names: string[] } }>(
      '/names'
    )

    firstNames.value = response.data.data.first_names
    lastNames.value = response.data.data.last_names
    loaded.value = true
  } catch (error) {
    console.error('Failed to fetch name options:', error)
  }
}

export function useNameOptions() {
  fetchNames()

  return {
    firstNames,
    lastNames,
    loaded,
    fetchNames,
  }
}
