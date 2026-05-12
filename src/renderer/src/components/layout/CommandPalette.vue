<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
const router = useRouter()
const query = ref('')
const selectedIdx = ref(0)

const commands = [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid', group: 'Navigation' },
  { label: 'Workstreams', to: '/workstreams', icon: 'layers', group: 'Navigation' },
  { label: 'Reports', to: '/reports', icon: 'file-text', group: 'Navigation' },
  { label: 'Toggle Dark Mode', action: 'theme', icon: 'moon', group: 'Settings' },
]

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return commands
  return commands.filter((c) => c.label.toLowerCase().includes(q))
})

function select(cmd: typeof commands[0]) {
  if (cmd.to) router.push(cmd.to)
  else if (cmd.action === 'theme') ui.setTheme(ui.theme === 'dark' ? 'light' : 'dark')
  ui.closeCommandPalette()
  query.value = ''
}

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    ui.openCommandPalette()
    return
  }
  if (!ui.commandPaletteOpen) return
  if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx.value = Math.min(selectedIdx.value + 1, filtered.value.length - 1) }
  if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx.value = Math.max(selectedIdx.value - 1, 0) }
  if (e.key === 'Enter' && filtered.value[selectedIdx.value]) select(filtered.value[selectedIdx.value])
}

watch(() => ui.commandPaletteOpen, (v) => { if (v) { query.value = ''; selectedIdx.value = 0 } })
watch(query, () => { selectedIdx.value = 0 })

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="ui.commandPaletteOpen" class="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="ui.closeCommandPalette()" />
        <div class="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
            <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="query"
              placeholder="Search or jump to..."
              class="flex-1 py-4 px-3 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              autofocus
            />
            <kbd class="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">ESC</kbd>
          </div>

          <div v-if="filtered.length > 0" class="py-2 max-h-80 overflow-y-auto">
            <div v-for="(cmd, i) in filtered" :key="cmd.label">
              <p v-if="i === 0 || cmd.group !== filtered[i - 1]?.group" class="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ cmd.group }}</p>
              <button
                :class="[
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  i === selectedIdx ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                ]"
                @mouseenter="selectedIdx = i"
                @click="select(cmd)"
              >
                <span class="text-slate-400">→</span>
                {{ cmd.label }}
              </button>
            </div>
          </div>
          <div v-else class="py-8 text-center text-sm text-slate-400">No results found</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
