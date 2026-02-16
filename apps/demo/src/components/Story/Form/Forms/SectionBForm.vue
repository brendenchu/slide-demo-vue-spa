<script lang="ts" setup>
import { Slide } from '@bchu/vue-slide'
import { Error, Field, Fieldset, Label } from '@/components/Form'
import { SectionBFormFields } from '@/types'
import { useSectionForm, type SectionFormProps } from '@/composables/useSectionForm'
import {
  sectionBPage1Schema,
  sectionBPage2Schema,
  sectionBPage3Schema,
} from '@/validation/sectionBFormSchema'

const props = defineProps<SectionFormProps<SectionBFormFields>>()

const { form, current, formDirection, pages, actions } = useSectionForm<SectionBFormFields>({
  props,
  pages: 3,
  schema: (page) => {
    if (page === 1) return sectionBPage1Schema
    if (page === 2) return sectionBPage2Schema
    return sectionBPage3Schema
  },
  previousStepPage: '2',
})
</script>

<template>
  <form class="stretched prose">
    <Slide :actions="actions" :current="current" :direction="formDirection" :pages="pages">
      <template #page-1>
        <Fieldset>
          <div class="prose prose-2xl pb-4">
            <p>
              This section demonstrates a multi-page form with three fields per page. Each page uses
              its own validation schema, so errors are scoped to the current page. Let's start with
              some quick maths.
            </p>
          </div>
          <div>
            <Label for="section_b_1">
              <strong>1 + 1?</strong>
            </Label>
            <Field id="section_b_1" v-model="form.section_b_1" class="form-field" type="number" />
            <Error :message="form.errors.section_b_1" class="mt-1" />
          </div>
          <div>
            <Label for="section_b_2">
              <strong>2 - 6?</strong>
            </Label>
            <Field id="section_b_2" v-model="form.section_b_2" class="form-field" type="number" />
            <Error :message="form.errors.section_b_2" class="mt-1" />
          </div>
          <div>
            <Label for="section_b_3">
              <strong>3 &times; 3?</strong>
            </Label>
            <Field id="section_b_3" v-model="form.section_b_3" class="form-field" type="number" />
            <Error :message="form.errors.section_b_3" class="mt-1" />
          </div>
        </Fieldset>
      </template>
      <template #page-2>
        <Fieldset>
          <div class="prose prose-2xl pb-4">
            <p>How about some <em>slightly</em> more challenging math problems.</p>
            <p>You are permitted to use a calculator.</p>
          </div>
          <div>
            <Label for="section_b_4">
              <strong>12 &divide; 4?</strong>
            </Label>
            <Field id="section_b_4" v-model="form.section_b_4" class="form-field" />
            <Error :message="form.errors.section_b_4" class="mt-1" />
          </div>
          <div>
            <Label for="section_b_5">
              <strong>3<sup>3</sup>, or 3 cubed?</strong>
            </Label>
            <Field id="section_b_5" v-model="form.section_b_5" class="form-field" />
            <Error :message="form.errors.section_b_5" class="mt-1" />
          </div>
          <div>
            <Label for="section_b_6">
              <strong>5!, or 5 factorial?</strong>
            </Label>
            <Field id="section_b_6" v-model="form.section_b_6" class="form-field" />
            <Error :message="form.errors.section_b_6" class="mt-1" />
          </div>
        </Fieldset>
      </template>
      <template #page-3>
        <Fieldset>
          <div class="prose prose-2xl pb-4">
            <p>How many&hellip;</p>
          </div>
          <div>
            <Label for="section_b_7">
              <strong>&hellip;sides are on a heptagon?</strong>
            </Label>
            <Field id="section_b_7" v-model="form.section_b_7" class="form-field" />
            <Error :message="form.errors.section_b_7" class="mt-1" />
          </div>
          <div>
            <Label for="section_b_8">
              <strong>&hellip;degrees are in a right angle?</strong>
            </Label>
            <Field id="section_b_8" v-model="form.section_b_8" class="form-field" />
            <Error :message="form.errors.section_b_8" class="mt-1" />
          </div>
          <div>
            <Label for="section_b_9">
              <strong>&hellip;days are in a leap year?</strong>
            </Label>
            <Field id="section_b_9" v-model="form.section_b_9" class="form-field" />
            <Error :message="form.errors.section_b_9" class="mt-1" />
          </div>
        </Fieldset>
      </template>
    </Slide>
  </form>
</template>
