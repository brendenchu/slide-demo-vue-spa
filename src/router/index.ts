import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: { name: 'dashboard' }
  }

  // Routes will be added during migration
  // See MIGRATION_PLAN.md Section 6 for full route definitions
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards will be added during migration
// See MIGRATION_PLAN.md Section 6 for implementation

export default router
