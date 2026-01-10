<script lang="ts" setup>
import { useRouter } from 'vue-router'
import GuestLayout from '@/layouts/GuestLayout.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'

const router = useRouter()

function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <GuestLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Password Reset</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Not available in demo mode</p>
    </div>

    <div
      class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
    >
      <p class="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">Demo Mode Information</p>
      <p class="text-sm text-blue-700 dark:text-blue-400">
        Password reset functionality is not available in this demo application. This is a
        client-side only demo without email capabilities.
      </p>
      <p class="mt-3 text-sm text-blue-700 dark:text-blue-400">
        <strong>Available demo accounts:</strong>
      </p>
      <ul class="mt-1 text-sm text-blue-700 dark:text-blue-400 space-y-1">
        <li>• client@demo.com / password</li>
        <li>• admin@demo.com / password</li>
        <li>• consultant@demo.com / password</li>
      </ul>
    </div>

    <div class="flex flex-col gap-3">
      <PrimaryButton class="w-full" @click="goToLogin"> Back to Login </PrimaryButton>

      <router-link
        :to="{ name: 'register' }"
        class="text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        Or create a new account
      </router-link>
    </div>
  </GuestLayout>
</template>
