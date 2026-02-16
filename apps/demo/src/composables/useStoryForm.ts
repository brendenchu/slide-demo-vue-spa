import { reactive, ref } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useToastStore } from '@/stores/toast'
import type { Project } from '@/types/models'
import type { ProjectStep } from '@/types/story'
import type { ZodSchema } from 'zod'

export interface StoryFormOptions {
  preserveScroll?: boolean
  onSuccess?: () => void
  onError?: () => void
}

export interface ValidationOptions {
  schema?: ZodSchema | (() => ZodSchema) // Support both static and function
  validateOnSave?: boolean
}

export interface StoryFormMethods<T extends Record<string, unknown>> {
  // Errors object
  errors: Record<string, string>
  // Processing state
  processing: boolean
  // Recently successful
  recentlySuccessful: boolean
  // Methods
  post: (url: string, options?: StoryFormOptions) => Promise<void>
  reset: (...fields: (keyof T)[]) => void
  clearErrors: (...fields: string[]) => void
}

export type StoryForm<T extends Record<string, unknown>> = T & StoryFormMethods<T>

export function useStoryForm<T extends Record<string, unknown>>(
  initialData: T,
  context?: {
    project?: Project
    step?: ProjectStep
    token?: string
  },
  validationOptions?: ValidationOptions
): StoryForm<T> {
  const projectsStore = useProjectsStore()
  const toastStore = useToastStore()

  const errors = reactive<Record<string, string>>({})
  const processingRef = ref(false)
  const recentlySuccessfulRef = ref(false)

  // Merge initialData and methods into a reactive object
  const form = reactive({ ...initialData }) as unknown as StoryForm<T>

  // Add methods directly to the reactive object so they can access form properties
  Object.defineProperty(form, 'errors', {
    get: () => errors,
    enumerable: false,
  })

  Object.defineProperty(form, 'processing', {
    get: () => processingRef.value,
    set: (value: boolean) => {
      processingRef.value = value
    },
    enumerable: false,
  })

  Object.defineProperty(form, 'recentlySuccessful', {
    get: () => recentlySuccessfulRef.value,
    set: (value: boolean) => {
      recentlySuccessfulRef.value = value
    },
    enumerable: false,
  })

  Object.defineProperty(form, 'post', {
    value: async (_url: string, formOptions?: StoryFormOptions) => {
      processingRef.value = true
      Object.keys(errors).forEach((key) => delete errors[key])
      recentlySuccessfulRef.value = false

      try {
        // Extract form data (excluding methods and metadata) from the reactive form
        const dataToSave = {} as Record<string, unknown>
        Object.keys(initialData).forEach((key) => {
          dataToSave[key] = form[key as keyof typeof form]
        })

        // Validate if schema is provided
        if (validationOptions?.schema && validationOptions?.validateOnSave !== false) {
          // Get schema - support both static and function
          const schema =
            typeof validationOptions.schema === 'function'
              ? validationOptions.schema()
              : validationOptions.schema

          const result = schema.safeParse(dataToSave)

          if (!result.success) {
            // Convert Zod errors to form errors format
            result.error.issues.forEach((issue) => {
              const fieldName = issue.path.join('.') || 'form'
              errors[fieldName] = issue.message
            })

            toastStore.error('Please fix the validation errors.')
            formOptions?.onError?.()
            processingRef.value = false
            return
          }
        }

        if (!context?.project) {
          throw new Error('Project context is required for story form')
        }

        // Save responses to the project
        await projectsStore.saveResponses(
          context.project.id,
          context.step?.id || 'intro',
          dataToSave
        )

        recentlySuccessfulRef.value = true
        formOptions?.onSuccess?.()

        // Reset recentlySuccessful after 2 seconds
        setTimeout(() => {
          recentlySuccessfulRef.value = false
        }, 2000)
      } catch (error: unknown) {
        const err = error as Error
        toastStore.error(err.message || 'Failed to save form')
        formOptions?.onError?.()
      } finally {
        processingRef.value = false
      }
    },
    enumerable: false,
  })

  Object.defineProperty(form, 'reset', {
    value: (...fields: (keyof T)[]) => {
      if (fields.length === 0) {
        Object.keys(initialData).forEach((key) => {
          ;(form as Record<string, unknown>)[key] = initialData[key as keyof T]
        })
      } else {
        fields.forEach((field) => {
          ;(form as Record<string, unknown>)[field as string] = initialData[field]
        })
      }
    },
    enumerable: false,
  })

  Object.defineProperty(form, 'clearErrors', {
    value: (...fields: string[]) => {
      if (fields.length === 0) {
        Object.keys(errors).forEach((key) => delete errors[key])
      } else {
        fields.forEach((field) => {
          delete errors[field]
        })
      }
    },
    enumerable: false,
  })

  return form
}
