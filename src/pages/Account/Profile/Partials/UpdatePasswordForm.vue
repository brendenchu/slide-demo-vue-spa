<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from '@/composables/useForm'
import { useDemoStore } from '@/stores/demo'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import InputError from '@/components/Form/FormError.vue'
import InputLabel from '@/components/Form/FormLabel.vue'
import InputField from '@/components/Form/FormField.vue'

const demoStore = useDemoStore()
const isProtected = computed(() => demoStore.isDemoMode && demoStore.isDemoAccount)

const passwordInput = ref<HTMLInputElement | null>(null)
const currentPasswordInput = ref<HTMLInputElement | null>(null)

const form = useForm({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const updatePassword = () => {
  form.put('/auth/password', {
    preserveScroll: true,
    onSuccess: () => {
      form.reset()
    },
    onError: () => {
      if (form.errors.password) {
        form.reset('password', 'password_confirmation')
        passwordInput.value?.focus()
      }
      if (form.errors.current_password) {
        form.reset('current_password')
        currentPasswordInput.value?.focus()
      }
    },
  })
}
</script>

<template>
  <section>
    <header>
      <h2 class="text-lg font-medium text-base-content">Update Password</h2>

      <p class="mt-1 text-sm text-base-content/60">
        Ensure your account is using a long, random password to stay secure.
      </p>
    </header>

    <div v-if="isProtected" class="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
      <p class="text-sm text-warning">Demo account passwords cannot be changed.</p>
    </div>

    <form class="mt-4 space-y-6" @submit.prevent="updatePassword">
      <div>
        <InputLabel for="current_password" value="Current Password" />

        <InputField
          id="current_password"
          ref="currentPasswordInput"
          v-model="form.data.current_password"
          type="password"
          class="mt-1 block w-full"
          autocomplete="current-password"
          :disabled="isProtected"
        />

        <InputError :message="form.errors.current_password" class="mt-1" />
      </div>

      <div>
        <InputLabel for="password" value="New Password" />

        <InputField
          id="password"
          ref="passwordInput"
          v-model="form.data.password"
          type="password"
          class="mt-1 block w-full"
          autocomplete="new-password"
          :disabled="isProtected"
        />

        <InputError :message="form.errors.password" class="mt-1" />
      </div>

      <div>
        <InputLabel for="password_confirmation" value="Confirm Password" />

        <InputField
          id="password_confirmation"
          v-model="form.data.password_confirmation"
          type="password"
          class="mt-1 block w-full"
          autocomplete="new-password"
          :disabled="isProtected"
        />

        <InputError :message="form.errors.password_confirmation" class="mt-1" />
      </div>

      <div class="flex items-center gap-3">
        <PrimaryButton :disabled="form.processing || isProtected">Save</PrimaryButton>

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
