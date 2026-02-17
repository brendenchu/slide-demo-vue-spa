import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

describe('Theme Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('defaults to cyberpunk theme', () => {
    const store = useThemeStore()
    expect(store.currentTheme).toBe('cyberpunk')
  })

  it('has 6 available themes', () => {
    const store = useThemeStore()
    expect(store.availableThemes).toHaveLength(6)
  })

  it('availableThemes includes all expected themes', () => {
    const store = useThemeStore()
    const ids = store.availableThemes.map((t) => t.id)
    expect(ids).toEqual(['corporate', 'cyberpunk', 'vaporwave', 'terminal', 'brutalist', 'unicorn'])
  })

  it('setTheme updates currentTheme', () => {
    const store = useThemeStore()
    store.setTheme('terminal')
    expect(store.currentTheme).toBe('terminal')
  })

  it('setTheme persists to localStorage', () => {
    const store = useThemeStore()
    store.setTheme('brutalist')
    expect(localStorage.getItem('vsd:theme')).toBe('brutalist')
  })

  it('setTheme updates document data-theme attribute', () => {
    const store = useThemeStore()
    store.setTheme('vaporwave')
    expect(document.documentElement.dataset.theme).toBe('vaporwave')
  })

  it('initTheme loads valid stored theme', () => {
    localStorage.setItem('vsd:theme', 'unicorn')
    const store = useThemeStore()
    store.initTheme()
    expect(store.currentTheme).toBe('unicorn')
  })

  it('initTheme defaults when stored value is invalid', () => {
    localStorage.setItem('vsd:theme', 'nonexistent-theme')
    const store = useThemeStore()
    store.initTheme()
    expect(store.currentTheme).toBe('cyberpunk')
  })

  it('initTheme defaults when nothing is stored', () => {
    const store = useThemeStore()
    store.initTheme()
    expect(store.currentTheme).toBe('cyberpunk')
  })
})
