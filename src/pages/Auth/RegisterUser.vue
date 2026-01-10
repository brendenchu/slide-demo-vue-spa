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
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const errors = ref<Record<string, string>>({})
const processing = ref(false)

async function submit() {
  processing.value = true
  errors.value = {}

  // Client-side validation
  if (form.value.password !== form.value.password_confirmation) {
    errors.value.password_confirmation = 'Passwords do not match'
    processing.value = false
    return
  }

  if (form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
    processing.value = false
    return
  }

  try {
    await authStore.register(form.value.name, form.value.email, form.value.password)
    flashStore.success('Registration successful! Welcome to Vue Slide Demo.')

    // Navigate to dashboard
    router.push({ name: 'dashboard' })
  } catch (error: any) {
    if (error.message.includes('already registered')) {
      errors.value.email = 'This email is already registered'
    } else {
      errors.value.email = 'Registration failed. Please try again.'
    }
    flashStore.error('Registration failed. Please check your information.')
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <GuestLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign up to start creating stories</p>
    </div>

    <div
      class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
    >
      <p class="text-sm text-yellow-800 dark:text-yellow-300">
        <strong>Demo Mode:</strong> This is a demo application. Your data is stored locally in your
        browser.
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <InputLabel for="name" value="Name" />
        <InputField
          id="name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          autofocus
          class="mt-1 block w-full"
          required
          placeholder="Your full name"
        />
        <InputError :message="errors.name" class="mt-1" />
      </div>

      <div>
        <InputLabel for="email" value="Email" />
        <InputField
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="username"
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
          autocomplete="new-password"
          class="mt-1 block w-full"
          required
          placeholder="At least 8 characters"
        />
        <InputError :message="errors.password" class="mt-1" />
      </div>

      <div>
        <InputLabel for="password_confirmation" value="Confirm Password" />
        <InputField
          id="password_confirmation"
          v-model="form.password_confirmation"
          type="password"
          autocomplete="new-password"
          class="mt-1 block w-full"
          required
          placeholder="Re-enter your password"
        />
        <InputError :message="errors.password_confirmation" class="mt-1" />
      </div>

      <div class="pt-2">
        <PrimaryButton
          type="submit"
          :disabled="processing"
          :class="{ 'opacity-25': processing }"
          class="w-full btn-outline"
        >
          {{ processing ? 'Creating account...' : 'Create Account' }}
        </PrimaryButton>
      </div>

      <div class="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?
        <router-link
          :to="{ name: 'login' }"
          class="font-medium text-primary hover:text-primary-focus"
        >
          Sign in here
        </router-link>
      </div>
    </form>
  </GuestLayout>
</template>
