<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '../components/layout/Sidebar.vue'
import TopNav from '../components/layout/TopNav.vue'
import CommandPalette from '../components/layout/CommandPalette.vue'
import { useUiStore } from '../stores/ui'

const ui = useUiStore()
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
    <Sidebar />

    <div
      class="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300"
    >
      <TopNav />

      <main class="flex-1 overflow-y-auto">
        <div class="px-6 py-6 max-w-screen-2xl mx-auto">
          <RouterView />
        </div>
      </main>
    </div>

    <CommandPalette />
  </div>
</template>
