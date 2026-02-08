<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useForm } from '@/composables/useForm'
import { useDemoStore } from '@/stores/demo'
import { route } from '@/utils/route'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import InputError from '@/components/Form/FormError.vue'
import InputField from '@/components/Form/FormField.vue'
import InputLabel from '@/components/Form/FormLabel.vue'

const demoStore = useDemoStore()

const props = withDefaults(
  defineProps<{
    signup?: boolean
  }>(),
  {
    signup: false,
  }
)

const form = useForm({
  first_name: '',
  last_name: '',
  email: '',
  role: '',
  password: '',
  password_confirmation: '',
})

const submit = () => {
  form.post(route(props.signup ? 'register' : 'admin.users.store'), {
    preserveScroll: true,
    onFinish: () => {
      if (props.signup) {
        form.reset('password', 'password_confirmation')
      }
    },
  })
}
</script>

<template>
  <form @submit.prevent="submit">
    <div
      v-if="demoStore.isDemoMode"
      class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
    >
      <p class="text-sm text-amber-800">User creation is limited in the demo environment.</p>
    </div>

    <div>
      <InputLabel for="first_name" value="First Name" />

      <InputField
        id="first_name"
        v-model="form.data.first_name"
        type="text"
        required
        autofocus
        autocomplete="name"
      />

      <InputError class="mt-1" :message="form.errors.first_name" />
    </div>

    <div class="mt-3">
      <InputLabel for="last_name" value="Last Name" />

      <InputField
        id="last_name"
        v-model="form.data.last_name"
        type="text"
        required
        autofocus
        autocomplete="name"
      />

      <InputError class="mt-1" :message="form.errors.last_name" />
    </div>

    <div class="mt-3">
      <InputLabel for="email" value="Email" />

      <InputField
        id="email"
        v-model="form.data.email"
        type="email"
        required
        autocomplete="username"
      />

      <InputError class="mt-1" :message="form.errors.email" />
    </div>

    <template v-if="signup">
      <div class="mt-3">
        <InputLabel for="password" value="Password" />

        <InputField
          id="password"
          v-model="form.data.password"
          type="password"
          required
          autocomplete="new-password"
        />

        <InputError class="mt-1" :message="form.errors.password" />
      </div>

      <div class="mt-3">
        <InputLabel for="password_confirmation" value="Confirm Password" />

        <InputField
          id="password_confirmation"
          v-model="form.data.password_confirmation"
          type="password"
          required
          autocomplete="new-password"
        />

        <InputError class="mt-1" :message="form.errors.password_confirmation" />
      </div>

      <div class="flex items-center justify-end mt-3">
        <RouterLink
          :to="route('login')"
          class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Already registered?
        </RouterLink>

        <PrimaryButton
          class="ml-4"
          :class="{ 'opacity-25': form.processing }"
          :disabled="form.processing"
        >
          Register
        </PrimaryButton>
      </div>
    </template>
    <template v-else>
      <div class="mt-3">
        <InputLabel for="role" value="Role" />

        <select
          id="role"
          v-model="form.data.role"
          class="select select-bordered w-full select-sm p-0 px-3"
        >
          <option value="" disabled>Select a role</option>
          <option value="admin">Admin</option>
          <option value="consultant">Consultant</option>
          <option value="client">Client</option>
        </select>

        <InputError class="mt-1" :message="form.errors.role" />
      </div>
      <div class="mt-3">
        <PrimaryButton :class="{ 'opacity-25': form.processing }" :disabled="form.processing">
          Create User
        </PrimaryButton>
      </div>
    </template>
  </form>
</template>

<style scoped lang="postcss"></style>
