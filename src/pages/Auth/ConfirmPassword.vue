<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputError from '@/components/Form/FormError.vue'
import InputLabel from '@/components/Form/FormLabel.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import InputField from '@/components/Form/FormField.vue'

const router = useRouter()
const authStore = useAuthStore()
const flashStore = useFlashStore()

const password = ref('')
const error = ref('')
const processing = ref(false)

async function submit() {
  processing.value = true
  error.value = ''

  try {
    // In demo mode, just verify the user is logged in
    if (!authStore.user) {
      throw new Error('Not authenticated')
    }

    // Simple confirmation - in real app would verify password
    flashStore.success('Password confirmed')
    router.back() // Go back to previous page
  } catch (_err) {
    error.value = 'Unable to confirm password'
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <GuestLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Confirm Password</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        This is a secure area of the application. Please confirm your password before continuing.
      </p>
    </div>

    <form @submit.prevent="submit">
      <div>
        <InputLabel for="password" value="Password" />
        <InputField
          id="password"
          v-model="password"
          type="password"
          class="mt-1 block w-full"
          required
          autocomplete="current-password"
          autofocus
        />
        <InputError class="mt-1" :message="error" />
      </div>

      <div class="flex justify-end mt-4">
        <PrimaryButton type="submit" :disabled="processing" :class="{ 'opacity-25': processing }">
          {{ processing ? 'Confirming...' : 'Confirm' }}
        </PrimaryButton>
      </div>
    </form>
  </GuestLayout>
</template>
