<script setup lang="ts">
import { useFlashStore } from '@/stores/flash'

const flashStore = useFlashStore()

const getStylesForType = (type: string): string => {
  switch (type) {
    case 'success':
      return 'bg-success border-success text-success-content'
    case 'error':
      return 'bg-error border-error text-error-content'
    case 'warning':
      return 'bg-warning border-warning text-warning-content'
    case 'info':
      return 'bg-info border-info text-info-content'
    default:
      return 'bg-base-100 border-base-100 text-base-content'
  }
}
</script>

<template>
  <div class="fixed bottom-4 left-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
    <TransitionGroup
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 -translate-x-full"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition ease-in duration-300 absolute"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 -translate-x-full"
      move-class="transition-all duration-300 ease-in-out"
    >
      <div
        v-for="flash in flashStore.messages"
        :key="flash.id"
        class="pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-lg border p-3 shadow-lg"
        :class="getStylesForType(flash.type)"
      >
        <span class="text-sm">{{ flash.message }}</span>
        <button
          type="button"
          class="shrink-0 rounded-md opacity-70 hover:opacity-100 focus:outline-none"
          @click="flashStore.remove(flash.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 384 512"
          >
            <path
              d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
  <slot>Content goes here.</slot>
</template>
