import { AxiosInstance } from 'axios'
import type { RouteParams } from 'vue-router'

// Define the route helper function type
type RouteHelper = (name: string, params?: RouteParams) => string

declare global {
  interface Window {
    axios: AxiosInstance
  }

  // Make route available globally (for scripts)
  let route: RouteHelper
}

declare module 'vue' {
  interface ComponentCustomProperties {
    // Make route available in Vue templates
    route: RouteHelper
  }
}
