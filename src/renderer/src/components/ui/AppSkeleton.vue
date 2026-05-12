<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  rounded?: string
  lines?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 'h-4',
  rounded: 'rounded',
  lines: 1,
})
</script>

<template>
  <div class="animate-pulse space-y-2">
    <div
      v-for="i in lines"
      :key="i"
      :class="[
        'bg-slate-200 dark:bg-slate-700',
        height,
        rounded,
        width ?? 'w-full',
        lines > 1 && i === lines ? 'w-3/4' : '',
      ]"
    />
  </div>
</template>
