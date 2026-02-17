import { describe, it, expect } from 'vitest'
import { findLastPosition, calculateProgress } from '../src/utils/progress'
import type { StoryProject } from '../src/types/story'

function makeProject(overrides: Partial<StoryProject> = {}): StoryProject {
  return {
    id: 'test-1',
    status: 'in_progress',
    current_step: 'intro',
    responses: {},
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('findLastPosition', () => {
  it('returns intro page 1 for empty project', () => {
    const project = makeProject()
    expect(findLastPosition(project)).toEqual({ step: 'intro', page: 1 })
  })

  it('finds position in intro with data', () => {
    const project = makeProject({
      responses: {
        intro: { intro_1: 'John', intro_2: 'Doe', intro_3: null },
      },
    })
    expect(findLastPosition(project)).toEqual({ step: 'intro', page: 1 })
  })

  it('finds position in section-b when later steps are empty', () => {
    const project = makeProject({
      responses: {
        intro: { intro_1: 'John', intro_2: 'Doe', intro_3: 'Vancouver' },
        'section-a': { section_a_1: true },
        'section-b': { section_b_1: '2', section_b_2: '-4' },
        'section-c': {},
      },
    })
    expect(findLastPosition(project)).toEqual({ step: 'section-b', page: 1 })
  })

  it('finds correct page in multi-page step', () => {
    const project = makeProject({
      responses: {
        intro: { intro_1: 'John', intro_2: 'Doe', intro_3: 'City' },
        'section-b': {
          section_b_1: '2',
          section_b_2: '-4',
          section_b_3: '9',
          section_b_4: '3',
          section_b_5: null,
          section_b_6: null,
        },
      },
    })
    const result = findLastPosition(project)
    expect(result.step).toBe('section-b')
    expect(result.page).toBe(2)
  })

  it('finds last step when section-c has data', () => {
    const project = makeProject({
      responses: {
        intro: { intro_1: 'John' },
        'section-c': { section_c_1: 'Paris' },
      },
    })
    expect(findLastPosition(project)).toEqual({ step: 'section-c', page: 1 })
  })
})

describe('calculateProgress', () => {
  it('returns 0 for empty project', () => {
    const project = makeProject()
    expect(calculateProgress(project)).toBe(0)
  })

  it('returns 100 for completed project', () => {
    const project = makeProject({ status: 'completed' })
    expect(calculateProgress(project)).toBe(100)
  })

  it('calculates partial progress', () => {
    // Total fields: intro(3) + section-a(6) + section-b(9) + section-c(9) = 27
    const project = makeProject({
      responses: {
        intro: { intro_1: 'John', intro_2: 'Doe', intro_3: 'City' },
      },
    })
    // 3 of 27 filled = ~11%
    expect(calculateProgress(project)).toBe(Math.round((3 / 27) * 100))
  })

  it('ignores null and empty values', () => {
    const project = makeProject({
      responses: {
        intro: { intro_1: 'John', intro_2: null, intro_3: '' },
      },
    })
    // 1 of 27 filled
    expect(calculateProgress(project)).toBe(Math.round((1 / 27) * 100))
  })

  it('handles missing responses gracefully', () => {
    const project = makeProject({ responses: {} })
    expect(calculateProgress(project)).toBe(0)
  })

  it('calculates near-complete progress', () => {
    const responses: Record<string, Record<string, string | boolean>> = {
      intro: { intro_1: 'a', intro_2: 'b', intro_3: 'c' },
      'section-a': {
        section_a_1: true,
        section_a_2: true,
        section_a_3: true,
        section_a_4: 'y',
        section_a_5: 'm',
        section_a_6: 'd',
      },
      'section-b': {
        section_b_1: '1',
        section_b_2: '2',
        section_b_3: '3',
        section_b_4: '4',
        section_b_5: '5',
        section_b_6: '6',
        section_b_7: '7',
        section_b_8: '8',
        section_b_9: '9',
      },
      'section-c': {
        section_c_1: 'Paris',
        section_c_2: 'Tokyo',
        section_c_3: 'Canberra',
        section_c_4: 'Ottawa',
        section_c_5: 'New Delhi',
        section_c_6: 'Brasilia',
        section_c_7: 'Copenhagen',
        section_c_8: 'Nairobi',
        section_c_9: 'Johannesburg',
      },
    }
    const project = makeProject({ responses })
    expect(calculateProgress(project)).toBe(100)
  })
})
