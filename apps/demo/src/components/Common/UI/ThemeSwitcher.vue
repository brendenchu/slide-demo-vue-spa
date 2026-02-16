<script lang="ts" setup>
import { useThemeStore } from '@/stores/theme'
import type { ThemeId } from '@/stores/theme'

const themeStore = useThemeStore()

function onThemeChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  themeStore.setTheme(target.value as ThemeId)
}
</script>

<template>
  <div class="flex items-center">
    <select
      :value="themeStore.currentTheme"
      class="select select-bordered select-sm bg-base-200 text-base-content border-base-300 text-xs"
      @change="onThemeChange"
    >
      <option
        v-for="theme in themeStore.availableThemes"
        :key="theme.id"
        :value="theme.id"
      >
        {{ theme.label }}
      </option>
    </select>
  </div>
</template>
