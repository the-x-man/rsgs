<script setup lang="ts">
interface Props {
  label: string
  value: number | string
  trend?: string
  trendUp?: boolean
  color?: 'indigo' | 'green' | 'red' | 'amber' | 'blue'
  icon: 'layers' | 'check' | 'alert' | 'clock' | 'list' | 'trending'
}

const props = withDefaults(defineProps<Props>(), { color: 'indigo' })

const colorMap = {
  indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
  green: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400',
  red: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
  amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ label }}</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ value }}</p>
        <p v-if="trend" :class="['text-xs mt-1', trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500']">
          {{ trendUp ? '↑' : '↓' }} {{ trend }}
        </p>
      </div>
      <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorMap[color]]">
        <svg v-if="icon === 'layers'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <svg v-else-if="icon === 'check'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="icon === 'alert'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <svg v-else-if="icon === 'clock'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="icon === 'list'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <svg v-else-if="icon === 'trending'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    </div>
  </div>
</template>
