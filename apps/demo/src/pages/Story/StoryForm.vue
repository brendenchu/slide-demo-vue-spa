<script lang="ts" setup>
import {
  AnyFormFields,
  IntroFormFields,
  SectionAFormFields,
  SectionBFormFields,
  SectionCFormFields,
} from '@/types'
import type { Project } from '@/types/models'
import type { ProjectStep } from '@/types/story'
import { IntroForm, SectionAForm, SectionBForm, SectionCForm } from '@/components/Story/Form/Forms'
import type { Direction } from '@bchu/vue-slide'
import StoryLayout from '@/layouts/StoryLayout.vue'
import { ProgressBar, ProgressTimeline } from '@/components/Story/Form/UI'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { ref, onMounted, computed, watch } from 'vue'
import { getStepConfig } from '@/utils/story/steps'

const route = useRoute()
const projectsStore = useProjectsStore()

// Reactive state
const project = ref<Project | null>(null)
const loading = ref(true)

// Make route params reactive using computed
const projectId = computed(() => route.params.id as string)
const stepId = computed(() => (route.query.step as string) || 'intro')
const token = computed(() => (route.query.token as string) || '')
const page = computed(() => parseInt((route.query.page as string) || '1', 10))
const direction = computed(() => (route.query.direction as Direction) || 'next')

// Get step configuration (reactive)
const stepConfig = computed(() => getStepConfig(stepId.value))

// Create step object that matches the interface expected by form components
const step = computed<ProjectStep>(() => ({
  id: stepConfig.value.id,
  slug: stepConfig.value.slug,
  name: stepConfig.value.name,
}))

// Get story data (form responses) for this step
const story = computed<AnyFormFields>(() => {
  if (!project.value?.responses) {
    // Initialize with proper field structure based on step
    return initializeFormFields() as AnyFormFields
  }
  const savedData = project.value.responses[stepId.value] || {}
  // Merge saved data with initialized fields to ensure all fields exist
  return { ...initializeFormFields(), ...savedData } as AnyFormFields
})

// Initialize form fields with null values based on step
function initializeFormFields(): Record<string, null> {
  const fields = stepConfig.value.fields || []
  const initialFields: Record<string, null> = {}
  fields.forEach((field) => {
    initialFields[field] = null
  })
  return initialFields
}

// Load project data
async function loadProject() {
  loading.value = true
  try {
    const fetchedProject = await projectsStore.fetchById(projectId.value)
    if (fetchedProject) {
      project.value = fetchedProject
    }
  } catch (error) {
    console.error('Failed to load project:', error)
  } finally {
    loading.value = false
  }
}

// Load project on mount
onMounted(() => {
  loadProject()
})

// Watch for step changes — use cached store data to avoid loading flash.
// The store's currentProject was just updated by saveResponses() before
// the router push that triggered this watch, so it's already fresh.
watch(
  () => route.query.step,
  (newStep, oldStep) => {
    if (newStep !== oldStep) {
      if (projectsStore.currentProject) {
        project.value = projectsStore.currentProject
      } else {
        loadProject()
      }
    }
  }
)
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <p class="text-lg">Loading form...</p>
    </div>
  </div>
  <StoryLayout v-else-if="project" :title="step.name">
    <template #top>
      <div class="flex justify-between items-start gap-2">
        <ProgressTimeline
          :project="project"
          :step="step"
          :token="token"
          class="hidden lg:flex lg:justify-center"
        />
      </div>
    </template>
    <ProgressBar :step="step" class="lg:hidden" />
    <Transition name="step-fade" mode="out-in">
      <IntroForm
        v-if="step.id === 'intro'"
        key="intro"
        :direction="direction"
        :page="page"
        :project="project"
        :step="step"
        :story="story as IntroFormFields"
        :token="token"
      />
      <SectionAForm
        v-else-if="step.id === 'section-a'"
        key="section-a"
        :direction="direction"
        :page="page"
        :project="project"
        :step="step"
        :story="story as SectionAFormFields"
        :token="token"
      />
      <SectionBForm
        v-else-if="step.id === 'section-b'"
        key="section-b"
        :direction="direction"
        :page="page"
        :project="project"
        :step="step"
        :story="story as SectionBFormFields"
        :token="token"
      />
      <SectionCForm
        v-else-if="step.id === 'section-c'"
        key="section-c"
        :direction="direction"
        :page="page"
        :project="project"
        :step="step"
        :story="story as SectionCFormFields"
        :token="token"
      />
    </Transition>
  </StoryLayout>
  <div v-else class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <p class="text-lg text-error">Project not found</p>
    </div>
  </div>
</template>

<style scoped>
.step-fade-enter-active,
.step-fade-leave-active {
  transition: opacity 0.15s ease;
}

.step-fade-enter-from,
.step-fade-leave-to {
  opacity: 0;
}
</style>
