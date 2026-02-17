<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import StoryLayout from '@/layouts/StoryLayout.vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import SecondaryButton from '@/components/Common/UI/Buttons/SecondaryButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const accepted = ref(false)
const processing = ref(false)

async function submit() {
  if (!accepted.value) {
    return
  }

  processing.value = true

  try {
    await authStore.acceptTerms()
    toastStore.success('Terms accepted successfully.')
    router.push({ name: 'dashboard' })
  } catch (_error) {
    toastStore.error('Failed to accept terms. Please try again.')
  } finally {
    processing.value = false
  }
}

async function logoutUser() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <StoryLayout>
    <section class="stretched">
      <div class="stretched contained centered">
        <div class="prose">
          <h1>Terms of Service</h1>
          <div class="border rounded-2xl p-8 shadow bg-base-100">
            <form class="flex gap-3 items-center justify-between" @submit.prevent="submit">
              <label>
                <input
                  v-model="accepted"
                  class="checkbox checkbox-lg checkbox-primary mr-2"
                  name="confirmation"
                  type="checkbox"
                />
                By checking this box, I agree to the latest terms of service.*
              </label>
              <div class="flex items-center gap-3">
                <PrimaryButton :disabled="!accepted || processing">
                  {{ processing ? 'Accepting...' : 'Continue' }}
                </PrimaryButton>
              </div>
            </form>
            <div class="mt-4 text-right">
              <SecondaryButton class="btn btn-sm btn-outline" @click.prevent="logoutUser">
                <small>Actually, just log me out.</small>
              </SecondaryButton>
            </div>
          </div>
          <p>
            <small>
              * There are no actual terms of service. This page demonstrates a terms acceptance gate
              &mdash; a router guard intercepts navigation and redirects here until the user
              accepts. This pattern is commonly used with back-end middleware to enforce policy
              acknowledgement before granting access to the rest of the application.
            </small>
          </p>
        </div>
      </div>
    </section>
  </StoryLayout>
</template>

<style lang="postcss" scoped></style>
