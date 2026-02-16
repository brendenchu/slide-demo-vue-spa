<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'
import { useDemoStore } from '@/stores/demo'
import DangerButton from '@/components/Common/UI/Buttons/DangerButton.vue'
import SecondaryButton from '@/components/Common/UI/Buttons/SecondaryButton.vue'
import Modal from '@/components/Common/UI/ModalComponent.vue'
import InputError from '@/components/Form/FormError.vue'
import InputLabel from '@/components/Form/FormLabel.vue'
import InputField from '@/components/Form/FormField.vue'

const router = useRouter()
const authStore = useAuthStore()
const demoStore = useDemoStore()
const confirmingUserDeletion = ref(false)
const passwordInput = ref<HTMLInputElement | null>(null)

const form = useForm({
  password: '',
})

const confirmUserDeletion = () => {
  confirmingUserDeletion.value = true

  nextTick(() => passwordInput.value?.focus())
}

const deleteUser = () => {
  form.delete('/auth/user', {
    onSuccess: async () => {
      closeModal()
      await authStore.logout()
      await router.push({ name: 'login' })
    },
    onError: () => passwordInput.value?.focus(),
    onFinish: () => {
      form.reset()
    },
  })
}

const closeModal = () => {
  confirmingUserDeletion.value = false

  form.reset()
}
</script>

<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-lg font-medium text-base-content">Delete Account</h2>

      <p class="mt-1 text-sm text-base-content/60">
        Once your account is deleted, all of its resources and data will be permanently deleted.
        Before deleting your account, please download any data or information that you wish to
        retain.
      </p>
    </header>

    <template v-if="demoStore.isDemoMode && demoStore.isDemoAccount">
      <p class="text-sm text-warning">Demo accounts cannot be deleted.</p>
    </template>
    <DangerButton v-else @click="confirmUserDeletion">Delete Account</DangerButton>

    <Modal :show="confirmingUserDeletion" @close="closeModal">
      <div class="p-6">
        <h2 class="text-lg font-medium text-base-content">
          Are you sure you want to delete your account?
        </h2>

        <p class="mt-1 text-sm text-base-content/60">
          Once your account is deleted, all of its resources and data will be permanently deleted.
          Please enter your password to confirm you would like to permanently delete your account.
        </p>

        <div class="mt-4">
          <InputLabel for="password" value="Password" class="sr-only" />

          <InputField
            id="password"
            ref="passwordInput"
            v-model="form.data.password"
            type="password"
            class="mt-1 block w-3/4"
            placeholder="Password"
            @keyup.enter="deleteUser"
          />

          <InputError :message="form.errors.password" class="mt-1" />
        </div>

        <div class="mt-4 flex justify-end">
          <SecondaryButton class="btn btn-outline" @click="closeModal"> Cancel</SecondaryButton>

          <DangerButton
            class="ml-3"
            :class="{ 'opacity-25': form.processing }"
            :disabled="form.processing"
            @click="deleteUser"
          >
            Delete Account
          </DangerButton>
        </div>
      </div>
    </Modal>
  </section>
</template>
