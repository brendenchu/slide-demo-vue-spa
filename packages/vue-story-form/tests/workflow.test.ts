import { describe, it, expect } from 'vitest'
import { prevNextSteps } from '../src/utils/workflow'
import type { ProjectStep } from '../src/types/story'

function makeStep(id: string): ProjectStep {
  return { id, slug: id, name: id }
}

describe('prevNextSteps', () => {
  it('returns correct navigation for intro', () => {
    expect(prevNextSteps(makeStep('intro'))).toEqual({
      previous: null,
      next: 'section-a',
    })
  })

  it('returns correct navigation for section-a', () => {
    expect(prevNextSteps(makeStep('section-a'))).toEqual({
      previous: 'intro',
      next: 'section-b',
    })
  })

  it('returns correct navigation for section-b', () => {
    expect(prevNextSteps(makeStep('section-b'))).toEqual({
      previous: 'section-a',
      next: 'section-c',
    })
  })

  it('returns correct navigation for section-c', () => {
    expect(prevNextSteps(makeStep('section-c'))).toEqual({
      previous: 'section-b',
      next: null,
    })
  })

  it('returns null for both on unknown step', () => {
    expect(prevNextSteps(makeStep('unknown'))).toEqual({
      previous: null,
      next: null,
    })
  })
})
