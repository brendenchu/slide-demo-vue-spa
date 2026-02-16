import type { ProjectStep } from '../types/story'

/**
 * Get the previous and next steps for navigation
 */
export function prevNextSteps(step: ProjectStep): { previous: string | null; next: string | null } {
  switch (String(step.id)) {
    case 'intro':
      return { previous: null, next: 'section-a' }
    case 'section-a':
      return { previous: 'intro', next: 'section-b' }
    case 'section-b':
      return { previous: 'section-a', next: 'section-c' }
    case 'section-c':
      return { previous: 'section-b', next: null }
    default:
      return { previous: null, next: null }
  }
}
