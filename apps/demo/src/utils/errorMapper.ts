import { isValidationError, getValidationErrors, getErrorMessage } from '@/lib/axios'

/**
 * Map API validation errors to form-compatible format
 *
 * API returns errors in this format:
 * {
 *   "field_name": ["Error message 1", "Error message 2"],
 *   "nested.field": ["Error message"]
 * }
 *
 * This function converts it to:
 * {
 *   "field_name": "Error message 1",
 *   "nested.field": "Error message"
 * }
 *
 * @param error - Axios error from API
 * @returns Object with field names as keys and first error message as value
 */
export function mapApiValidationErrors(error: unknown): Record<string, string> {
  if (!isValidationError(error)) {
    return {}
  }

  const validationErrors = getValidationErrors(error)
  const mappedErrors: Record<string, string> = {}

  for (const [field, messages] of Object.entries(validationErrors)) {
    // Convert dot notation to camelCase for Vue forms if needed
    // e.g., "user.first_name" could become "userFirstName"
    // For now, keep the same format
    const message = Array.isArray(messages) ? messages[0] : messages
    if (message) {
      mappedErrors[field] = message
    }
  }

  return mappedErrors
}

/**
 * Format error message for display to users
 *
 * Provides user-friendly error messages based on error type
 *
 * @param error - Error from API call or other operation
 * @returns User-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
  // Handle validation errors specially
  if (isValidationError(error)) {
    const errors = getValidationErrors(error)
    const fieldCount = Object.keys(errors).length

    if (fieldCount === 1) {
      const [messages] = Object.values(errors)
      const message = Array.isArray(messages) ? messages[0] : messages
      return message || 'Validation error occurred'
    }

    return `Please fix ${fieldCount} validation errors`
  }

  // Get the error message
  const message = getErrorMessage(error)

  // Add context for common error types
  if (message.toLowerCase().includes('network')) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }

  if (message.toLowerCase().includes('timeout')) {
    return 'The request took too long. Please try again.'
  }

  if (message.toLowerCase().includes('unauthorized') || message.includes('401')) {
    return 'Your session has expired. Please log in again.'
  }

  if (message.toLowerCase().includes('forbidden') || message.includes('403')) {
    return "You don't have permission to perform this action."
  }

  if (message.toLowerCase().includes('not found') || message.includes('404')) {
    return 'The requested resource was not found.'
  }

  if (message.toLowerCase().includes('server error') || message.includes('500')) {
    return 'A server error occurred. Please try again later.'
  }

  return message
}

/**
 * Extract all validation error messages as an array
 *
 * Useful for displaying all errors in a list
 *
 * @param error - Axios error from API
 * @returns Array of all error messages
 */
export function getAllValidationMessages(error: unknown): string[] {
  if (!isValidationError(error)) {
    return []
  }

  const validationErrors = getValidationErrors(error)
  const messages: string[] = []

  for (const fieldMessages of Object.values(validationErrors)) {
    if (Array.isArray(fieldMessages)) {
      messages.push(...fieldMessages)
    } else {
      messages.push(fieldMessages)
    }
  }

  return messages
}

/**
 * Check if an error has validation errors
 *
 * @param error - Error to check
 * @returns True if error contains validation errors
 */
export function hasValidationErrors(error: unknown): boolean {
  return isValidationError(error)
}

/**
 * Get a specific field's validation error
 *
 * @param error - Axios error from API
 * @param fieldName - Name of the field to get error for
 * @returns Error message for the field, or null if no error
 */
export function getFieldError(error: unknown, fieldName: string): string | null {
  if (!isValidationError(error)) {
    return null
  }

  const validationErrors = getValidationErrors(error)
  const messages = validationErrors[fieldName]

  if (!messages) {
    return null
  }

  const message = Array.isArray(messages) ? messages[0] : messages
  return message || null
}
