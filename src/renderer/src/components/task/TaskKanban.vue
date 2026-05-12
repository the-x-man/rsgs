<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { toast } from 'vue-sonner'
import TaskCard from './TaskCard.vue'
import AppButton from '../ui/AppButton.vue'
import EmptyState from '../common/EmptyState.vue'
import { useTaskStore } from '../../stores/task'
import type { Task, TaskStatus, KanbanColumn } from '../../types'

interface Props {
  activityId: string
  columns: KanbanColumn[]
}

defineProps<Props>()
const emit = defineEmits<{
  taskClick: [task: Task]
  addTask: [status: TaskStatus]
}>()

const store = useTaskStore()
const dragging = ref(false)

async function onEnd(evt: any, toStatus: TaskStatus) {
  if (!evt.item) return
  const taskId = evt.item.dataset.taskId
  if (!taskId) return
  const newIndex = evt.newIndex ?? 0
  try {
    await store.moveTask(taskId, toStatus, newIndex)
  } catch {
    toast.error('Failed to move task')
  }
}

const columnHeaderColors: Record<TaskStatus, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  blocked: 'bg-red-500',
  completed: 'bg-green-500',
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4 items-start">
    <div
      v-for="col in columns"
      :key="col.id"
      class="flex-shrink-0 w-72 flex flex-col"
    >
      <!-- Column Header -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span :class="['w-2 h-2 rounded-full flex-shrink-0', columnHeaderColors[col.id]]" />
          <h3 class="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{{ col.label }}</h3>
          <span class="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{{ col.tasks.length }}</span>
        </div>
        <button
          class="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
          @click="emit('addTask', col.id)"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <!-- Droppable Area -->
      <draggable
        :list="col.tasks"
        group="tasks"
        item-key="id"
        :data-status="col.id"
        class="flex flex-col gap-2 min-h-16 rounded-xl p-2 bg-slate-100/60 dark:bg-slate-800/40 transition-colors"
        :class="{ 'bg-indigo-50 dark:bg-indigo-950/20': dragging }"
        ghost-class="sortable-ghost"
        @start="dragging = true"
        @end="(evt) => { dragging = false; onEnd(evt, col.id) }"
      >
        <template #item="{ element: task }">
          <div :data-task-id="task.id">
            <TaskCard
              :task="task"
              @click="emit('taskClick', task)"
            />
          </div>
        </template>

        <template #footer>
          <div v-if="col.tasks.length === 0" class="flex items-center justify-center h-16">
            <p class="text-xs text-slate-400">Drop tasks here</p>
          </div>
        </template>
      </draggable>

      <button
        class="mt-2 flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors w-full"
        @click="emit('addTask', col.id)"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add task
      </button>
    </div>
  </div>
</template>
