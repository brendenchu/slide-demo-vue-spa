import type { Project } from '@/types/models'
import { STEP_CONFIGS, getStepOrder } from './steps'

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
 * Chunk a step's fields into page groups based on fieldsPerPage from STEP_CONFIGS
 */
function getPageFields(step: string): Record<number, string[]> {
  const config = STEP_CONFIGS[step]
  if (!config || config.fieldsPerPage <= 0) return {}

  const pages: Record<number, string[]> = {}
  for (let i = 0; i < config.fields.length; i += config.fieldsPerPage) {
    const pageNum = Math.floor(i / config.fieldsPerPage) + 1
    pages[pageNum] = config.fields.slice(i, i + config.fieldsPerPage)
  }
  return pages
}

/**
 * Find the last page in a step that has saved data
 */
function findLastPageInStep(step: string, stepData: Record<string, unknown>): number {
  const stepPages = getPageFields(step)
  if (!Object.keys(stepPages).length) return 1

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

  let totalFields = 0
  let filledFields = 0

  for (const step of stepOrder) {
    const fieldCount = STEP_CONFIGS[step]?.fields.length || 0
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
