import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme, BreadcrumbItem } from '../types'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const sidebarCollapsed = ref(false)
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) ?? 'system')
  const commandPaletteOpen = ref(false)
  const breadcrumbs = ref<BreadcrumbItem[]>([])

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function toggleSidebarCollapse() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setTheme(t: Theme) {
    theme.value = t
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  function applyTheme(t: Theme) {
    const isDark =
      t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }

  function openCommandPalette() {
    commandPaletteOpen.value = true
  }

  function closeCommandPalette() {
    commandPaletteOpen.value = false
  }

  function setBreadcrumbs(items: BreadcrumbItem[]) {
    breadcrumbs.value = items
  }

  watch(
    theme,
    (t) => applyTheme(t),
    { immediate: true }
  )

  return {
    sidebarOpen,
    sidebarCollapsed,
    theme,
    commandPaletteOpen,
    breadcrumbs,
    toggleSidebar,
    toggleSidebarCollapse,
    setTheme,
    openCommandPalette,
    closeCommandPalette,
    setBreadcrumbs,
  }
})
