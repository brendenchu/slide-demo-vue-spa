<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <button class="btn btn-outline btn-primary btn-sm rounded-btn" @click="logout">
    <span>Log Out</span>
  </button>
</template>

<style scoped lang="postcss"></style>
