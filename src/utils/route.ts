import router from '@/router'
import type { RouteLocationRaw, RouteParams } from 'vue-router'

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

/**
 * Navigate to named route
 *
 * @param name - Route name
 * @param params - Route parameters
 */
export function navigateTo(name: string, params?: RouteParams) {
  router.push({ name, params })
}

/**
 * Get current route name
 */
export function currentRouteName(): string | null | undefined {
  return router.currentRoute.value.name?.toString()
}

/**
 * Check if current route matches name
 */
export function isRoute(name: string): boolean {
  return router.currentRoute.value.name === name
}

/**
 * Generate route location object (for RouterLink :to prop)
 */
export function routeLocation(name: string, params?: RouteParams): RouteLocationRaw {
  return { name, params }
}
