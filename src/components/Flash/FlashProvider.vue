<script setup lang="ts">
import Modal from './FlashModal.vue'
import { useFlashStore } from '@/stores/flash'

const flashStore = useFlashStore()

const getStylesForType = (type: string) => {
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
  <div
    v-if="flashStore.messages.length > 0"
    class="fixed top-2 inset-x-0 z-[100] flex flex-col items-center justify-center space-y-2"
  >
    <TransitionGroup
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <Modal
        v-for="flash in flashStore.messages"
        :key="flash.id"
        :show="true"
        :max-width="'lg'"
        :class="'border ' + getStylesForType(flash.type)"
        @close="flashStore.remove(flash.id)"
      >
        {{ flash.message }}
      </Modal>
    </TransitionGroup>
  </div>
  <slot>Content goes here.</slot>
</template>

<style scoped lang="postcss"></style>
