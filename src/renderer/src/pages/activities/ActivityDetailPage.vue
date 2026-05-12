<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import AppButton from '../../components/ui/AppButton.vue'
import AppModal from '../../components/ui/AppModal.vue'
import AppDrawer from '../../components/ui/AppDrawer.vue'
import AppSkeleton from '../../components/ui/AppSkeleton.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import TaskKanban from '../../components/task/TaskKanban.vue'
import TaskForm from '../../components/task/TaskForm.vue'
import ActivityForm from '../../components/activity/ActivityForm.vue'
import { useActivityStore } from '../../stores/activity'
import { useTaskStore } from '../../stores/task'
import { useUiStore } from '../../stores/ui'
import { formatDate } from '../../utils/date'
import type { Task, TaskStatus } from '../../types'

const route = useRoute()
const actStore = useActivityStore()
const taskStore = useTaskStore()
const ui = useUiStore()

const showEditAct = ref(false)
const showTaskModal = ref(false)
const selectedTask = ref<Task | null>(null)
const newTaskStatus = ref<TaskStatus>('todo')

const id = computed(() => route.params.id as string)

onMounted(async () => {
  await actStore.fetchById(id.value)
  if (actStore.current) {
    ui.setBreadcrumbs([
      { label: 'Workstreams', to: '/workstreams' },
      { label: actStore.current.workstream?.title ?? 'Workstream', to: `/workstreams/${actStore.current.workstream_id}` },
      { label: actStore.current.title },
    ])
    await taskStore.fetchByActivity(id.value)
  }
})

function openAddTask(status: TaskStatus = 'todo') {
  selectedTask.value = null
  newTaskStatus.value = status
  showTaskModal.value = true
}

function openEditTask(task: Task) {
  selectedTask.value = task
  showTaskModal.value = true
}

function onTaskSaved() {
  showTaskModal.value = false
  selectedTask.value = null
  taskStore.fetchByActivity(id.value)
}

async function onDeleteTask(task: Task) {
  if (!confirm(`Delete "${task.title}"?`)) return
  try {
    await taskStore.remove(task.id)
    toast.success('Task deleted')
  } catch (e: any) {
    toast.error(e.message)
  }
}
</script>

<template>
  <div class="space-y-6">
    <AppSkeleton v-if="actStore.loading" :lines="3" height="h-8" />

    <template v-else-if="actStore.current">
      <!-- Activity header -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ actStore.current.title }}</h1>
            <StatusBadge :status="actStore.current.status" type="activity" />
          </div>
          <div
            v-if="actStore.current.description"
            class="prose-content text-sm text-slate-500 dark:text-slate-400 mb-2 max-w-2xl"
            v-html="actStore.current.description"
          />
          <div class="flex items-center gap-4 text-xs text-slate-400">
            <span v-if="actStore.current.due_date">Due: {{ formatDate(actStore.current.due_date) }}</span>
            <span>Created: {{ formatDate(actStore.current.created_at) }}</span>
          </div>
        </div>
        <AppButton variant="secondary" size="sm" @click="showEditAct = true">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </AppButton>
      </div>

      <!-- Tasks header -->
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          Tasks
          <span class="text-xs font-normal text-slate-400">({{ taskStore.tasks.length }})</span>
        </h2>
        <AppButton size="sm" @click="openAddTask()">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </AppButton>
      </div>

      <!-- Kanban board -->
      <div v-if="taskStore.loading">
        <AppSkeleton height="h-64" rounded="rounded-xl" />
      </div>
      <TaskKanban
        v-else
        :activity-id="id"
        :columns="taskStore.kanbanColumns"
        @task-click="openEditTask"
        @add-task="openAddTask"
      />
    </template>
  </div>

  <!-- Edit activity drawer -->
  <AppDrawer :open="showEditAct" title="Edit Activity" @close="showEditAct = false">
    <div class="p-6">
      <ActivityForm
        v-if="actStore.current"
        :workstream-id="actStore.current.workstream_id"
        :activity="actStore.current"
        @close="showEditAct = false"
        @saved="showEditAct = false"
      />
    </div>
  </AppDrawer>

  <!-- Task modal -->
  <AppModal
    :open="showTaskModal"
    :title="selectedTask ? 'Edit Task' : 'New Task'"
    size="lg"
    @close="showTaskModal = false; selectedTask = null"
  >
    <TaskForm
      v-if="actStore.current"
      :activity-id="id"
      :task="selectedTask"
      @close="showTaskModal = false; selectedTask = null"
      @saved="onTaskSaved"
    />
  </AppModal>
</template>
