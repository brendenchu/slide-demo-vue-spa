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
  allSteps: Record<string, string>
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
          <p>Congratulations! You have completed the Slide Form Demo.</p>
          <p>From here, you have three options:</p>
          <ol>
            <li>
              <p>You can revisit any of the sections.</p>
              <ul class="prose-sm">
                <li v-for="(name, slug) in allSteps" :key="slug">
                  <RouterLink
                    :to="{
                      name: 'story.form',
                      params: { id: project.id },
                      query: { step: slug, token },
                    }"
                    class="hover:font-bold"
                  >
                    {{ name }}
                  </RouterLink>
                </li>
              </ul>
            </li>
            <li>
              <p>
                You can fill out the form again, though I don't know why you would want to do that.
              </p>
              <PrimaryButton class="lg:btn-lg xl:btn-xl btn-outline" @click="newForm">
                Start New Form
              </PrimaryButton>
            </li>
            <li>
              <p>You can log out and have a great day!</p>
              <PrimaryButton class="lg:btn-lg xl:btn-xl btn-outline" @click="logoutUser">
                Log Out
              </PrimaryButton>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </StoryLayout>
</template>
