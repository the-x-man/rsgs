<script setup lang="ts">
import type { TaskPriority } from '../../types'
import { PRIORITY_LABELS, PRIORITY_DOT_COLORS } from '../../utils/format'

interface Props { priority: TaskPriority }
defineProps<Props>()

const variantMap: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}
</script>

<template>
  <span :class="['inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md', variantMap[priority]]">
    <span :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', PRIORITY_DOT_COLORS[priority]]" />
    {{ PRIORITY_LABELS[priority] }}
  </span>
</template>
