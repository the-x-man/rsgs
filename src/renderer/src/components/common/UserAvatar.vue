<script setup lang="ts">
import { getInitials } from '../../utils/format'

interface Props {
  name?: string | null
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), { size: 'md' })

const sizeClasses = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
}

const colors = [
  'bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-rose-500',
]

function colorForName(name: string | null | undefined): string {
  if (!name) return colors[0]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}
</script>

<template>
  <div
    :class="[
      'flex-shrink-0 rounded-full flex items-center justify-center font-semibold text-white overflow-hidden',
      sizeClasses[size],
      !avatarUrl && colorForName(name),
    ]"
    :title="name ?? undefined"
  >
    <img v-if="avatarUrl" :src="avatarUrl" :alt="name ?? 'User'" class="w-full h-full object-cover" />
    <span v-else>{{ getInitials(name ?? null) }}</span>
  </div>
</template>
