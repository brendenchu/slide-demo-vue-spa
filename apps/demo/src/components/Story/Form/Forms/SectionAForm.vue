<script lang="ts" setup>
import { Slide } from '@bchu/vue-slide'
import { Checkbox, Error, Field, Fieldset, GroupWrapper, Label } from '@bchu/vue-form-primitives'
import { watch } from 'vue'
import { SectionAFormFields } from '@/types'
import { useSectionForm, type SectionFormProps } from '@bchu/vue-story-form'
import { sectionAPage1Schema, sectionAPage2Schema } from '@/validation/sectionAFormSchema'
import { useProjectsStore } from '@/stores/projects'
import { useToastStore } from '@/stores/toast'

const props = defineProps<SectionFormProps<SectionAFormFields>>()

const projectsStore = useProjectsStore()
const toastStore = useToastStore()

const { form, current, formDirection, pages, actions } = useSectionForm<SectionAFormFields>({
  props,
  pages: 2,
  schema: (page) => (page === 1 ? sectionAPage1Schema : sectionAPage2Schema),
  toggledFields: {
    1: {
      section_a_1: 'section_a_4',
      section_a_2: 'section_a_5',
      section_a_3: 'section_a_6',
    },
  },
  previousStepPage: '1',
  save: async (projectId, stepId, data) => {
    await projectsStore.saveResponses(projectId, stepId, data)
  },
  onError: (msg) => toastStore.error(msg),
})

// Initialize checkbox values based on whether their dependent fields have data
function initializeCheckboxes() {
  if (form.section_a_4 !== null && form.section_a_4 !== undefined && form.section_a_4 !== '') {
    form.section_a_1 = true
  }
  if (form.section_a_5 !== null && form.section_a_5 !== undefined && form.section_a_5 !== '') {
    form.section_a_2 = true
  }
  if (form.section_a_6 !== null && form.section_a_6 !== undefined && form.section_a_6 !== '') {
    form.section_a_3 = true
  }
}

// Reinitialize checkboxes when navigating back to page 1
watch(
  () => current.value,
  (newPage) => {
    if (newPage === 1) {
      initializeCheckboxes()
    }
  },
  { immediate: true }
)

// Clear corresponding fields when checkboxes are unchecked
watch(
  () => form.section_a_1,
  (newValue, oldValue) => {
    if (oldValue === true && newValue === false) {
      form.section_a_4 = null
      form.clearErrors('section_a_4')
    }
  }
)

watch(
  () => form.section_a_2,
  (newValue, oldValue) => {
    if (oldValue === true && newValue === false) {
      form.section_a_5 = null
      form.clearErrors('section_a_5')
    }
  }
)

watch(
  () => form.section_a_3,
  (newValue, oldValue) => {
    if (oldValue === true && newValue === false) {
      form.section_a_6 = null
      form.clearErrors('section_a_6')
    }
  }
)
</script>

<template>
  <form class="stretched prose">
    <Slide :actions="actions" :current="current" :direction="formDirection" :pages="pages">
      <template #page-1>
        <Fieldset>
          <div class="prose prose-2xl pb-4">
            <p>
              This section demonstrates conditional fields. Select one or more checkboxes below to
              reveal follow-up questions on the next page. If you select none, the form will
              automatically skip ahead to Section B.
            </p>
          </div>
          <GroupWrapper>
            <div class="flex gap-3">
              <Checkbox id="section_a_1" v-model:checked="form.section_a_1" :value="true" />
              <Label for="section_a_1">
                <strong class="text-2xl">Checkbox A1</strong>
              </Label>
            </div>
            <div class="flex gap-3">
              <Checkbox id="section_a_2" v-model:checked="form.section_a_2" :value="true" />
              <Label for="section_a_2">
                <strong class="text-2xl">Checkbox A2</strong>
              </Label>
            </div>
            <div class="flex gap-3">
              <Checkbox id="section_a_3" v-model:checked="form.section_a_3" :value="true" />
              <Label for="section_a_3">
                <strong class="text-2xl">Checkbox A3</strong>
              </Label>
            </div>
          </GroupWrapper>
        </Fieldset>
      </template>
      <template #page-2>
        <Fieldset>
          <div class="prose prose-2xl pb-4">
            <p>
              The fields below are conditionally rendered based on your checkbox selections. Each
              checkbox maps to a specific follow-up question. Unchecking a box clears its
              corresponding field and removes any validation errors for it.
            </p>
          </div>
          <GroupWrapper>
            <div v-if="form.section_a_1">
              <Label for="section_a_4">
                <strong>What is the current year?</strong>
                <small> You see this question because you ticked Checkbox A1. </small>
              </Label>
              <Field
                id="section_a_4"
                v-model="form.section_a_4"
                aria-placeholder="YYYY"
                class="form-field"
                placeholder="YYYY"
                type="number"
              />
              <Error :message="form.errors.section_a_4" class="mt-1" />
            </div>
            <div v-if="form.section_a_2">
              <Label for="section_a_5">
                <strong>What is the current month?</strong>
                <small> You see this question because you ticked Checkbox A2. </small>
              </Label>
              <Field
                id="section_a_5"
                v-model="form.section_a_5"
                aria-placeholder="MM"
                class="form-field"
                max="12"
                min="1"
                placeholder="MM"
                type="number"
              />
              <Error :message="form.errors.section_a_5" class="mt-1" />
            </div>
            <div v-if="form.section_a_3">
              <Label for="section_a_6">
                <strong>What is the current day?</strong>
                <small> You see this question because you ticked Checkbox A3. </small>
              </Label>
              <Field
                id="section_a_6"
                v-model="form.section_a_6"
                aria-placeholder="DD"
                class="form-field"
                max="31"
                min="1"
                placeholder="DD"
                type="number"
              />
              <Error :message="form.errors.section_a_6" class="mt-1" />
            </div>
          </GroupWrapper>
        </Fieldset>
      </template>
    </Slide>
  </form>
</template>
