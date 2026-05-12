<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import AppButton from '../../components/ui/AppButton.vue'
import AppModal from '../../components/ui/AppModal.vue'
import AppDrawer from '../../components/ui/AppDrawer.vue'
import AppCard from '../../components/ui/AppCard.vue'
import AppSkeleton from '../../components/ui/AppSkeleton.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import WorkstreamForm from '../../components/workstream/WorkstreamForm.vue'
import ActivityForm from '../../components/activity/ActivityForm.vue'
import { useWorkstreamStore } from '../../stores/workstream'
import { useActivityStore } from '../../stores/activity'
import { useUiStore } from '../../stores/ui'
import { formatDate, isOverdue } from '../../utils/date'
import type { Activity } from '../../types'

const route = useRoute()
const wsStore = useWorkstreamStore()
const actStore = useActivityStore()
const ui = useUiStore()

const showEditWs = ref(false)
const showAddActivity = ref(false)
const editActivity = ref<Activity | null>(null)

const id = computed(() => route.params.id as string)

onMounted(async () => {
  await wsStore.fetchById(id.value)
  if (wsStore.current) {
    ui.setBreadcrumbs([
      { label: 'Workstreams', to: '/workstreams' },
      { label: wsStore.current.title },
    ])
    await actStore.fetchByWorkstream(id.value)
  }
})

async function deleteActivity(act: Activity) {
  if (!confirm(`Delete "${act.title}"? All tasks will be removed.`)) return
  try {
    await actStore.remove(act.id)
    toast.success('Activity deleted')
  } catch (e: any) {
    toast.error(e.message)
  }
}

function onActivitySaved() {
  showAddActivity.value = false
  editActivity.value = null
  actStore.fetchByWorkstream(id.value)
}
</script>

<template>
  <div class="space-y-6">
    <AppSkeleton v-if="wsStore.loading" :lines="3" height="h-8" />

    <template v-else-if="wsStore.current">
      <!-- Workstream header -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ wsStore.current.title }}</h1>
            <StatusBadge :status="wsStore.current.status" type="workstream" />
          </div>
          <p v-if="wsStore.current.description" class="text-sm text-slate-500 dark:text-slate-400">{{ wsStore.current.description }}</p>
          <div class="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span v-if="wsStore.current.reinvention_partner">Partner: {{ wsStore.current.reinvention_partner }}</span>
            <span v-if="wsStore.current.start_date">Start: {{ formatDate(wsStore.current.start_date) }}</span>
            <span v-if="wsStore.current.end_date" :class="isOverdue(wsStore.current.end_date) && wsStore.current.status === 'active' ? 'text-red-500' : ''">
              End: {{ formatDate(wsStore.current.end_date) }}
            </span>
          </div>
        </div>
        <AppButton variant="secondary" size="sm" @click="showEditWs = true">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </AppButton>
      </div>

      <!-- Activities header -->
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          Activities
          <span class="text-xs font-normal text-slate-400">({{ actStore.activities.length }})</span>
        </h2>
        <AppButton size="sm" @click="showAddActivity = true">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Activity
        </AppButton>
      </div>

      <!-- Activities list -->
      <div v-if="actStore.loading" class="space-y-3">
        <AppSkeleton v-for="i in 4" :key="i" height="h-20" rounded="rounded-xl" />
      </div>

      <EmptyState
        v-else-if="actStore.activities.length === 0"
        title="No activities"
        description="Add activities to this workstream to organize your tasks"
      >
        <template #action>
          <AppButton size="sm" @click="showAddActivity = true">Add Activity</AppButton>
        </template>
      </EmptyState>

      <div v-else class="space-y-3">
        <RouterLink
          v-for="act in actStore.activities"
          :key="act.id"
          :to="`/activities/${act.id}`"
          class="block"
        >
          <AppCard hover padding="md">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ act.title }}</h3>
                  <StatusBadge :status="act.status" type="activity" />
                </div>
                <div class="flex items-center gap-3 text-xs text-slate-400">
                  <span v-if="act.due_date" :class="isOverdue(act.due_date) ? 'text-red-500' : ''">
                    Due: {{ formatDate(act.due_date) }}
                  </span>
                  <span>Created: {{ formatDate(act.created_at) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0" @click.prevent>
                <button
                  class="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                  @click="editActivity = act; showAddActivity = true"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  @click="deleteActivity(act)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </AppCard>
        </RouterLink>
      </div>
    </template>
  </div>

  <!-- Edit workstream modal -->
  <AppModal :open="showEditWs" title="Edit Workstream" size="md" @close="showEditWs = false">
    <WorkstreamForm :workstream="wsStore.current" @close="showEditWs = false" @saved="showEditWs = false" />
  </AppModal>

  <!-- Activity drawer -->
  <AppDrawer :open="showAddActivity" :title="editActivity ? 'Edit Activity' : 'New Activity'" size="md" @close="showAddActivity = false; editActivity = null">
    <div class="p-6">
      <ActivityForm
        :workstream-id="id"
        :activity="editActivity"
        @close="showAddActivity = false; editActivity = null"
        @saved="onActivitySaved"
      />
    </div>
  </AppDrawer>
</template>
