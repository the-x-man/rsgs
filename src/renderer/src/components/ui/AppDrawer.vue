<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface Props {
  open: boolean
  title?: string
  side?: 'right' | 'left'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  side: 'right',
  size: 'md',
})

const emit = defineEmits<{ close: [] }>()

const sizeClasses = {
  sm: 'w-80',
  md: 'w-[480px]',
  lg: 'w-[640px]',
  xl: 'w-[800px]',
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex">
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="emit('close')" />
        <Transition
          :enter-active-class="`duration-300 ease-out`"
          :enter-from-class="`${side === 'right' ? 'translate-x-full' : '-translate-x-full'}`"
          enter-to-class="translate-x-0"
          :leave-active-class="`duration-200 ease-in`"
          leave-from-class="translate-x-0"
          :leave-to-class="`${side === 'right' ? 'translate-x-full' : '-translate-x-full'}`"
        >
          <div
            v-if="open"
            :class="[
              'relative ml-auto flex flex-col bg-white dark:bg-slate-900 shadow-2xl h-full overflow-hidden border-l border-slate-200 dark:border-slate-800',
              sizeClasses[size],
            ]"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <slot name="header">
                <h2 class="text-base font-semibold text-slate-900 dark:text-white">{{ title }}</h2>
              </slot>
              <button
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                @click="emit('close')"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto">
              <slot />
            </div>
            <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
