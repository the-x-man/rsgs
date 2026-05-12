import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService } from '../services/task.service'
import type { Task, TaskStatus, KanbanColumn, FilterOptions } from '../types'

const COLUMN_ORDER: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'completed']
const COLUMN_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
}
const COLUMN_COLORS: Record<TaskStatus, string> = {
  todo: '#64748b',
  in_progress: '#3b82f6',
  blocked: '#ef4444',
  completed: '#22c55e',
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const current = ref<Task | null>(null)
  const loading = ref(false)
  const allUsers = ref<{ id: string; name: string; avatar_url: string | null }[]>([])

  const kanbanColumns = computed<KanbanColumn[]>(() =>
    COLUMN_ORDER.map((status) => ({
      id: status,
      label: COLUMN_LABELS[status],
      color: COLUMN_COLORS[status],
      tasks: tasks.value.filter((t) => t.status === status).sort((a, b) => a.position - b.position),
    }))
  )

  async function fetchByActivity(activityId: string, opts: FilterOptions = {}) {
    loading.value = true
    try {
      tasks.value = await taskService.getByActivity(activityId, opts)
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    try {
      current.value = await taskService.getById(id)
    } finally {
      loading.value = false
    }
  }

  async function create(payload: Partial<Task>, ownerIds: string[] = []) {
    const task = await taskService.create(payload, ownerIds)
    tasks.value.push(task)
    return task
  }

  async function update(id: string, payload: Partial<Task>) {
    const task = await taskService.update(id, payload)
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], ...task }
    if (current.value?.id === id) current.value = { ...current.value, ...task }
    return task
  }

  async function updateOwners(taskId: string, ownerIds: string[]) {
    await taskService.updateOwners(taskId, ownerIds)
    await fetchById(taskId)
  }

  async function moveTask(taskId: string, toStatus: TaskStatus, toIndex: number) {
    await taskService.updatePosition(taskId, toStatus, toIndex)
    const idx = tasks.value.findIndex((t) => t.id === taskId)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], status: toStatus, position: toIndex }
    }
  }

  async function remove(id: string) {
    await taskService.delete(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
    if (current.value?.id === id) current.value = null
  }

  return {
    tasks,
    current,
    loading,
    allUsers,
    kanbanColumns,
    fetchByActivity,
    fetchById,
    create,
    update,
    updateOwners,
    moveTask,
    remove,
  }
})
