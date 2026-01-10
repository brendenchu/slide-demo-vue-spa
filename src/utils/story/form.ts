import { AnyFormFields } from '@/types'
import type { Project } from '@/types/models'
import type { StoryForm, StoryFormOptions } from '@/composables/useStoryForm'

interface ProjectStep {
  id: string
  slug?: string
  name?: string
}

/**
 * Save form data to the store
 */
export function saveForm(
  form: StoryForm<AnyFormFields>,
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
 * Count the number of checked checkboxes in a group
 */
export function numChecked(group: string[]): number {
  let result = 0
  group.forEach((input) => {
    if ((document.getElementById(input) as HTMLInputElement)?.checked) {
      result++
    }
  })
  return result
}

/**
 * Calculate the page delta based on toggled fields
 */
export function delta(page: number, toggledFields?: Record<number, Record<string, string>>) {
  // set delta to 1
  let delta = 1

  // if current page is a key in the toggledFields object
  if (toggledFields && Object.keys(toggledFields).includes(page.toString())) {
    // If no checkboxes are checked, set delta to 2
    const pageFields = toggledFields[page]
    if (pageFields && numChecked(Object.keys(pageFields)) === 0) {
      delta++
    }
  }
  return delta
}

/**
 * Nullify form fields based on checkbox state
 */
export function nullifyFields(
  form: StoryForm<AnyFormFields> | Record<string, unknown>,
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
