<script setup lang="ts">
import StatusBadge from '../common/StatusBadge.vue'
import PriorityBadge from '../common/PriorityBadge.vue'
import UserAvatar from '../common/UserAvatar.vue'
import type { Task } from '../../types'
import { formatDateShort, isOverdue, isDueSoon } from '../../utils/date'

interface Props { task: Task }
defineProps<Props>()
const emit = defineEmits<{ click: []; edit: []; delete: [] }>()
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all duration-150 cursor-pointer group"
    @click="emit('click')"
  >
    <!-- Title -->
    <p class="text-sm font-medium text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2">{{ task.title }}</p>

    <!-- Meta row -->
    <div class="flex items-center gap-2 flex-wrap mb-3">
      <PriorityBadge :priority="task.priority" />
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1">
        <span
          v-if="task.due_date"
          :class="[
            'text-xs flex items-center gap-1',
            isOverdue(task.due_date) ? 'text-red-500' : isDueSoon(task.due_date) ? 'text-amber-500' : 'text-slate-400'
          ]"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDateShort(task.due_date) }}
        </span>

        <span v-if="task._count?.notes" class="text-xs text-slate-400 flex items-center gap-1 ml-1">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {{ task._count.notes }}
        </span>
      </div>

      <div class="flex items-center">
        <div class="flex -space-x-1.5">
          <UserAvatar
            v-for="owner in task.owners?.slice(0, 3)"
            :key="owner.id"
            :name="owner.name"
            :avatar-url="owner.avatar_url"
            size="xs"
            class="ring-2 ring-white dark:ring-slate-900"
          />
          <div v-if="(task.owners?.length ?? 0) > 3" class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[9px] font-semibold text-slate-600 dark:text-slate-400">
            +{{ task.owners!.length - 3 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
