import { reactive, ref } from 'vue'
import type { Ref } from 'vue'

export interface FormOptions {
  onSuccess?: (data: unknown) => void
  onError?: (errors: Record<string, string>) => void
  onFinish?: () => void
  preserveScroll?: boolean
}

export interface UseFormReturn<T> {
  data: T
  errors: Record<string, string>
  processing: Ref<boolean>
  recentlySuccessful: Ref<boolean>
  submit: (options?: FormOptions) => Promise<void>
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
  const data = reactive<T>({ ...initialData }) as T
  const errors = reactive<Record<string, string>>({})
  const processing = ref(false)
  const recentlySuccessful = ref(false)

  async function submit(options: FormOptions = {}) {
    processing.value = true
    Object.keys(errors).forEach((key) => delete errors[key])
    recentlySuccessful.value = false

    try {
      // For demo: simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Simulated success
      recentlySuccessful.value = true
      options.onSuccess?.(data)

      // Reset recentlySuccessful after 2 seconds
      setTimeout(() => {
        recentlySuccessful.value = false
      }, 2000)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string> } } }
      const responseErrors = err.response?.data?.errors || {}
      Object.assign(errors, responseErrors)
      options.onError?.(responseErrors)
    } finally {
      processing.value = false
      options.onFinish?.()
    }
  }

  async function post(_url: string, options?: FormOptions) {
    return submit(options)
  }

  async function put(_url: string, options?: FormOptions) {
    return submit(options)
  }

  async function patch(_url: string, options?: FormOptions) {
    return submit(options)
  }

  async function deleteMethod(_url: string, options?: FormOptions) {
    return submit(options)
  }

  async function get(_url: string, options?: FormOptions) {
    return submit(options)
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

  return {
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
  }
}
