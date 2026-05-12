<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import AppButton from '../../components/ui/AppButton.vue'
import AppCard from '../../components/ui/AppCard.vue'
import AppInput from '../../components/ui/AppInput.vue'
import AppSkeleton from '../../components/ui/AppSkeleton.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import PriorityBadge from '../../components/common/PriorityBadge.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { useUiStore } from '../../stores/ui'
import { workstreamService } from '../../services/workstream.service'
import { taskService } from '../../services/task.service'
import { generateStatusReport } from '../../ppt/generator'
import { isOverdue } from '../../utils/date'
import type { Workstream, Task, ReportContent } from '../../types'

const ui = useUiStore()
ui.setBreadcrumbs([])

const workstreams = ref<Workstream[]>([])
const tasks = ref<Task[]>([])
const selectedWorkstreams = ref<string[]>([])
const reportTitle = ref('Project Status Report')
const generating = ref(false)
const loading = ref(true)
const preview = ref<ReportContent | null>(null)

onMounted(async () => {
  try {
    const [wsRes, tRes] = await Promise.all([
      workstreamService.getAll({ per_page: 100 }),
      taskService.getAll(),
    ])
    workstreams.value = wsRes.data
    tasks.value = tRes
    selectedWorkstreams.value = wsRes.data.map((w) => w.id)
  } finally {
    loading.value = false
  }
})

function toggleWorkstream(id: string) {
  const idx = selectedWorkstreams.value.indexOf(id)
  if (idx !== -1) selectedWorkstreams.value.splice(idx, 1)
  else selectedWorkstreams.value.push(id)
}

function buildReportContent(): ReportContent {
  const selectedWs = workstreams.value.filter((w) => selectedWorkstreams.value.includes(w.id))
  const allTasks = tasks.value
  const completed = allTasks.filter((t) => t.status === 'completed')
  const inProgress = allTasks.filter((t) => t.status === 'in_progress')
  const blocked = allTasks.filter((t) => t.status === 'blocked')
  const overdueTasks = allTasks.filter((t) => isOverdue(t.due_date) && t.status !== 'completed')
  const completionRate = allTasks.length > 0 ? (completed.length / allTasks.length) * 100 : 0

  return {
    executive_summary: `This report covers ${selectedWs.length} workstream(s) with ${allTasks.length} total tasks. ${completed.length} tasks are completed (${Math.round(completionRate)}% completion rate). ${blocked.length} task(s) are currently blocked. ${overdueTasks.length} task(s) are overdue and require immediate attention.`,

    workstream_progress: selectedWs.map((ws) => {
      const wsTasks = allTasks.filter((t) => t.activity?.workstream_id === ws.id)
      const wsCompleted = wsTasks.filter((t) => t.status === 'completed').length
      return {
        workstream_id: ws.id,
        title: ws.title,
        status: ws.status,
        completion_percent: wsTasks.length > 0 ? Math.round((wsCompleted / wsTasks.length) * 100) : 0,
        activities: [],
      }
    }),

    risks: blocked.slice(0, 5).map((t) => ({
      title: t.title,
      description: `Task is blocked. Priority: ${t.priority}.`,
      severity: t.priority === 'critical' ? 'critical' : t.priority === 'high' ? 'high' : 'medium',
      owner: t.owners?.[0]?.name ?? undefined,
    })),

    upcoming_milestones: allTasks
      .filter((t) => t.due_date && t.status !== 'completed' && !isOverdue(t.due_date))
      .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
      .slice(0, 6)
      .map((t) => ({
        title: t.title,
        due_date: t.due_date!,
        task_id: t.id,
      })),

    completed_items: completed.slice(0, 8).map((t) => t.title),

    metrics: {
      total_tasks: allTasks.length,
      completed_tasks: completed.length,
      in_progress_tasks: inProgress.length,
      blocked_tasks: blocked.length,
      overdue_tasks: overdueTasks.length,
      completion_rate: completionRate,
    },
  }
}

function generatePreview() {
  preview.value = buildReportContent()
}

