import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from './persistence/storage'
import { DataSourceFactory } from './persistence/dataSourceFactory'
import type { User, Role } from '@/types/models'

export const useAuthStore = defineStore('auth', () => {
  // Create data source instance
  const dataSource = DataSourceFactory.create()

  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)

  // Actions
  async function loadUser() {
    try {
      // Load from localStorage (for persistence across sessions)
      const storedToken = await storage.get<string>('auth:token')
      const storedUser = await storage.get<User>('auth:user')

      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = storedUser
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  async function login(email: string, password: string) {
    try {
      // Use data source for authentication
      const result = await dataSource.login(email, password)

      // Store in state
      user.value = result.user
      token.value = result.token

      // Persist to storage for session persistence
      await storage.set('auth:token', result.token)
      await storage.set('auth:user', result.user)

      return result.user
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      // Use data source for registration
      const result = await dataSource.register({ name, email, password })

      // Store in state
      user.value = result.user
      token.value = result.token

      // Persist to storage for session persistence
      await storage.set('auth:token', result.token)
      await storage.set('auth:user', result.user)

      return result.user
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  async function logout() {
    try {
      // Call data source logout
      await dataSource.logout()

      // Clear state
      user.value = null
      token.value = null

      // Clear storage
      await storage.remove('auth:token')
      await storage.remove('auth:user')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  async function updateProfile(data: Partial<User>) {
    if (!user.value) return

    try {
      // Use data source to update user
      const updated = await dataSource.updateUser(data)

      // Update state
      user.value = updated

      // Persist to storage
      await storage.set('auth:user', updated)
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  function can(permission: string): boolean {
    if (!user.value) return false

    // Use permissions from API
    // Check if user has the permission
    return user.value.permissions.includes(permission)
  }

  function hasRole(role: Role | Role[]): boolean {
    if (!user.value) return false

    if (Array.isArray(role)) {
      // Check if user has any of the specified roles
      return role.some((r) => user.value!.roles.includes(r))
    }

    // Check if user has the specified role
    return user.value.roles.includes(role)
  }

  return {
    // State
    user,
    token,
    // Getters
    isAuthenticated,
    // Actions
    loadUser,
    login,
    register,
    logout,
    updateProfile,
    can,
    hasRole,
  }
})
