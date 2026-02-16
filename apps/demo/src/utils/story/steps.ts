export interface StepConfig {
  id: string
  slug: string
  name: string
  fields: string[]
  fieldsPerPage: number
}

export const STEP_CONFIGS: Record<string, StepConfig> = {
  intro: {
    id: 'intro',
    slug: 'intro',
    name: 'Introduction',
    fields: ['intro_1', 'intro_2', 'intro_3'],
    fieldsPerPage: 3,
  },
  'section-a': {
    id: 'section-a',
    slug: 'section-a',
    name: 'Section A',
    fields: [
      'section_a_1',
      'section_a_2',
      'section_a_3',
      'section_a_4',
      'section_a_5',
      'section_a_6',
    ],
    fieldsPerPage: 3,
  },
  'section-b': {
    id: 'section-b',
    slug: 'section-b',
    name: 'Section B',
    fields: [
      'section_b_1',
      'section_b_2',
      'section_b_3',
      'section_b_4',
      'section_b_5',
      'section_b_6',
      'section_b_7',
      'section_b_8',
      'section_b_9',
    ],
    fieldsPerPage: 3,
  },
  'section-c': {
    id: 'section-c',
    slug: 'section-c',
    name: 'Section C',
    fields: [
      'section_c_1',
      'section_c_2',
      'section_c_3',
      'section_c_4',
      'section_c_5',
      'section_c_6',
      'section_c_7',
      'section_c_8',
      'section_c_9',
    ],
    fieldsPerPage: 1,
  },
  complete: {
    id: 'complete',
    slug: 'complete',
    name: 'Complete',
    fields: [],
    fieldsPerPage: 0,
  },
}

export function getStepConfig(stepId: string): StepConfig {
  const config = STEP_CONFIGS[stepId]
  if (!config) {
    console.warn(`Step config not found for: ${stepId}, defaulting to intro`)
    return STEP_CONFIGS['intro']!
  }
  return config
}

export function getStepOrder(): string[] {
  return ['intro', 'section-a', 'section-b', 'section-c']
}
