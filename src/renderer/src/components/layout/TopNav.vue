<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUiStore } from '../../stores/ui'
import AppButton from '../ui/AppButton.vue'

const ui = useUiStore()
const route = useRoute()

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/workstreams': 'Workstreams',
  '/reports': 'Reports',
}

function getTitle() {
  return PAGE_TITLES[route.path] ?? route.meta?.title ?? 'RSGS Flow'
}
</script>

<template>
  <header class="h-14 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
    <div class="flex items-center gap-3">
      <h1 class="text-sm font-semibold text-slate-900 dark:text-white">{{ getTitle() }}</h1>

      <!-- Breadcrumbs -->
      <div v-if="ui.breadcrumbs.length > 0" class="flex items-center gap-1.5 text-xs text-slate-500">
        <span v-for="(crumb, i) in ui.breadcrumbs" :key="i" class="flex items-center gap-1.5">
          <svg v-if="i > 0" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <RouterLink v-if="crumb.to" :to="crumb.to" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{{ crumb.label }}</RouterLink>
          <span v-else>{{ crumb.label }}</span>
        </span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Search trigger -->
      <button
        class="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors w-44"
        @click="ui.openCommandPalette()"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search...</span>
        <kbd class="ml-auto font-mono text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1">⌘K</kbd>
      </button>

      <!-- Theme toggle -->
      <button
        class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        @click="ui.setTheme(ui.theme === 'dark' ? 'light' : 'dark')"
      >
        <svg v-if="ui.theme === 'dark'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>
  </header>
</template>
