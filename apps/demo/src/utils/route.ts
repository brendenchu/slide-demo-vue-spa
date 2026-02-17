import router from '@/router'
import type { RouteParams } from 'vue-router'

/**
 * Generate route URL by name
 *
 * @param name - Route name
 * @param params - Route parameters
 * @returns Route path or full route object
 */
export function route(name: string, params?: RouteParams): string {
  try {
    const resolved = router.resolve({ name, params })
    return resolved.href
  } catch (error) {
    console.warn(`Route "${name}" not found`, error)
    return '#'
  }
}
