<script lang="ts" setup>
import StoryLayout from '@/layouts/StoryLayout.vue'
import type { Project } from '@/types/models'
import type { ProjectStep } from '@/types/story'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import { ProgressBar, ProgressTimeline } from '@/components/Story/Form/UI'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  project: Project
  step: ProjectStep
  token: string
}>()

const router = useRouter()
const authStore = useAuthStore()

function newForm() {
  router.push({ name: 'story.new' })
}

async function logoutUser() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <StoryLayout>
    <template #top>
      <div class="flex justify-between items-start gap-2">
        <ProgressTimeline
          v-once
          :project="project"
          :step="step"
          :token="token"
          class="hidden lg:flex lg:justify-center"
        />
      </div>
    </template>
    <ProgressBar :step="step" class="lg:hidden" />
    <section class="stretched">
      <div class="stretched contained centered">
        <div class="prose prose-2xl">
          <h2>Form Complete!</h2>
          <p>
            Congratulations! You've completed all four sections of the Slide Form Demo. Your
            responses have been saved and this story is now marked as finished.
          </p>
          <p>
            This demo showcases a multi-step form system built with reusable slide components:
            page-by-page navigation, client-side validation, conditional fields that appear based on
            your earlier answers, and automatic progress tracking across sections. Each section
            saves independently, so nothing is lost between steps.
          </p>
          <p>
            Once a story is complete, its sections are locked in. If you'd like to explore the form
            again, you can start a fresh one from the dashboard.
          </p>
          <div class="flex flex-wrap gap-4 not-prose pt-2">
            <PrimaryButton class="lg:btn-lg xl:btn-xl btn-outline" @click="newForm">
              Start New Form
            </PrimaryButton>
            <PrimaryButton class="lg:btn-lg xl:btn-xl btn-outline" @click="logoutUser">
              Log Out
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  </StoryLayout>
</template>
