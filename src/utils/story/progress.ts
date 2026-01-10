import type { Project } from '@/types/models'
import { getStepOrder } from './steps'

export interface LastPosition {
  step: string
  page: number
}

/**
 * Find the last position (step and page) with saved data in a project
 */
export function findLastPosition(project: Project): LastPosition {
  const stepOrder = getStepOrder()
  const responses = project.responses || {}

  // Start from the last step and work backwards
  for (let i = stepOrder.length - 1; i >= 0; i--) {
    const step = stepOrder[i]
    if (!step) continue

    const stepData = responses[step] as Record<string, unknown> | undefined

    if (stepData && Object.keys(stepData).length > 0) {
      // Find the last filled field in this step to determine the page
      const page = findLastPageInStep(step, stepData)
      return { step, page }
    }
  }

  // No data found, start at the beginning
  return { step: 'intro', page: 1 }
}

/**
 * Find the last page in a step that has saved data
 */
function findLastPageInStep(step: string, stepData: Record<string, unknown>): number {
  // Define field groups by page for each step
  const pageFields: Record<string, Record<number, string[]>> = {
    intro: {
      1: ['intro_1', 'intro_2', 'intro_3'],
    },
    'section-a': {
      1: ['section_a_1', 'section_a_2', 'section_a_3'],
      2: ['section_a_4', 'section_a_5', 'section_a_6'],
    },
    'section-b': {
      1: ['section_b_1', 'section_b_2', 'section_b_3'],
      2: ['section_b_4', 'section_b_5', 'section_b_6'],
      3: ['section_b_7', 'section_b_8', 'section_b_9'],
    },
    'section-c': {
      1: ['section_c_1'],
      2: ['section_c_2'],
      3: ['section_c_3'],
      4: ['section_c_4'],
      5: ['section_c_5'],
      6: ['section_c_6'],
      7: ['section_c_7'],
      8: ['section_c_8'],
      9: ['section_c_9'],
    },
  }

  const stepPages = pageFields[step]
  if (!stepPages) return 1

  // Find the highest page number with any filled field
  let lastPage = 1
  for (const pageNum of Object.keys(stepPages)
    .map(Number)
    .sort((a, b) => b - a)) {
    const fields = stepPages[pageNum]
    if (!fields) continue

    const hasData = fields.some((field) => {
      const value = stepData[field]
      return value !== null && value !== undefined && value !== ''
    })

    if (hasData) {
      lastPage = pageNum
      break
    }
  }

  return lastPage
}

/**
 * Calculate the progress percentage for a project
 */
export function calculateProgress(project: Project): number {
  if (project.status === 'completed') return 100

  const stepOrder = getStepOrder()
  const responses = project.responses || {}

  // Define total fields per step
  const stepFieldCounts: Record<string, number> = {
    intro: 3,
    'section-a': 6,
    'section-b': 9,
    'section-c': 9,
  }

  let totalFields = 0
  let filledFields = 0

  for (const step of stepOrder) {
    const fieldCount = stepFieldCounts[step] || 0
    totalFields += fieldCount

    const stepData = responses[step] as Record<string, unknown> | undefined
    if (stepData) {
      const filled = Object.values(stepData).filter(
        (value) => value !== null && value !== undefined && value !== ''
      ).length
      filledFields += filled
    }
  }

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
}
