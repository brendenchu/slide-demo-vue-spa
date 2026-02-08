<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFlashStore } from '@/stores/flash'
import { useDemoStore } from '@/stores/demo'
import { useNameOptions } from '@/composables/useNameOptions'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputError from '@/components/Form/FormError.vue'
import InputLabel from '@/components/Form/FormLabel.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import FormCombobox from '@/components/Form/FormCombobox.vue'

const router = useRouter()
const authStore = useAuthStore()
const flashStore = useFlashStore()
const demoStore = useDemoStore()
const { firstNames, lastNames, loaded } = useNameOptions()

const form = ref({
  first_name: '',
  last_name: '',
})

const firstNameOptions = computed(() => firstNames.value.map((n) => ({ value: n, label: n })))

const lastNameOptions = computed(() => lastNames.value.map((n) => ({ value: n, label: n })))

const errors = ref<Record<string, string>>({})
const processing = ref(false)

async function submit() {
  processing.value = true
  errors.value = {}

  try {
    await authStore.register(form.value.first_name, form.value.last_name)
    flashStore.success('Registration successful! Welcome to Vue Slide Demo.')

    // Navigate to dashboard
    router.push({ name: 'dashboard' })
  } catch (_error) {
    errors.value.general = 'Registration failed. Please try again.'
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
      v-if="demoStore.isDemoMode"
      class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
    >
      <p class="text-sm text-yellow-800 dark:text-yellow-300">
        <strong>Demo Mode:</strong> Registration is limited in the demo environment. Some features
        may be restricted.
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <InputLabel for="first_name" value="First Name" />
        <FormCombobox
          id="first_name"
          v-model="form.first_name"
          :options="firstNameOptions"
          placeholder="Select a first name"
          class="mt-1 block w-full"
          required
          autofocus
          :disabled="!loaded"
        />
        <InputError :message="errors.first_name" class="mt-1" />
      </div>

      <div>
        <InputLabel for="last_name" value="Last Name" />
        <FormCombobox
          id="last_name"
          v-model="form.last_name"
          :options="lastNameOptions"
          placeholder="Select a last name"
          class="mt-1 block w-full"
          required
          :disabled="!loaded"
        />
        <InputError :message="errors.last_name" class="mt-1" />
      </div>

      <InputError :message="errors.general" class="mt-1" />

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
