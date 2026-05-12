<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppCard from '../ui/AppCard.vue'
import StatusBadge from '../common/StatusBadge.vue'
import type { Workstream } from '../../types'
import { formatDate, isOverdue } from '../../utils/date'

interface Props { workstream: Workstream }
defineProps<Props>()

const emit = defineEmits<{ edit: []; delete: [] }>()
</script>

<template>
  <AppCard hover padding="none">
    <RouterLink :to="`/workstreams/${workstream.id}`" class="block p-5">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ workstream.title }}</h3>
          <p v-if="workstream.description" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{{ workstream.description }}</p>
        </div>
        <StatusBadge :status="workstream.status" type="workstream" />
      </div>

      <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span v-if="workstream.reinvention_partner" class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ workstream.reinvention_partner }}
        </span>
        <span v-if="workstream.end_date" :class="['flex items-center gap-1', isOverdue(workstream.end_date) && workstream.status === 'active' ? 'text-red-500' : '']">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDate(workstream.end_date) }}
        </span>
      </div>
    </RouterLink>

    <div class="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
      <span class="text-xs text-slate-400">Created {{ formatDate(workstream.created_at) }}</span>
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
          @click.prevent="emit('edit')"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          class="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          @click.prevent="emit('delete')"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </AppCard>
</template>
