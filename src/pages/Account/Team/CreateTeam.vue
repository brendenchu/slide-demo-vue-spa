<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm } from '@/composables/useForm'
import { useFlashStore } from '@/stores/flash'
import { useDemoStore } from '@/stores/demo'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import InputError from '@/components/Form/FormError.vue'
import InputLabel from '@/components/Form/FormLabel.vue'
import InputField from '@/components/Form/FormField.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import SecondaryButton from '@/components/Common/UI/Buttons/SecondaryButton.vue'

const router = useRouter()
const flashStore = useFlashStore()
const demoStore = useDemoStore()

const form = useForm({
  name: '',
  description: '',
})

const createTeam = () => {
  form.post('/teams', {
    onSuccess: () => {
      flashStore.success('Team created successfully')
      router.push({ name: 'team.select' })
    },
  })
}
</script>

<template>
  <AuthenticatedLayout>
    <div class="p-12 lg:px-0">
      <div class="max-w-2xl mx-auto sm:px-6 lg:px-8">
        <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
          <section>
            <header>
              <h2 class="text-lg font-medium text-gray-900">Create a New Team</h2>
              <p class="mt-1 text-sm text-gray-600">
                Create a new team to collaborate with others.
              </p>
            </header>

            <div
              v-if="demoStore.isDemoMode"
              class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <p class="text-sm text-amber-800">
                Team creation is limited in the demo environment.
              </p>
            </div>

            <form class="mt-6 space-y-6" @submit.prevent="createTeam">
              <div>
                <InputLabel for="name" value="Team Name" />
                <InputField
                  id="name"
                  v-model="form.data.name"
                  type="text"
                  class="mt-1 block w-full"
                  required
                  autofocus
                />
                <InputError class="mt-1" :message="form.errors.name" />
              </div>

              <div>
                <InputLabel for="description" value="Description" />
                <InputField
                  id="description"
                  v-model="form.data.description"
                  type="text"
                  class="mt-1 block w-full"
                />
                <InputError class="mt-1" :message="form.errors.description" />
              </div>

              <div class="flex items-center gap-3">
                <PrimaryButton :disabled="form.processing">Create Team</PrimaryButton>
                <SecondaryButton @click="router.push({ name: 'team.select' })"
                  >Cancel</SecondaryButton
                >

                <Transition
                  enter-active-class="transition ease-in-out"
                  enter-from-class="opacity-0"
                  leave-active-class="transition ease-in-out"
                  leave-to-class="opacity-0"
                >
                  <p v-if="form.recentlySuccessful" class="text-sm text-green-600">Created.</p>
                </Transition>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
