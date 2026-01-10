<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GuestLayout from '@/layouts/GuestLayout.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import SecondaryButton from '@/components/Common/UI/Buttons/SecondaryButton.vue'

const router = useRouter()
const authStore = useAuthStore()

async function logout() {
  await authStore.logout()
  router.push({ name: 'login' })
}

function continueToDashboard() {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <GuestLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Email Verification</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Not required in demo mode</p>
    </div>

    <div
      class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
    >
      <p class="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">Demo Mode Information</p>
      <p class="text-sm text-blue-700 dark:text-blue-400">
        Email verification is not required in this demo application. You can proceed directly to
        your dashboard.
      </p>
    </div>

    <div class="flex flex-col gap-3">
      <PrimaryButton class="w-full" @click="continueToDashboard">
        Continue to Dashboard
      </PrimaryButton>

      <SecondaryButton class="w-full" @click="logout"> Log Out </SecondaryButton>
    </div>
  </GuestLayout>
</template>
