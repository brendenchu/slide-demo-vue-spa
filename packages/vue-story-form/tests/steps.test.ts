import { describe, it, expect, vi } from 'vitest'
import { getStepConfig, getStepOrder, STEP_CONFIGS } from '../src/utils/steps'

describe('STEP_CONFIGS', () => {
  it('contains all expected steps', () => {
    expect(Object.keys(STEP_CONFIGS)).toEqual([
      'intro',
      'section-a',
      'section-b',
      'section-c',
      'complete',
    ])
  })

  it('intro has 3 fields with 3 per page', () => {
    expect(STEP_CONFIGS['intro']?.fields).toHaveLength(3)
    expect(STEP_CONFIGS['intro']?.fieldsPerPage).toBe(3)
  })

  it('section-a has 6 fields with 3 per page', () => {
    expect(STEP_CONFIGS['section-a']?.fields).toHaveLength(6)
    expect(STEP_CONFIGS['section-a']?.fieldsPerPage).toBe(3)
  })

  it('section-b has 9 fields with 3 per page', () => {
    expect(STEP_CONFIGS['section-b']?.fields).toHaveLength(9)
    expect(STEP_CONFIGS['section-b']?.fieldsPerPage).toBe(3)
  })

  it('section-c has 9 fields with 1 per page', () => {
    expect(STEP_CONFIGS['section-c']?.fields).toHaveLength(9)
    expect(STEP_CONFIGS['section-c']?.fieldsPerPage).toBe(1)
  })

  it('complete has 0 fields', () => {
    expect(STEP_CONFIGS['complete']?.fields).toHaveLength(0)
    expect(STEP_CONFIGS['complete']?.fieldsPerPage).toBe(0)
  })
})

describe('getStepConfig', () => {
  it('returns config for a valid step', () => {
    const config = getStepConfig('intro')
    expect(config.id).toBe('intro')
    expect(config.name).toBe('Introduction')
    expect(config.slug).toBe('intro')
  })

  it('returns intro config for unknown step with warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const config = getStepConfig('nonexistent')
    expect(config.id).toBe('intro')
    expect(warnSpy).toHaveBeenCalledWith(
      'Step config not found for: nonexistent, defaulting to intro'
    )
    warnSpy.mockRestore()
  })
})

describe('getStepOrder', () => {
  it('returns steps in correct order without complete', () => {
    expect(getStepOrder()).toEqual(['intro', 'section-a', 'section-b', 'section-c'])
  })
})
