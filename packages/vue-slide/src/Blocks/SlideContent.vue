<script setup lang="ts">
withDefaults(
  defineProps<{
    index?: number
    current?: number
  }>(),
  {
    index: 1,
    current: 1,
  }
)
</script>

<template>
  <div
    class="absolute w-full h-full transition-transform duration-500 ease-in-out"
    :class="{
      'translate-x-0': index === current,
      '-translate-x-full': index < current,
      'translate-x-full': index > current,
    }"
  >
    <div class="contained w-full h-full">
      <slot />
    </div>
  </div>
</template>
