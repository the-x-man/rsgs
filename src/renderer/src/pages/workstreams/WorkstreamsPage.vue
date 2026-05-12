<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import AppSelect from '../../components/ui/AppSelect.vue'
import AppModal from '../../components/ui/AppModal.vue'
import AppSkeleton from '../../components/ui/AppSkeleton.vue'
import WorkstreamCard from '../../components/workstream/WorkstreamCard.vue'
import WorkstreamForm from '../../components/workstream/WorkstreamForm.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { useWorkstreamStore } from '../../stores/workstream'
import { useUiStore } from '../../stores/ui'
import type { Workstream } from '../../types'

const store = useWorkstreamStore()
const ui = useUiStore()
ui.setBreadcrumbs([])

const showForm = ref(false)
const editTarget = ref<Workstream | null>(null)
const search = ref('')
const statusFilter = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout>>()

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

onMounted(() => store.fetchAll())

function onSearch() {
  clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(() => {
    store.fetchAll({ search: search.value, status: statusFilter.value || undefined, page: 1 })
  }, 300)
}

function onStatusChange() {
  store.fetchAll({ search: search.value, status: statusFilter.value || undefined, page: 1 })
}

function openCreate() {
  editTarget.value = null
  showForm.value = true
}

function openEdit(ws: Workstream) {
  editTarget.value = ws
  showForm.value = true
}

async function onDelete(ws: Workstream) {
  if (!confirm(`Delete "${ws.title}"? This will also delete all activities and tasks.`)) return
  try {
    await store.remove(ws.id)
    toast.success('Workstream deleted')
  } catch (e: any) {
    toast.error(e.message)
  }
}

function onSaved() {
  showForm.value = false
  store.fetchAll({ search: search.value, status: statusFilter.value || undefined })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Workstreams</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {{ store.meta.total }} workstream{{ store.meta.total !== 1 ? 's' : '' }}
        </p>
      </div>
      <AppButton @click="openCreate">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Workstream
      </AppButton>
    </div>

    <!-- Filters -->
    <div class="flex gap-3">
      <div class="flex-1 max-w-sm">
        <AppInput v-model="search" placeholder="Search workstreams..." @input="onSearch">
          <template #prefix>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </template>
        </AppInput>
      </div>
      <div class="w-44">
        <AppSelect v-model="statusFilter" :options="statusOptions" placeholder="All statuses" @change="onStatusChange" />
      </div>
    </div>

    <!-- Grid -->
    <div v-if="store.loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <AppSkeleton :lines="3" height="h-4" />
      </div>
    </div>

    <EmptyState
      v-else-if="store.workstreams.length === 0"
      title="No workstreams yet"
      description="Create your first workstream to start organizing your work"
    >
      <template #action>
        <AppButton @click="openCreate">Create Workstream</AppButton>
      </template>
    </EmptyState>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <WorkstreamCard
        v-for="ws in store.workstreams"
        :key="ws.id"
        :workstream="ws"
        @edit="openEdit(ws)"
        @delete="onDelete(ws)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="store.meta.total_pages > 1" class="flex items-center justify-center gap-2">
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="store.meta.page === 1"
        @click="store.fetchAll({ page: store.meta.page - 1 })"
      >
        Previous
      </AppButton>
      <span class="text-sm text-slate-500">{{ store.meta.page }} / {{ store.meta.total_pages }}</span>
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="store.meta.page === store.meta.total_pages"
        @click="store.fetchAll({ page: store.meta.page + 1 })"
      >
        Next
      </AppButton>
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <AppModal :open="showForm" :title="editTarget ? 'Edit Workstream' : 'New Workstream'" size="md" @close="showForm = false">
    <WorkstreamForm :workstream="editTarget" @close="showForm = false" @saved="onSaved" />
  </AppModal>
</template>
