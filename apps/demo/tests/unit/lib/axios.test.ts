import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { getErrorMessage, isValidationError, getValidationErrors } from '@/lib/axios'
import type { ApiErrorResponse } from '@/lib/axios'

function createAxiosError(
  status: number,
  data?: Partial<ApiErrorResponse>,
  message = 'Request failed'
): AxiosError<ApiErrorResponse> {
  const error = new AxiosError(message)
  error.response = {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data: { message: data?.message || message, ...data },
  }
  error.isAxiosError = true
  return error
}

describe('getErrorMessage', () => {
  it('extracts message from AxiosError response data', () => {
    const error = createAxiosError(400, { message: 'Bad request' })
    expect(getErrorMessage(error)).toBe('Bad request')
  })

  it('falls back to AxiosError.message when no response data message', () => {
    const error = new AxiosError('Network Error')
    error.isAxiosError = true
    expect(getErrorMessage(error)).toBe('Network Error')
  })

  it('extracts message from generic Error', () => {
    const error = new Error('Something broke')
    expect(getErrorMessage(error)).toBe('Something broke')
  })

  it('returns default message for unknown error types', () => {
    expect(getErrorMessage('string error')).toBe('An unexpected error occurred')
    expect(getErrorMessage(42)).toBe('An unexpected error occurred')
    expect(getErrorMessage(null)).toBe('An unexpected error occurred')
  })
})

describe('isValidationError', () => {
  it('returns true for 422 AxiosError', () => {
    const error = createAxiosError(422, {
      message: 'Validation failed',
      errors: { email: ['Email is required'] },
    })
    expect(isValidationError(error)).toBe(true)
  })

  it('returns false for non-422 AxiosError', () => {
    const error = createAxiosError(400, { message: 'Bad request' })
    expect(isValidationError(error)).toBe(false)
  })

  it('returns false for non-Axios errors', () => {
    expect(isValidationError(new Error('test'))).toBe(false)
    expect(isValidationError('string')).toBe(false)
  })
})

describe('getValidationErrors', () => {
  it('extracts errors from 422 response', () => {
    const error = createAxiosError(422, {
      message: 'Validation failed',
      errors: {
        email: ['Email is required', 'Email must be valid'],
        name: ['Name is required'],
      },
    })

    const errors = getValidationErrors(error)
    expect(errors.email).toEqual(['Email is required', 'Email must be valid'])
    expect(errors.name).toEqual(['Name is required'])
  })

  it('returns empty object for non-validation errors', () => {
    const error = createAxiosError(400, { message: 'Bad request' })
    expect(getValidationErrors(error)).toEqual({})
  })

  it('returns empty object for non-Axios errors', () => {
    expect(getValidationErrors(new Error('test'))).toEqual({})
  })

  it('returns empty object when no errors field in 422 response', () => {
    const error = createAxiosError(422, { message: 'Validation failed' })
    expect(getValidationErrors(error)).toEqual({})
  })
})
