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

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const errors = ref<Record<string, string>>({})
const processing = ref(false)

async function submit() {
  processing.value = true
  errors.value = {}

  try {
    await authStore.login(form.value.email, form.value.password)
    flashStore.success('Welcome back!')

    // Navigate to dashboard
    router.push({ name: 'dashboard' })
  } catch (_error) {
    errors.value.email = 'Invalid credentials. Please try again.'
    flashStore.error('Login failed. Please check your credentials.')
  } finally {
    processing.value = false
    form.value.password = '' // Clear password field
  }
}
</script>

<template>
  <GuestLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Sign in to your account to continue
      </p>
    </div>

    <div
      class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
    >
      <p class="text-sm text-blue-800 dark:text-blue-300 font-medium">Demo Credentials:</p>
      <ul class="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1">
        <li>• <strong>Client:</strong> client@demo.com / password</li>
        <li>• <strong>Admin:</strong> admin@demo.com / password</li>
        <li>• <strong>Consultant:</strong> consultant@demo.com / password</li>
      </ul>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <InputLabel for="email" value="Email" />
        <InputField
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="username"
          autofocus
          class="mt-1 block w-full"
          required
          placeholder="you@example.com"
        />
        <InputError :message="errors.email" class="mt-1" />
      </div>

      <div>
        <InputLabel for="password" value="Password" />
        <InputField
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          class="mt-1 block w-full"
          required
          placeholder="Enter your password"
        />
        <InputError :message="errors.password" class="mt-1" />
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input
            v-model="form.remember"
            type="checkbox"
            class="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
        </label>
      </div>

      <div class="pt-2">
        <PrimaryButton
          type="submit"
          :disabled="processing"
          :class="{ 'opacity-25': processing }"
          class="w-full btn-outline"
        >
          {{ processing ? 'Signing in...' : 'Sign In' }}
        </PrimaryButton>
      </div>

      <div class="text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?
        <router-link
          :to="{ name: 'register' }"
          class="font-medium text-primary hover:text-primary-focus"
        >
          Register here
        </router-link>
      </div>
    </form>
  </GuestLayout>
</template>
