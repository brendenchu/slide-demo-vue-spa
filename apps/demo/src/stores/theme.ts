import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ThemeId = 'corporate' | 'cyberpunk' | 'vaporwave' | 'terminal' | 'brutalist' | 'unicorn'

export interface ThemeOption {
  id: ThemeId
  label: string
}

const STORAGE_KEY = 'vsd:theme'
const DEFAULT_THEME: ThemeId = 'cyberpunk'
const VALID_THEMES: ThemeId[] = [
  'corporate',
  'cyberpunk',
  'vaporwave',
  'terminal',
  'brutalist',
  'unicorn',
]

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeId>(DEFAULT_THEME)

  const availableThemes = computed<ThemeOption[]>(() => [
    { id: 'corporate', label: 'Corporate' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'vaporwave', label: 'Vaporwave' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'brutalist', label: 'Brutalist' },
    { id: 'unicorn', label: 'Unicorn' },
  ])

  function setTheme(theme: ThemeId): void {
    currentTheme.value = theme
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }

  function initTheme(): void {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    const theme = stored && VALID_THEMES.includes(stored) ? stored : DEFAULT_THEME
    setTheme(theme)
  }

  return {
    currentTheme,
    availableThemes,
    setTheme,
    initTheme,
  }
})
