<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useUiStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import UserAvatar from '../common/UserAvatar.vue'

const ui = useUiStore()
const auth = useAuthStore()
const route = useRoute()

const navItems = [
  { name: 'Dashboard', to: '/dashboard', icon: 'grid' },
  { name: 'Workstreams', to: '/workstreams', icon: 'layers' },
  { name: 'Reports', to: '/reports', icon: 'file-text' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <aside
    :class="[
      'flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex-shrink-0',
      ui.sidebarCollapsed ? 'w-16' : 'w-60',
    ]"
  >
    <!-- Logo -->
    <div class="h-14 flex items-center border-b border-slate-200 dark:border-slate-800 flex-shrink-0 px-4 gap-3">
      <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <span v-if="!ui.sidebarCollapsed" class="font-bold text-slate-900 dark:text-white text-sm tracking-tight">RSGS Flow</span>
      <button
        class="ml-auto p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        @click="ui.toggleSidebarCollapse()"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ui.sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
          isActive(item.to)
            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
        ]"
        :title="ui.sidebarCollapsed ? item.name : undefined"
      >
        <!-- Grid icon -->
        <svg v-if="item.icon === 'grid'" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <!-- Layers icon -->
        <svg v-if="item.icon === 'layers'" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <!-- File text icon -->
        <svg v-if="item.icon === 'file-text'" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span v-if="!ui.sidebarCollapsed">{{ item.name }}</span>
      </RouterLink>
    </nav>

    <!-- User -->
    <div class="border-t border-slate-200 dark:border-slate-800 p-3">
      <div class="flex items-center gap-3">
        <UserAvatar :name="auth.user?.name" :avatar-url="auth.user?.avatar_url" size="sm" />
        <div v-if="!ui.sidebarCollapsed" class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-900 dark:text-white truncate">{{ auth.user?.name ?? 'User' }}</p>
          <p class="text-xs text-slate-500 truncate">{{ auth.user?.email }}</p>
        </div>
        <button
          v-if="!ui.sidebarCollapsed"
          class="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Sign out"
          @click="auth.signOut()"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>
