<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useDemoStore } from '@/stores/demo'
import { useNameOptions } from '@/composables/useNameOptions'
import GuestLayout from '@/layouts/GuestLayout.vue'
import {
  Error as InputError,
  Label as InputLabel,
  Combobox as FormCombobox,
} from '@bchu/vue-form-primitives'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
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
    const user = await authStore.register(form.value.first_name, form.value.last_name)
    toastStore.success('Registration successful! Welcome to Vue Slide Demo.')

    // Redirect to terms if needed, otherwise dashboard
    if (user.must_accept_terms) {
      router.push({ name: 'terms.accept' })
    } else {
      router.push({ name: 'dashboard' })
    }
  } catch (_error) {
    errors.value.general = 'Registration failed. Please try again.'
    toastStore.error('Registration failed. Please check your information.')
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <GuestLayout>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-base-content">Create Account</h1>
      <p class="mt-2 text-sm text-base-content/60">
        This registration form demonstrates a searchable combobox component for name selection.
        Choose a first and last name to create a demo account and explore the application.
      </p>
    </div>

    <div
      v-if="demoStore.isDemoMode"
      class="mb-4 p-4 bg-warning/10 rounded-lg border border-warning/30"
    >
      <p class="text-sm text-warning">
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

      <div class="text-center text-sm text-base-content/60">
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
