<script setup lang="ts">
interface Props {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'xs' | 'sm' | 'md'
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
  dot: false,
})

const variantClasses = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  purple: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
}

const dotColors = {
  default: 'bg-slate-400',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  purple: 'bg-indigo-500',
}

const sizeClasses = {
  xs: 'text-xs px-1.5 py-0.5 rounded gap-1',
  sm: 'text-xs px-2 py-0.5 rounded-md gap-1.5',
  md: 'text-sm px-2.5 py-1 rounded-md gap-1.5',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-medium',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant]]" />
    <slot />
  </span>
</template>
