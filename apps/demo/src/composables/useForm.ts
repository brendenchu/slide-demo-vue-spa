import { reactive, ref } from 'vue'
import { getApiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'

export interface FormOptions {
  onSuccess?: (data: unknown) => void
  onError?: (errors: Record<string, string>) => void
  onFinish?: () => void
  preserveScroll?: boolean
}

export interface UseFormReturn<T> {
  data: T
  errors: Record<string, string>
  processing: boolean
  recentlySuccessful: boolean
  submit: (method: string, url: string, options?: FormOptions) => Promise<void>
  post: (url: string, options?: FormOptions) => Promise<void>
  put: (url: string, options?: FormOptions) => Promise<void>
  patch: (url: string, options?: FormOptions) => Promise<void>
  delete: (url: string, options?: FormOptions) => Promise<void>
  get: (url: string, options?: FormOptions) => Promise<void>
  reset: (...fields: (keyof T)[]) => void
  clearErrors: (...fields: string[]) => void
  setError: (field: string, message: string) => void
}

export function useForm<T extends Record<string, unknown>>(initialData: T): UseFormReturn<T> {
  const api = getApiClient()
  const data = reactive<T>({ ...initialData }) as T
  const errors = reactive<Record<string, string>>({})
  const processing = ref(false)
  const recentlySuccessful = ref(false)

  async function submit(method: string, url: string, options: FormOptions = {}) {
    processing.value = true
    Object.keys(errors).forEach((key) => delete errors[key])
    recentlySuccessful.value = false

    try {
      const config = method === 'get' ? { params: data } : { data }
      const response = await api.request({ method, url, ...config })

      recentlySuccessful.value = true
      options.onSuccess?.(response.data?.data)

      setTimeout(() => {
        recentlySuccessful.value = false
      }, 2000)
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>
      const responseErrors = axiosError.response?.data?.errors || {}

      // Flatten array error messages to single strings
      const flatErrors: Record<string, string> = {}
      for (const [key, messages] of Object.entries(responseErrors)) {
        flatErrors[key] = Array.isArray(messages) ? (messages[0] ?? '') : String(messages)
      }

      Object.assign(errors, flatErrors)
      options.onError?.(flatErrors)
    } finally {
      processing.value = false
      options.onFinish?.()
    }
  }

  async function post(url: string, options?: FormOptions) {
    return submit('post', url, options)
  }

  async function put(url: string, options?: FormOptions) {
    return submit('put', url, options)
  }

  async function patch(url: string, options?: FormOptions) {
    return submit('patch', url, options)
  }

  async function deleteMethod(url: string, options?: FormOptions) {
    return submit('delete', url, options)
  }

  async function get(url: string, options?: FormOptions) {
    return submit('get', url, options)
  }

  function reset(...fields: (keyof T)[]) {
    if (fields.length === 0) {
      Object.assign(data, initialData)
    } else {
      fields.forEach((field) => {
        data[field] = initialData[field]
      })
    }
  }

  function clearErrors(...fields: string[]) {
    if (fields.length === 0) {
      Object.keys(errors).forEach((key) => delete errors[key])
    } else {
      fields.forEach((field) => {
        delete errors[field]
      })
    }
  }

  function setError(field: string, message: string) {
    errors[field] = message
  }

  return reactive({
    data,
    errors,
    processing,
    recentlySuccessful,
    submit,
    post,
    put,
    patch,
    delete: deleteMethod,
    get,
    reset,
    clearErrors,
    setError,
  }) as unknown as UseFormReturn<T>
}
