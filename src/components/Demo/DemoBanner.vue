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
    class="bg-warning/15 border-b border-warning/40 px-4 py-2 text-sm text-warning/90 flex items-center justify-between"
  >
    <span>This is a demo environment with limited resources.</span>
    <button
      type="button"
      class="ml-4 text-base-content/60 hover:text-warning font-medium transition"
      @click="dismiss"
    >
      Dismiss
    </button>
  </div>
</template>
