<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import AppInput from '../ui/AppInput.vue'
import AppSelect from '../ui/AppSelect.vue'
import AppButton from '../ui/AppButton.vue'
import UserAvatar from '../common/UserAvatar.vue'
import TipTapEditor from '../../editor/TipTapEditor.vue'
import { useTaskStore } from '../../stores/task'
import { authService } from '../../services/auth.service'
import { isDateInPast, todayIso } from '../../utils/date'
import type { Task, User } from '../../types'

interface Props {
  activityId: string
  task?: Task | null
}

const props = withDefaults(defineProps<Props>(), { task: null })
const emit = defineEmits<{ close: []; saved: [task: Task] }>()

const store = useTaskStore()

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const form = reactive({
  title: '',
  description: '',
  due_date: '',
  status: 'todo' as Task['status'],
  priority: 'medium' as Task['priority'],
})

const selectedOwners = ref<string[]>([])
const allUsers = ref<User[]>([])
const dateError = ref('')
const saving = ref(false)

onMounted(async () => {
  allUsers.value = await authService.getAllUsers()
})

watch(() => props.task, (task) => {
  if (task) {
    form.title = task.title
    form.description = task.description ?? ''
    form.due_date = task.due_date ?? ''
    form.status = task.status
    form.priority = task.priority
    selectedOwners.value = task.owners?.map((o) => o.id) ?? []
  }
}, { immediate: true })

function toggleOwner(id: string) {
  const idx = selectedOwners.value.indexOf(id)
  if (idx !== -1) selectedOwners.value.splice(idx, 1)
  else selectedOwners.value.push(id)
}

function validateDate() {
  if (form.due_date && !props.task && isDateInPast(form.due_date)) {
    dateError.value = 'Due date must be in the future'
    return false
  }
  dateError.value = ''
  return true
}

async function submit() {
  if (!form.title.trim() || !validateDate()) return
  saving.value = true
  try {
    const payload = {
      activity_id: props.activityId,
      title: form.title.trim(),
      description: form.description || null,
      due_date: form.due_date || null,
      status: form.status,
      priority: form.priority,
    }
    let task: Task
    if (props.task) {
      task = await store.update(props.task.id, payload)
      await store.updateOwners(props.task.id, selectedOwners.value)
      toast.success('Task updated')
    } else {
      task = await store.create(payload, selectedOwners.value)
      toast.success('Task created')
    }
    emit('saved', task)
  } catch (e: any) {
    toast.error(e.message ?? 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <AppInput v-model="form.title" label="Title" placeholder="Task title" required />

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
      <TipTapEditor v-model="form.description" placeholder="Describe this task..." />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <AppInput
        v-model="form.due_date"
        label="Due Date"
        type="date"
        :min="!task ? todayIso() : undefined"
        :error="dateError"
        @change="validateDate"
      />
      <AppSelect v-model="form.priority" label="Priority" :options="priorityOptions" />
    </div>

    <AppSelect v-model="form.status" label="Status" :options="statusOptions" />

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Owners</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="user in allUsers"
          :key="user.id"
          type="button"
          :class="[
            'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
            selectedOwners.includes(user.id)
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600',
          ]"
          @click="toggleOwner(user.id)"
        >
          <UserAvatar :name="user.name" :avatar-url="user.avatar_url" size="xs" />
          {{ user.name ?? user.email }}
        </button>
        <p v-if="allUsers.length === 0" class="text-xs text-slate-400">No users available</p>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <AppButton variant="secondary" type="button" @click="emit('close')">Cancel</AppButton>
      <AppButton variant="primary" type="submit" :loading="saving">
        {{ task ? 'Update' : 'Create' }} Task
      </AppButton>
    </div>
  </form>
</template>
