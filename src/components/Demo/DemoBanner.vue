<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useDemoStore } from '@/stores/demo'

const demoStore = useDemoStore()
const dismissed = ref(false)

const STORAGE_KEY = 'vsd:demo:banner-dismissed'

onMounted(() => {
  dismissed.value = sessionStorage.getItem(STORAGE_KEY) === '1'
})

function dismiss() {
  dismissed.value = true
  sessionStorage.setItem(STORAGE_KEY, '1')
}
</script>

<template>
  <div
    v-if="demoStore.isDemoMode && !dismissed"
    class="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 flex items-center justify-between"
  >
    <span>This is a demo environment with limited resources.</span>
    <button
      type="button"
      class="ml-4 text-amber-600 hover:text-amber-800 font-medium"
      @click="dismiss"
    >
      Dismiss
    </button>
  </div>
</template>
