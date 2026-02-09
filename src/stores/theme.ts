import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ThemeId = 'cyberpunk' | 'corporate'

export interface ThemeOption {
  id: ThemeId
  label: string
}

const STORAGE_KEY = 'vsd:theme'
const DEFAULT_THEME: ThemeId = 'cyberpunk'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeId>(DEFAULT_THEME)

  const availableThemes = computed<ThemeOption[]>(() => [
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'corporate', label: 'Corporate' },
  ])

  function setTheme(theme: ThemeId): void {
    currentTheme.value = theme
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }

  function initTheme(): void {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    const theme = stored && ['cyberpunk', 'corporate'].includes(stored) ? stored : DEFAULT_THEME
    setTheme(theme)
  }

  return {
    currentTheme,
    availableThemes,
    setTheme,
    initTheme,
  }
})
