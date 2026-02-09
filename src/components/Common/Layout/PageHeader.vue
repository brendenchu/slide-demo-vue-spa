<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { LogoutButton } from '@/components/Story/Form/UI'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'

defineProps<{
  title?: string
}>()

const router = useRouter()

function goToDashboard() {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="p-6 grid grid-cols-[1fr_auto_1fr] items-start gap-2 bg-base-200">
    <h2 class="text-3xl font-bold">{{ title || 'Slide Form Demo' }}</h2>
    <slot />
    <div class="flex justify-end items-start gap-2">
      <PrimaryButton class="btn-sm" @click="goToDashboard">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        Dashboard
      </PrimaryButton>
      <LogoutButton />
    </div>
  </div>
</template>

<style lang="postcss" scoped></style>
