import { onMounted, ref, type Ref } from 'vue'
import { useStoryForm, type StoryForm } from './useStoryForm'
import type { StoryProject } from '../types/story'
import type { ProjectStep } from '../types/story'
import type { Action, SlideOptions } from '@bchu/vue-slide'
import { delta, nullifyFields, saveForm } from '../utils/form'
import { prevNextSteps } from '../utils/workflow'
import { useRouter, type Router } from 'vue-router'
import type { ZodSchema } from 'zod'

function delay(ms: number = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface SectionFormProps<T extends Record<string, unknown>> {
  project: StoryProject
  step: ProjectStep
  token: string
  page: number
  story: T
}

interface OnCompleteContext<T extends Record<string, unknown>> {
  router: Router
  props: SectionFormProps<T>
  steps: { previous: string | null; next: string | null }
}

export interface UseSectionFormOptions<T extends Record<string, unknown>> {
  props: SectionFormProps<T>
  pages: number
  schema: ZodSchema | ((currentPage: number) => ZodSchema)
  toggledFields?: Record<number, Record<string, string>>
  previousStepPage?: string
  onComplete?: (context: OnCompleteContext<T>) => Promise<void>
  save: (projectId: string, stepId: string, data: Record<string, unknown>) => Promise<void>
  onError?: (message: string) => void
  routes?: { form: string; complete: string }
}

export interface UseSectionFormReturn<T extends Record<string, unknown>> {
  form: StoryForm<T>
  current: Ref<number>
  previous: Ref<number>
  pages: Ref<number>
  actions: Ref<SlideOptions<Action>>
  steps: { previous: string | null; next: string | null }
}

export function useSectionForm<T extends Record<string, unknown>>(
  options: UseSectionFormOptions<T>
): UseSectionFormReturn<T> {
  const { props, toggledFields = {} } = options
  const router = useRouter()
  const formRouteName = options.routes?.form ?? 'story.form'

  const current = ref<number>(0)
  const previous = ref<number>(0)
  const pages = ref<number>(options.pages)

  // Wrap page-dependent schema functions into the () => ZodSchema format that useStoryForm expects
  const validationSchema: ZodSchema | (() => ZodSchema) =
    typeof options.schema === 'function'
      ? () => (options.schema as (page: number) => ZodSchema)(current.value)
      : options.schema

  const form = useStoryForm<T>(
    props.story,
    {
      project: props.project,
      step: props.step,
      token: props.token,
      save: options.save,
      onError: options.onError,
    },
    {
      schema: validationSchema,
      validateOnSave: true,
    }
  )

  const steps = prevNextSteps(props.step)

  // Default onComplete: navigate to next step
  const onComplete =
    options.onComplete ??
    (async ({ router, props, steps }: OnCompleteContext<T>) => {
      await delay()
      router.push({
        name: formRouteName,
        params: { id: props.project.id },
        query: {
          step: steps.next,
          token: props.token,
        },
      })
    })

  const actions = ref<SlideOptions<Action>>({
    next: {
      label: 'Save & Continue \u00BB',
      callback: () => {
        nullifyFields(form, toggledFields, current.value)
        saveForm(
          form,
          {
            project: props.project,
            step: props.step,
            page: current.value,
            token: props.token,
          },
          async () => {
            current.value += delta(current.value, form, toggledFields)
            previous.value = current.value - 1
            if (current.value > pages.value) {
              await onComplete({ router, props, steps })
            }
          }
        )
      },
    },
    previous: {
      label: '\u00AB Go Back',
      ...(options.previousStepPage !== undefined && { forced: true }),
      callback: async () => {
        if (options.previousStepPage !== undefined) {
          // Cross-step back navigation
          const nextPage = current.value - delta(current.value - 2, form, toggledFields)

          if (nextPage < 1) {
            current.value = 0
            previous.value = 1
            await delay()
            router.push({
              name: formRouteName,
              params: { id: props.project.id },
              query: {
                step: steps.previous,
                token: props.token,
                page: options.previousStepPage,
                direction: 'previous',
              },
            })
          } else {
            current.value = nextPage
            previous.value = current.value - 1
          }
        } else {
          // Simple within-section back navigation
          current.value -= delta(current.value, form, toggledFields)
          previous.value = current.value - 1
        }
      },
    },
  })

  onMounted(() => {
    current.value = props.page
    previous.value = current.value - 1
  })

  return {
    form,
    current: current as Ref<number>,
    previous: previous as Ref<number>,
    pages: pages as Ref<number>,
    actions: actions as Ref<SlideOptions<Action>>,
    steps,
  }
}
