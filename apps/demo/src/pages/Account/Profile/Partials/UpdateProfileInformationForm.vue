<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'
import { useDemoStore } from '@/stores/demo'
import { useNameOptions } from '@/composables/useNameOptions'
import InputError from '@/components/Form/FormError.vue'
import InputLabel from '@/components/Form/FormLabel.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import InputField from '@/components/Form/FormField.vue'
import FormCombobox from '@/components/Form/FormCombobox.vue'

defineProps<{
  status?: string
}>()

const authStore = useAuthStore()
const demoStore = useDemoStore()
const isProtected = computed(() => demoStore.isDemoMode && demoStore.isDemoAccount)
const user = authStore.user!
const { firstNames, lastNames, loaded } = useNameOptions()

const form = useForm({
  first_name: user.first_name ?? user.name?.split(' ')[0] ?? '',
  last_name: user.last_name ?? user.name?.split(' ').slice(1).join(' ') ?? '',
  email: user.email,
})

const firstNameOptions = computed(() => firstNames.value.map((n) => ({ value: n, label: n })))

const lastNameOptions = computed(() => lastNames.value.map((n) => ({ value: n, label: n })))

const saveProfile = () => {
  form.put('/auth/user', {
    onSuccess: async () => {
      await authStore.refreshUser()
    },
  })
}
</script>

<template>
  <section>
    <header>
      <h2 class="text-lg font-medium text-base-content">Profile Information</h2>

      <p class="mt-1 text-sm text-base-content/60">
        Update your account's profile information and email address.
      </p>
    </header>

    <form class="mt-4 space-y-6" @submit.prevent="saveProfile">
      <div>
        <InputLabel for="first_name" value="First Name" />

        <FormCombobox
          id="first_name"
          v-model="form.data.first_name"
          :options="firstNameOptions"
          placeholder="Select a first name"
          class="mt-1 block w-full"
          required
          autofocus
          :disabled="!loaded"
        />

        <InputError class="mt-1" :message="form.errors.first_name" />
      </div>

      <div>
        <InputLabel for="last_name" value="Last Name" />

        <FormCombobox
          id="last_name"
          v-model="form.data.last_name"
          :options="lastNameOptions"
          placeholder="Select a last name"
          class="mt-1 block w-full"
          required
          :disabled="!loaded"
        />

        <InputError class="mt-1" :message="form.errors.last_name" />
      </div>

      <div>
        <InputLabel for="email" value="Email" />

        <InputField
          id="email"
          v-model="form.data.email"
          type="email"
          class="mt-1 block w-full"
          required
          autocomplete="username"
          :disabled="isProtected"
        />

        <InputError class="mt-1" :message="form.errors.email" />
      </div>

      <div class="flex items-center gap-3">
        <PrimaryButton :disabled="form.processing">Save</PrimaryButton>

        <Transition
          enter-active-class="transition ease-in-out"
          enter-from-class="opacity-0"
          leave-active-class="transition ease-in-out"
          leave-to-class="opacity-0"
        >
          <p v-if="form.recentlySuccessful" class="text-sm text-success">Saved.</p>
        </Transition>
      </div>
    </form>
  </section>
</template>
