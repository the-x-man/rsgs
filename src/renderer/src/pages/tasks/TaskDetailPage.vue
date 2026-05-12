<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import AppButton from '../../components/ui/AppButton.vue'
import AppModal from '../../components/ui/AppModal.vue'
import AppCard from '../../components/ui/AppCard.vue'
import AppSkeleton from '../../components/ui/AppSkeleton.vue'
import AppSelect from '../../components/ui/AppSelect.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import PriorityBadge from '../../components/common/PriorityBadge.vue'
import UserAvatar from '../../components/common/UserAvatar.vue'
import NotesList from '../../components/notes/NotesList.vue'
import TaskForm from '../../components/task/TaskForm.vue'
import { useTaskStore } from '../../stores/task'
import { useUiStore } from '../../stores/ui'
import { formatDate } from '../../utils/date'
import type { TaskStatus } from '../../types'

const route = useRoute()
const store = useTaskStore()
const ui = useUiStore()
const showEdit = ref(false)
const updatingStatus = ref(false)

const id = computed(() => route.params.id as string)

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
]

onMounted(async () => {
  await store.fetchById(id.value)
  if (store.current) {
    ui.setBreadcrumbs([
      { label: 'Workstreams', to: '/workstreams' },
      { label: store.current.activity?.workstream?.title ?? 'Workstream', to: `/workstreams/${store.current.activity?.workstream_id}` },
      { label: store.current.activity?.title ?? 'Activity', to: `/activities/${store.current.activity_id}` },
      { label: store.current.title },
    ])
  }
})

async function quickUpdateStatus(status: TaskStatus) {
  if (!store.current) return
  updatingStatus.value = true
  try {
    await store.update(id.value, { status })
    toast.success('Status updated')
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    updatingStatus.value = false
  }
}

function onSaved() {
  showEdit.value = false
  store.fetchById(id.value)
}
</script>

<template>
  <div>
    <AppSkeleton v-if="store.loading" :lines="4" height="h-8" class="max-w-3xl" />

    <template v-else-if="store.current">
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="xl:col-span-2 space-y-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h1 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ store.current.title }}</h1>
              <div class="flex items-center gap-2 flex-wrap">
                <StatusBadge :status="store.current.status" />
                <PriorityBadge :priority="store.current.priority" />
              </div>
            </div>
            <AppButton variant="secondary" size="sm" @click="showEdit = true">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </AppButton>
          </div>

          <!-- Description -->
          <AppCard v-if="store.current.description" padding="md">
            <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Description</h3>
            <div class="prose-content text-sm text-slate-700 dark:text-slate-300" v-html="store.current.description" />
          </AppCard>

          <!-- Notes -->
          <AppCard padding="md">
            <NotesList :task-id="id" />
          </AppCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Status -->
          <AppCard padding="md">
            <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Status</h3>
            <AppSelect
              :model-value="store.current.status"
              :options="statusOptions"
              :disabled="updatingStatus"
              @update:model-value="quickUpdateStatus($event as TaskStatus)"
            />
          </AppCard>

          <!-- Details -->
          <AppCard padding="md">
            <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Details</h3>
            <dl class="space-y-3 text-sm">
              <div>
                <dt class="text-xs text-slate-400 mb-0.5">Due Date</dt>
                <dd class="text-slate-900 dark:text-white font-medium">{{ store.current.due_date ? formatDate(store.current.due_date) : '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-400 mb-0.5">Priority</dt>
                <dd><PriorityBadge :priority="store.current.priority" /></dd>
              </div>
              <div>
                <dt class="text-xs text-slate-400 mb-0.5">Created</dt>
                <dd class="text-slate-900 dark:text-white">{{ formatDate(store.current.created_at) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-slate-400 mb-0.5">Last updated</dt>
                <dd class="text-slate-900 dark:text-white">{{ formatDate(store.current.updated_at) }}</dd>
              </div>
            </dl>
          </AppCard>

          <!-- Owners -->
          <AppCard padding="md">
            <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Owners</h3>
            <div v-if="store.current.owners?.length" class="space-y-2">
              <div
                v-for="owner in store.current.owners"
                :key="owner.id"
                class="flex items-center gap-2"
              >
                <UserAvatar :name="owner.name" :avatar-url="owner.avatar_url" size="sm" />
                <div>
                  <p class="text-xs font-medium text-slate-900 dark:text-white">{{ owner.name ?? owner.email }}</p>
                  <p class="text-xs text-slate-400">{{ owner.email }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-slate-400">No owners assigned</p>
          </AppCard>

          <!-- Activity context -->
          <AppCard padding="md">
            <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Context</h3>
            <dl class="space-y-2 text-xs">
              <div>
                <dt class="text-slate-400">Workstream</dt>
                <dd>
                  <RouterLink
                    :to="`/workstreams/${store.current.activity?.workstream_id}`"
                    class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    {{ store.current.activity?.workstream?.title ?? '—' }}
                  </RouterLink>
                </dd>
              </div>
              <div>
                <dt class="text-slate-400">Activity</dt>
                <dd>
                  <RouterLink
                    :to="`/activities/${store.current.activity_id}`"
                    class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    {{ store.current.activity?.title ?? '—' }}
                  </RouterLink>
                </dd>
              </div>
            </dl>
          </AppCard>
        </div>
      </div>
    </template>
  </div>

  <!-- Edit modal -->
  <AppModal :open="showEdit" title="Edit Task" size="lg" @close="showEdit = false">
    <TaskForm
      v-if="store.current"
      :activity-id="store.current.activity_id"
      :task="store.current"
      @close="showEdit = false"
      @saved="onSaved"
    />
  </AppModal>
</template>
