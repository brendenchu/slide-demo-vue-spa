<script lang="ts" setup>
import ApplicationLogo from '@/components/Common/UI/ApplicationLogo.vue'
import PageFooter from '@/components/Common/Layout/PageFooter.vue'
import DemoBanner from '@/components/Demo/DemoBanner.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
    <DemoBanner class="w-full fixed top-0 z-50" />
    <div class="w-full sm:max-w-md mt-4 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
      <div class="flex justify-center p-6 md:p-12">
        <ApplicationLogo class="fill-current text-gray-500" />
      </div>
      <slot />
      <!-- Page Footer -->
      <PageFooter />
    </div>
  </div>
</template>
