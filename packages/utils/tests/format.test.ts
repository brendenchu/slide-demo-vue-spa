import { describe, it, expect } from 'vitest'
import { toMoney, toPercent } from '../src/format'

describe('toMoney', () => {
  it('formats a positive number as CAD currency', () => {
    const result = toMoney(1234.56)
    expect(result).toContain('1,234.56')
    expect(result).toContain('$')
  })

  it('formats zero', () => {
    const result = toMoney(0)
    expect(result).toContain('0.00')
  })

  it('formats null as zero', () => {
    const result = toMoney(null)
    expect(result).toContain('0.00')
  })

  it('formats negative numbers', () => {
    const result = toMoney(-500)
    expect(result).toContain('500.00')
  })

  it('formats small decimal values', () => {
    const result = toMoney(0.99)
    expect(result).toContain('0.99')
  })
})

describe('toPercent', () => {
  it('formats a decimal as percentage', () => {
    expect(toPercent(0.5)).toBe('50.00%')
  })

  it('formats 1 as 100%', () => {
    expect(toPercent(1)).toBe('100.00%')
  })

  it('formats 0 as 0%', () => {
    expect(toPercent(0)).toBe('0.00%')
  })

  it('formats null as 0%', () => {
    expect(toPercent(null)).toBe('0.00%')
  })

  it('applies exact mode (divides by 100 first)', () => {
    expect(toPercent(50, true)).toBe('50.00%')
  })

  it('exact mode with 100 returns 100%', () => {
    expect(toPercent(100, true)).toBe('100.00%')
  })

  it('exact mode with 0 returns 0%', () => {
    expect(toPercent(0, true)).toBe('0.00%')
  })

  it('exact mode with null returns 0%', () => {
    expect(toPercent(null, true)).toBe('0.00%')
  })

  it('formats values greater than 1 without exact mode', () => {
    expect(toPercent(1.5)).toBe('150.00%')
  })
})
