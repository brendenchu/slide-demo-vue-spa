import type { Project } from '@/types/models'
import type { ProjectStep } from '@/types/story'
import type { StoryForm, StoryFormOptions } from '@/composables/useStoryForm'

/**
 * Save form data to the store
 */
export function saveForm<T extends Record<string, unknown>>(
  form: StoryForm<T>,
  _options: {
    project: Project
    step: ProjectStep
    page: number
    token: string
  },
  onSuccess: () => void,
  onError?: () => void
) {
  // The URL is not used in SPA mode, but we keep it for API compatibility
  const formOptions: StoryFormOptions = {
    preserveScroll: true,
    onSuccess: onSuccess,
    onError: onError,
  }

  form.post('', formOptions)
}

/**
 * Count the number of truthy fields in the form data
 */
export function numChecked(form: object, fields: string[]): number {
  const data = form as Record<string, unknown>
  return fields.filter((field) => !!data[field]).length
}

/**
 * Calculate the page delta based on toggled fields
 */
export function delta(
  page: number,
  form: object,
  toggledFields?: Record<number, Record<string, string>>
): number {
  let d = 1

  if (toggledFields?.[page]) {
    const pageFields = toggledFields[page]
    if (pageFields && numChecked(form, Object.keys(pageFields)) === 0) {
      d++
    }
  }
  return d
}

/**
 * Nullify form fields based on checkbox state
 */
export function nullifyFields<T extends Record<string, unknown>>(
  form: StoryForm<T> | Record<string, unknown>,
  toggledFields: Record<number, Record<string, string>>,
  page: number
) {
  // If any checkboxes are checked, set the fields that are toggled to null
  if (toggledFields[page]) {
    for (const [check, field] of Object.entries(toggledFields[page])) {
      if (!form[check as keyof typeof form]) {
        form[field as keyof typeof form] = null as unknown as (typeof form)[keyof typeof form]
      }
    }
  }
}
