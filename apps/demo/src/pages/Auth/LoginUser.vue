<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputError from '@/components/Form/FormError.vue'
import InputLabel from '@/components/Form/FormLabel.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import InputField from '@/components/Form/FormField.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

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
    const user = await authStore.login(form.value.email, form.value.password)
    toastStore.success('Welcome back!')

    // Redirect to terms if needed, otherwise dashboard
    if (user.must_accept_terms) {
      router.push({ name: 'terms.accept' })
    } else {
      router.push({ name: 'dashboard' })
    }
  } catch (_error) {
    errors.value.email = 'Invalid credentials. Please try again.'
    toastStore.error('Login failed. Please check your credentials.')
  } finally {
    processing.value = false
    form.value.password = '' // Clear password field
  }
}
</script>

<template>
  <GuestLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-base-content">Welcome Back</h1>
      <p class="mt-2 text-sm text-base-content/60">
        Sign in to your account to continue
      </p>
    </div>

    <div
      class="mb-4 p-4 bg-info/10 rounded-lg border border-info/30"
    >
      <p class="text-sm text-info font-medium">Demo Credentials:</p>
      <p class="mt-2 text-sm text-info/80">
        <strong>Email:</strong> demo@example.com / <strong>Password:</strong> password
      </p>
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
            class="rounded border-base-300 text-primary focus:ring-primary"
          />
          <span class="ml-2 text-sm text-base-content/60">Remember me</span>
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

      <div class="text-center text-sm text-base-content/60">
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
