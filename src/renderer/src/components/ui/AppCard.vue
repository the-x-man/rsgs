<script setup lang="ts">
interface Props {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hover: false,
  padding: 'md',
  border: true,
})

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}
</script>

<template>
  <div
    :class="[
      'bg-white dark:bg-slate-900 rounded-xl',
      border && 'border border-slate-200 dark:border-slate-800',
      hover && 'hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md cursor-pointer transition-all duration-150',
      paddingClasses[padding],
    ]"
  >
    <slot />
  </div>
</template>
