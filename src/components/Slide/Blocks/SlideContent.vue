<script setup lang="ts">
import type { Direction } from '../types'

withDefaults(
  defineProps<{
    direction?: Direction
    active?: boolean
  }>(),
  {
    direction: 'next',
    active: false,
  }
)
</script>

<template>
  <div class="absolute w-full h-full transition-transform duration-500 ease-in-out"
    :class="{
      'translate-x-0': active,
      'translate-x-full': !active && direction === 'next',
      '-translate-x-full': !active && direction === 'previous',
    }"
  >
    <div class="contained w-full h-full">
      <slot />
    </div>
  </div>
</template>
