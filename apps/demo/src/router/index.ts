import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { setRouter } from '@/lib/axios'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: { name: 'dashboard' },
  },

  // Auth routes
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/Auth/LoginUser.vue'),
    meta: { guest: true, title: 'Login' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/Auth/RegisterUser.vue'),
    meta: { guest: true, title: 'Register' },
  },
  // Dashboard
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/Account/ClientDashboard.vue'),
    meta: { auth: true, title: 'Dashboard' },
  },

  // Account routes
  {
    path: '/profile',
    name: 'profile.edit',
    component: () => import('@/pages/Account/Profile/EditProfile.vue'),
    meta: { auth: true, title: 'Edit Profile' },
  },
  {
    path: '/terms/accept',
    name: 'terms.accept',
    component: () => import('@/pages/Account/AcceptTerms.vue'),
    meta: { auth: true, title: 'Accept Terms' },
  },
  {
    path: '/team/select',
    name: 'team.select',
    component: () => import('@/pages/Account/Team/SelectTeam.vue'),
    meta: { auth: true, title: 'Select Team' },
  },
  {
    path: '/team/create',
    name: 'team.create',
    component: () => import('@/pages/Account/Team/CreateTeam.vue'),
    meta: { auth: true, title: 'Create Team' },
  },
  {
    path: '/team/:id',
    name: 'team.show',
    component: () => import('@/pages/Account/Team/ShowTeam.vue'),
    meta: { auth: true, title: 'Team Details' },
  },
  {
    path: '/invitations',
    name: 'invitations',
    component: () => import('@/pages/Account/Team/Invitations.vue'),
    meta: { auth: true, title: 'Invitations' },
  },

  // Story routes
  {
    path: '/story/new',
    name: 'story.new',
    component: () => import('@/pages/Story/NewStory.vue'),
    meta: { auth: true, title: 'New Story' },
  },
  {
    path: '/story/:id/continue',
    name: 'story.continue',
    component: () => import('@/pages/Story/ContinueStory.vue'),
    meta: { auth: true, title: 'Continue Story' },
  },
  {
    path: '/story/:id/form',
    name: 'story.form',
    component: () => import('@/pages/Story/StoryForm.vue'),
    meta: { auth: true, title: 'Story Form' },
  },
  {
    path: '/story/:id/complete',
    name: 'story.complete',
    component: () => import('@/pages/Story/CompleteStory.vue'),
    meta: { auth: true, title: 'Story Complete' },
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/Auth/LoginUser.vue'), // Temporary - need NotFound page
    meta: { title: 'Page Not Found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Set router instance for axios error handling
setRouter(router)

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Load user from storage on first navigation if not already loaded
  if (!authStore.user && !to.meta.guest) {
    await authStore.loadUser()
  }

  // Guest-only routes (redirect authenticated users to dashboard)
  if (to.meta.guest && authStore.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  // Auth-required routes (redirect unauthenticated users to login)
  if (to.meta.auth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // Terms acceptance check (redirect to terms page if not accepted)
  if (authStore.isAuthenticated && authStore.mustAcceptTerms && to.name !== 'terms.accept') {
    return next({ name: 'terms.accept' })
  }

  // Update page title
  const title = to.meta.title as string | undefined
  if (title) {
    document.title = `${title} - Vue Slide Demo`
  } else {
    document.title = 'Vue Slide Demo'
  }

  next()
})

export default router