async function exportPPT() {
  if (!selectedWorkstreams.value.length) {
    toast.error('Select at least one workstream')
    return
  }
  generating.value = true
  try {
    const content = buildReportContent()
    const selectedWs = workstreams.value.filter((w) => selectedWorkstreams.value.includes(w.id))
    await generateStatusReport(reportTitle.value, selectedWs, tasks.value, content)
    toast.success('PowerPoint generated and downloaded!')
  } catch (e: any) {
    toast.error(`Failed: ${e.message}`)
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Status Reports</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Generate and export project status presentations</p>
      </div>
      <AppButton @click="exportPPT" :loading="generating">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export PPT
      </AppButton>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Config panel -->
      <div class="xl:col-span-1 space-y-4">
        <AppCard padding="md">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Report Settings</h2>
          <AppInput v-model="reportTitle" label="Report Title" placeholder="Project Status Report" />
        </AppCard>

        <AppCard padding="md">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Workstreams</h2>
          <div v-if="loading" class="space-y-2">
            <AppSkeleton v-for="i in 4" :key="i" height="h-9" rounded="rounded-lg" />
          </div>
          <div v-else class="space-y-2">
            <label
              v-for="ws in workstreams"
              :key="ws.id"
              :class="[
                'flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all',
                selectedWorkstreams.includes(ws.id)
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
              ]"
            >
              <input
                type="checkbox"
                :checked="selectedWorkstreams.includes(ws.id)"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                @change="toggleWorkstream(ws.id)"
              />
              <span class="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{{ ws.title }}</span>
              <StatusBadge :status="ws.status" type="workstream" />
            </label>
            <EmptyState v-if="!loading && workstreams.length === 0" title="No workstreams" description="Create workstreams first" />
          </div>
        </AppCard>

        <AppButton variant="outline" class="w-full" @click="generatePreview">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview Report
        </AppButton>
      </div>

      <!-- Preview -->
      <div class="xl:col-span-2">
        <AppCard v-if="!preview" padding="lg" class="h-full flex items-center justify-center min-h-64">
          <EmptyState
            title="No preview yet"
            description="Click 'Preview Report' to see a summary before exporting"
          />
        </AppCard>

        <div v-else class="space-y-4">
          <!-- Metrics -->
          <AppCard padding="md">
            <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Report Preview — {{ reportTitle }}</h2>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ preview.metrics.total_tasks }}</p>
                <p class="text-xs text-slate-500">Total Tasks</p>
              </div>
              <div class="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p class="text-2xl font-bold text-green-600">{{ preview.metrics.completed_tasks }}</p>
                <p class="text-xs text-slate-500">Completed</p>
              </div>
              <div class="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <p class="text-2xl font-bold text-red-600">{{ preview.metrics.blocked_tasks }}</p>
                <p class="text-xs text-slate-500">Blocked</p>
              </div>
            </div>
            <!-- Completion bar -->
            <div class="mb-2">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-slate-500">Completion Rate</span>
                <span class="text-xs font-bold text-green-600">{{ Math.round(preview.metrics.completion_rate) }}%</span>
              </div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-green-500 rounded-full transition-all duration-500"
                  :style="{ width: `${preview.metrics.completion_rate}%` }"
                />
              </div>
            </div>
          </AppCard>

          <!-- Executive Summary -->
          <AppCard padding="md">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-2">Executive Summary</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ preview.executive_summary }}</p>
          </AppCard>

          <!-- Workstream Progress -->
          <AppCard padding="md">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Workstream Progress</h3>
            <div class="space-y-3">
              <div v-for="wp in preview.workstream_progress" :key="wp.workstream_id">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-slate-700 dark:text-slate-300">{{ wp.title }}</span>
                  <span class="text-xs font-medium text-slate-500">{{ wp.completion_percent }}%</span>
                </div>
                <div class="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    :style="{ width: `${wp.completion_percent}%` }"
                  />
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Risks -->
          <AppCard v-if="preview.risks.length > 0" padding="md">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Risks & Blockers</h3>
            <div class="space-y-2">
              <div
                v-for="(risk, i) in preview.risks"
                :key="i"
                class="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg"
              >
                <svg class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ risk.title }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ risk.description }}</p>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Upcoming Milestones -->
          <AppCard v-if="preview.upcoming_milestones.length > 0" padding="md">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Upcoming Milestones</h3>
            <div class="space-y-2">
              <div
                v-for="(m, i) in preview.upcoming_milestones.slice(0, 5)"
                :key="i"
                class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
              >
                <span class="text-sm text-slate-700 dark:text-slate-300">{{ m.title }}</span>
                <span class="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{{ m.due_date }}</span>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </div>
</template>
