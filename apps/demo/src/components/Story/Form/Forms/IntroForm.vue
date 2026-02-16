<script lang="ts" setup>
import { Slide } from '@bchu/vue-slide'
import { Error, Field, Fieldset, Label } from '@bchu/vue-form-primitives'
import { IntroFormFields } from '@/types'
import { useSectionForm, type SectionFormProps } from '@bchu/vue-story-form'
import { introFormSchema } from '@/validation/introFormSchema'
import { useProjectsStore } from '@/stores/projects'
import { useToastStore } from '@/stores/toast'

const props = defineProps<SectionFormProps<IntroFormFields>>()

const projectsStore = useProjectsStore()
const toastStore = useToastStore()

const { form, current, formDirection, pages, actions } = useSectionForm<IntroFormFields>({
  props,
  pages: 1,
  schema: introFormSchema,
  save: async (projectId, stepId, data) => {
    await projectsStore.saveResponses(projectId, stepId, data)
  },
  onError: (msg) => toastStore.error(msg),
})
</script>

<template>
  <form class="stretched prose">
    <Slide :actions="actions" :current="current" :direction="formDirection" :pages="pages">
      <template #page-1>
        <Fieldset>
          <div class="prose prose-2xl pb-4">
            <p>
              This section demonstrates basic text inputs with client-side validation. All three
              fields are required &mdash; try clicking "Save &amp; Continue" with an empty field to
              see validation errors in action.
            </p>
          </div>
          <div>
            <Label for="intro_1">
              <strong>Your First Name</strong>
            </Label>
            <Field id="intro_1" v-model="form.intro_1" class="form-field" />
            <Error :message="form.errors.intro_1" class="mt-1" />
          </div>
          <div>
            <Label for="intro_2">
              <strong>Your Last Name</strong>
            </Label>
            <Field id="intro_2" v-model="form.intro_2" class="form-field" />
            <Error :message="form.errors.intro_2" class="mt-1" />
          </div>
          <div>
            <Label for="intro_3">
              <strong>Your Location</strong>
            </Label>
            <Field id="intro_3" v-model="form.intro_3" class="form-field" />
            <Error :message="form.errors.intro_3" class="mt-1" />
          </div>
        </Fieldset>
      </template>
    </Slide>
  </form>
</template>
