<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavLink from '@/components/Common/UI/Navigation/NavLink.vue'
import Dropdown from '@/components/Common/UI/Navigation/DropdownMenu.vue'
import DropdownLink from '@/components/Common/UI/Navigation/DropdownLink.vue'
import ResponsiveNavLink from '@/components/Common/UI/Navigation/ResponsiveNavLink.vue'
import FlashProvider from '@/components/Flash/FlashProvider.vue'
import PageFooter from '@/components/Common/Layout/PageFooter.vue'

const router = useRouter()
const currentRoute = useRoute()
const authStore = useAuthStore()
const showingNavigationDropdown = ref(false)

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.can('users.view'))

async function logout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <FlashProvider>
    <div class="min-h-screen bg-gray-100 flex flex-col">
      <nav class="bg-white border-b border-gray-100 z-40">
        <!-- Primary Navigation Menu -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <!-- Logo -->
              <div class="shrink-0 flex items-center">
                <h1 class="text-2xl font-bold text-gray-900">Slide Form Demo</h1>
              </div>

              <!-- Navigation Links -->
              <div class="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                <NavLink href="/dashboard" :active="currentRoute.name === 'dashboard'">
                  Dashboard
                </NavLink>
                <NavLink href="/profile" :active="currentRoute.name === 'profile.edit'">
                  Profile
                </NavLink>
                <NavLink
                  href="/team/select"
                  :active="currentRoute.name?.toString().startsWith('team')"
                >
                  Teams
                </NavLink>
                <NavLink href="/invitations" :active="currentRoute.name === 'invitations'">
                  Invitations
                </NavLink>
                <NavLink
                  v-if="isAdmin"
                  href="/admin"
                  :active="currentRoute.name?.toString().startsWith('admin')"
                >
                  Admin
                </NavLink>
              </div>
            </div>
            <div class="hidden sm:flex sm:items-center sm:ml-6">
              <!-- Settings Dropdown -->
              <div class="ml-3 relative">
                <Dropdown align="right" width="48">
                  <template #trigger>
                    <span class="inline-flex rounded-md">
                      <button
                        class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                        type="button"
                      >
                        <svg
                          fill="currentColor"
                          height="24"
                          viewBox="0 0 512 512"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <!--!Font Awesome Pro 6.5.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.-->
                          <path
                            class="fa-secondary"
                            d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"
                            opacity=".4"
                          />
                          <path
                            class="fa-primary"
                            d="M256 272a72 72 0 1 0 0-144 72 72 0 1 0 0 144zm0 176c56.8 0 107.8-24.7 143-63.8C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8z"
                          />
                        </svg>
                        <svg
                          class="ml-2 -mr-0.5 h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clip-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            fill-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  </template>
                  <template #content>
                    <!-- Authentication -->
                    <div class="flex flex-col px-4 py-2 text-md border-b">
                      <span class="font-bold">{{ user?.name }}</span>
                      <small class="text-gray-600">{{ user?.email }}</small>
                    </div>
                    <DropdownLink :to="{ name: 'profile.edit' }"> Profile </DropdownLink>
                    <button
                      class="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
                      @click="logout"
                    >
                      Log Out
                    </button>
                  </template>
                </Dropdown>
              </div>
            </div>
            <!-- Hamburger -->
            <div class="-mr-2 flex items-center sm:hidden">
              <button
                class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                @click="showingNavigationDropdown = !showingNavigationDropdown"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    :class="{
                      hidden: showingNavigationDropdown,
                      'inline-flex': !showingNavigationDropdown,
                    }"
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                  <path
                    :class="{
                      hidden: !showingNavigationDropdown,
                      'inline-flex': showingNavigationDropdown,
                    }"
                    d="M6 18L18 6M6 6l12 12"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Responsive Navigation Menu -->
        <div
          :class="{ block: showingNavigationDropdown, hidden: !showingNavigationDropdown }"
          class="sm:hidden"
        >
          <div class="pt-2 pb-3 space-y-1">
            <ResponsiveNavLink
              :to="{ name: 'dashboard' }"
              :active="currentRoute.name === 'dashboard'"
            >
              Dashboard
            </ResponsiveNavLink>
            <ResponsiveNavLink
              :to="{ name: 'profile.edit' }"
              :active="currentRoute.name === 'profile.edit'"
            >
              Profile
            </ResponsiveNavLink>
            <ResponsiveNavLink
              :to="{ name: 'team.select' }"
              :active="currentRoute.name?.toString().startsWith('team')"
            >
              Teams
            </ResponsiveNavLink>
            <ResponsiveNavLink
              :to="{ name: 'invitations' }"
              :active="currentRoute.name === 'invitations'"
            >
              Invitations
            </ResponsiveNavLink>
            <ResponsiveNavLink
              v-if="isAdmin"
              :to="{ name: 'admin.dashboard' }"
              :active="currentRoute.name?.toString().startsWith('admin')"
            >
              Admin
            </ResponsiveNavLink>
          </div>

          <!-- Responsive Settings Options -->
          <div class="pt-4 pb-1 border-t border-gray-200">
            <div class="px-4">
              <div class="font-medium text-base text-gray-800">
                {{ user?.name }}
              </div>
              <div class="font-medium text-sm text-gray-500">{{ user?.email }}</div>
            </div>
            <div class="mt-3 space-y-1">
              <ResponsiveNavLink :to="{ name: 'profile.edit' }"> Profile </ResponsiveNavLink>
              <button
                class="block w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-left text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                @click="logout"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Page Heading -->
      <header v-if="$slots.header" class="bg-white shadow z-30">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <slot name="header" />
        </div>
      </header>

      <!-- Page Content -->
      <main class="stretched">
        <slot />
      </main>

      <!-- Page Footer -->
      <PageFooter />
    </div>
  </FlashProvider>
</template>
