<script setup lang="ts">
const currentYear = new Date().getFullYear()
const copyrightYear = currentYear > 2023 ? `2023 - ${currentYear}` : '2023'
</script>

<template>
  <footer class="bg-white">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
      <slot />
      <span>&copy; {{ copyrightYear }} Brenden Chu</span>
    </div>
  </footer>
</template>
