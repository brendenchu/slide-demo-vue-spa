import { describe, it, expect } from 'vitest'
import { numChecked, delta, nullifyFields } from '../src/utils/form'

describe('numChecked', () => {
  it('counts truthy fields', () => {
    const form = { a: true, b: false, c: 'yes', d: null, e: 1 }
    expect(numChecked(form, ['a', 'b', 'c', 'd', 'e'])).toBe(3)
  })

  it('returns 0 when all fields are falsy', () => {
    const form = { a: false, b: null, c: 0, d: '' }
    expect(numChecked(form, ['a', 'b', 'c', 'd'])).toBe(0)
  })

  it('returns 0 for empty field list', () => {
    const form = { a: true }
    expect(numChecked(form, [])).toBe(0)
  })

  it('handles missing fields gracefully', () => {
    const form = { a: true }
    expect(numChecked(form, ['a', 'nonexistent'])).toBe(1)
  })
})

describe('delta', () => {
  it('returns 1 when no toggled fields defined', () => {
    expect(delta(1, {}, undefined)).toBe(1)
  })

  it('returns 1 when no toggled fields for the current page', () => {
    const toggledFields = { 2: { checkbox_a: 'field_a' } }
    const form = { checkbox_a: false }
    expect(delta(1, form, toggledFields)).toBe(1)
  })

  it('returns 1 when at least one checkbox is checked', () => {
    const toggledFields = { 1: { checkbox_a: 'field_a', checkbox_b: 'field_b' } }
    const form = { checkbox_a: true, checkbox_b: false }
    expect(delta(1, form, toggledFields)).toBe(1)
  })

  it('returns 2 when no checkboxes are checked (skip page)', () => {
    const toggledFields = { 1: { checkbox_a: 'field_a', checkbox_b: 'field_b' } }
    const form = { checkbox_a: false, checkbox_b: false }
    expect(delta(1, form, toggledFields)).toBe(2)
  })

  it('returns 2 when checkbox fields are null', () => {
    const toggledFields = { 1: { checkbox_a: 'field_a' } }
    const form = { checkbox_a: null }
    expect(delta(1, form, toggledFields)).toBe(2)
  })
})

describe('nullifyFields', () => {
  it('sets toggled fields to null when checkbox is unchecked', () => {
    const form: Record<string, unknown> = {
      checkbox_a: false,
      field_a: 'some value',
      checkbox_b: true,
      field_b: 'keep this',
    }
    const toggledFields = {
      1: { checkbox_a: 'field_a', checkbox_b: 'field_b' },
    }

    nullifyFields(form, toggledFields, 1)

    expect(form['field_a']).toBeNull()
    expect(form['field_b']).toBe('keep this')
  })

  it('does nothing when no toggled fields for page', () => {
    const form: Record<string, unknown> = { field_a: 'value' }
    const toggledFields = { 2: { checkbox: 'field' } }

    nullifyFields(form, toggledFields, 1)

    expect(form['field_a']).toBe('value')
  })

  it('does nothing when all checkboxes are checked', () => {
    const form: Record<string, unknown> = {
      checkbox_a: true,
      field_a: 'keep',
    }
    const toggledFields = { 1: { checkbox_a: 'field_a' } }

    nullifyFields(form, toggledFields, 1)

    expect(form['field_a']).toBe('keep')
  })

  it('handles empty toggled fields', () => {
    const form: Record<string, unknown> = { field: 'value' }
    nullifyFields(form, {}, 1)
    expect(form['field']).toBe('value')
  })
})
