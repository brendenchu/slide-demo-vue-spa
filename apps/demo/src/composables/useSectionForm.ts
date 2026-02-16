import { onMounted, ref, type Ref } from 'vue'
import { useStoryForm, type StoryForm } from '@/composables/useStoryForm'
import type { Project } from '@/types/models'
import type { ProjectStep } from '@/types/story'
import type { Action, Direction, SlideOptions } from '@bchu/vue-slide'
import { delay } from '@/utils/ui'
import { delta, nullifyFields, saveForm } from '@/utils/story/form'
import { prevNextSteps } from '@/utils/story/workflow'
import { useRouter, type Router } from 'vue-router'
import type { ZodSchema } from 'zod'

export interface SectionFormProps<T extends Record<string, unknown>> {
  project: Project
  step: ProjectStep
  token: string
  page: number
  direction: Direction
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
}

export interface UseSectionFormReturn<T extends Record<string, unknown>> {
  form: StoryForm<T>
  current: Ref<number>
  previous: Ref<number>
  formDirection: Ref<Direction>
  pages: Ref<number>
  actions: Ref<SlideOptions<Action>>
  steps: { previous: string | null; next: string | null }
}

export function useSectionForm<T extends Record<string, unknown>>(
  options: UseSectionFormOptions<T>
): UseSectionFormReturn<T> {
  const { props, toggledFields = {} } = options
  const router = useRouter()

  const current = ref<number>(0)
  const previous = ref<number>(0)
  const formDirection = ref<Direction>('next')
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
        name: 'story.form',
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
            formDirection.value = 'next'
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
          formDirection.value = 'previous'

          if (nextPage < 1) {
            current.value = 0
            previous.value = 1
            await delay()
            router.push({
              name: 'story.form',
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
          formDirection.value = 'previous'
        }
      },
    },
  })

  onMounted(() => {
    current.value = props.page
    previous.value = current.value - 1
    formDirection.value = props.direction
  })

  return {
    form,
    current: current as Ref<number>,
    previous: previous as Ref<number>,
    formDirection: formDirection as Ref<Direction>,
    pages: pages as Ref<number>,
    actions: actions as Ref<SlideOptions<Action>>,
    steps,
  }
}
