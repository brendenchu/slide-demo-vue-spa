<script lang="ts" setup>
import { useProjectsStore } from '@/stores/projects'
import { useToastStore } from '@/stores/toast'
import { useDemoStore } from '@/stores/demo'
import { useDemoLimits } from '@/composables/useDemoLimits'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import PrimaryButton from '@/components/Common/UI/Buttons/PrimaryButton.vue'
import StoryLayout from '@/layouts/StoryLayout.vue'

const projectsStore = useProjectsStore()
const toastStore = useToastStore()
const demoStore = useDemoStore()
const { isProjectLimitReached } = useDemoLimits()
const router = useRouter()
const loading = ref(false)

const projectLimitReached = computed(() => isProjectLimitReached(projectsStore.userProjects.length))

onMounted(async () => {
  if (demoStore.isDemoMode) {
    await projectsStore.fetchAll()
  }
})

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
    toastStore.error(err.message || 'Failed to create story')
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
            Welcome to the Slide Form Demo. This form walks you through four sections, each
            demonstrating a different set of components and features:
          </p>
          <ul class="prose-lg">
            <li><strong>Introduction</strong> &mdash; Text inputs with Zod schema validation</li>
            <li>
              <strong>Section A</strong> &mdash; Checkboxes that conditionally reveal follow-up
              fields, with automatic page skipping when no fields are toggled
            </li>
            <li>
              <strong>Section B</strong> &mdash; Multi-page form with grouped number inputs and
              per-page validation schemas
            </li>
            <li>
              <strong>Section C</strong> &mdash; Single-question-per-page layout with radio button
              groups for multiple choice
            </li>
          </ul>
          <p>
            Your responses are saved after each section, and progress is tracked automatically. Use
            the Previous and Next controls to navigate between pages within each section.
          </p>
          <PrimaryButton
            class="lg:btn-lg xl:btn-xl btn-outline"
            :disabled="loading || projectLimitReached"
            @click="createForm"
          >
            {{ loading ? 'Creating...' : "Let's Begin" }}
          </PrimaryButton>
          <p v-if="projectLimitReached" class="text-sm text-warning mt-2">
            Project limit reached in this demo environment.
          </p>
        </div>
      </div>
    </section>
  </StoryLayout>
</template>
