import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { Router } from 'vue-router'

/**
 * Axios error response structure from API
 */
export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  [key: string]: unknown
}

/**
 * API client instance configured for backend
 */
let api: AxiosInstance | null = null

/**
 * Router instance for navigation (set during app initialization)
 */
let router: Router | null = null

/**
 * Set the router instance for error handling redirects
 */
export function setRouter(routerInstance: Router): void {
  router = routerInstance
}

/**
 * Create and configure axios instance
 */
function createAxiosInstance(): AxiosInstance {
  const baseURL = import.meta.env.VITE_API_URL
  const isDebug = import.meta.env.VITE_DEBUG === 'true'

  if (!baseURL) {
    throw new Error('VITE_API_URL is not configured in environment variables')
  }

  const instance = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: true, // Enable credentials for CSRF token support
  })

  /**
   * Request interceptor: Add authentication token
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const storedToken = localStorage.getItem('vsd:auth:token')

      if (storedToken && config.headers) {
        // Parse the token since it's stored as JSON by the storage adapter
        let token = storedToken
        try {
          // If it's JSON stringified, parse it
          const parsed = JSON.parse(storedToken)
          token = typeof parsed === 'string' ? parsed : storedToken
        } catch {
          // If parsing fails, use the raw value (backwards compatibility)
          token = storedToken
        }

        config.headers.Authorization = `Bearer ${token}`
      }

      if (isDebug) {
        console.log('[API Request]', config.method?.toUpperCase(), config.url, config.data)
      }

      return config
    },
    (error) => {
      if (isDebug) {
        console.error('[API Request Error]', error)
      }
      return Promise.reject(error)
    }
  )

  /**
   * Response interceptor: Handle errors globally
   */
  instance.interceptors.response.use(
    (response) => {
      if (isDebug) {
        console.log('[API Response]', response.config.url, response.data)
      }
      return response
    },
    async (error: AxiosError<ApiErrorResponse>) => {
      if (isDebug) {
        console.error('[API Response Error]', error.response?.status, error.response?.data)
      }

      // Handle different error types
      if (error.response) {
        const { status, data } = error.response

        switch (status) {
          case 401:
            // Unauthorized - clear auth and redirect to login
            handleUnauthorized()
            break

          case 403:
            // Forbidden - flash demo-related messages as warnings
            if (
              data.message?.startsWith('Demo limit reached') ||
              data.message?.includes('Demo accounts')
            ) {
              const { useFlashStore } = await import('@/stores/flash')
              useFlashStore().warning(data.message)
            } else {
              console.error('Access forbidden:', data.message)
            }
            break

          case 422:
            // Validation errors - let the calling code handle these
            if (isDebug) {
              console.warn('[Validation Errors]', data.errors)
            }
            break

          case 500:
            // Server error - show generic error
            console.error('Server error:', data.message || 'An unexpected error occurred')
            break

          default:
            console.error(`API Error ${status}:`, data.message || 'Unknown error')
        }
      } else if (error.request) {
        // Network error - no response received
        console.error('Network error: Unable to reach the server. Please check your connection.')
      } else {
        // Something else happened
        console.error('Error:', error.message)
      }

      return Promise.reject(error)
    }
  )

  return instance
}

/**
 * Handle 401 Unauthorized responses
 */
function handleUnauthorized(): void {
  // Clear authentication data
  localStorage.removeItem('vsd:auth:token')
  localStorage.removeItem('vsd:auth:user')

  // Redirect to login if router is available
  if (router && router.currentRoute.value.path !== '/login') {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
  }
}

/**
 * Get the configured axios instance
 */
export function getApiClient(): AxiosInstance {
  if (!api) {
    api = createAxiosInstance()
  }
  return api
}

/**
 * Extract error message from axios error
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return (
      axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred'
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError(error) && error.response?.status === 422
}

/**
 * Extract validation errors from 422 response
 */
export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (isValidationError(error)) {
    return error.response?.data?.errors || {}
  }
  return {}
}

/**
 * Default export - the axios instance
 */
export default getApiClient()
