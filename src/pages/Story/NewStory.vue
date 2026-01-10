<script lang="ts" setup>
import { useProjectsStore } from '@/stores/projects'
import { useFlashStore } from '@/stores/flash'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import StoryLayout from '@/layouts/StoryLayout.vue'

const projectsStore = useProjectsStore()
const flashStore = useFlashStore()
const router = useRouter()
const loading = ref(false)

const createForm = async () => {
  loading.value = true
  try {
    // Create new project
    const project = await projectsStore.create({
      title: 'New Story',
      status: 'draft',
      current_step: 'intro',
    })

    // Generate a simple token (in SPA, we use crypto.randomUUID for consistency)
    const token = crypto.randomUUID()

    // Navigate to the form
    router.push({
      name: 'story.form',
      params: { id: project.id },
      query: {
        step: 'intro',
        token: token,
      },
    })
  } catch (error) {
    const err = error as Error
    flashStore.error(err.message || 'Failed to create story')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <StoryLayout>
    <section class="stretched">
      <div class="stretched contained centered">
        <div class="prose prose-2xl pb-4">
          <h2>Start New Form</h2>
          <p>
            Welcome to the Slide Form Demo. You will be guided through a multi-step form divided
            into sections.
          </p>
          <p>To get started, click the button below.</p>
          <PrimaryButton
            class="lg:btn-lg xl:btn-xl btn-outline"
            :disabled="loading"
            @click="createForm"
          >
            {{ loading ? 'Creating...' : "Let's Begin" }}
          </PrimaryButton>
        </div>
      </div>
    </section>
  </StoryLayout>
</template>
