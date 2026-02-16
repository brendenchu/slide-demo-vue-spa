import { describe, it, expect } from 'vitest'
import { divide } from '../src/math'

describe('divide', () => {
  it('divides two positive numbers', () => {
    expect(divide(10, 2)).toBe(5)
  })

  it('divides with decimal result', () => {
    expect(divide(1, 3)).toBeCloseTo(0.3333, 4)
  })

  it('returns 0 when numerator is null', () => {
    expect(divide(null, 5)).toBe(0)
  })

  it('returns 0 when denominator is null', () => {
    expect(divide(10, null)).toBe(0)
  })

  it('returns 0 when both are null', () => {
    expect(divide(null, null)).toBe(0)
  })

  it('returns 0 when numerator is 0', () => {
    expect(divide(0, 5)).toBe(0)
  })

  it('returns 0 when denominator is 0', () => {
    expect(divide(10, 0)).toBe(0)
  })

  it('handles negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5)
    expect(divide(10, -2)).toBe(-5)
    expect(divide(-10, -2)).toBe(5)
  })
})
