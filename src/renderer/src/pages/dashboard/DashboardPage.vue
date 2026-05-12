<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement,
} from 'chart.js'
import StatsCard from '../../components/dashboard/StatsCard.vue'
import AppCard from '../../components/ui/AppCard.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import PriorityBadge from '../../components/common/PriorityBadge.vue'
import AppSkeleton from '../../components/ui/AppSkeleton.vue'
import { useUiStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { taskService } from '../../services/task.service'
import { workstreamService } from '../../services/workstream.service'
import { activityService } from '../../services/activity.service'
import { formatDate, isOverdue, isDueSoon } from '../../utils/date'
import { CALENDAR_TASK_COLORS } from '../../utils/format'
import type { Task, Workstream, DashboardStats, CalendarEvent } from '../../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const ui = useUiStore()
const auth = useAuthStore()
ui.setBreadcrumbs([])

const loading = ref(true)
const tasks = ref<Task[]>([])
const workstreams = ref<Workstream[]>([])
const recentTasks = ref<Task[]>([])

const stats = computed<DashboardStats>(() => ({
  total_workstreams: workstreams.value.length,
  total_activities: 0,
  total_tasks: tasks.value.length,
  overdue_tasks: tasks.value.filter((t) => isOverdue(t.due_date) && t.status !== 'completed').length,
  upcoming_tasks: tasks.value.filter((t) => isDueSoon(t.due_date, 7) && t.status !== 'completed').length,
  completed_tasks: tasks.value.filter((t) => t.status === 'completed').length,
}))

const calendarEvents = computed<CalendarEvent[]>(() =>
  tasks.value
    .filter((t) => t.due_date)
    .map((t) => ({
      id: t.id,
      title: t.title,
      start: t.due_date!,
      color: CALENDAR_TASK_COLORS[t.status],
      extendedProps: { type: 'task', status: t.status, priority: t.priority },
    }))
)

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,listWeek',
  },
  events: calendarEvents.value,
  height: 'auto',
  editable: true,
  selectable: true,
  eventColor: '#6366f1',
  buttonText: { today: 'Today', month: 'Month', list: 'List' },
}))

// Chart data
const taskStatusData = computed(() => {
  const todo = tasks.value.filter((t) => t.status === 'todo').length
  const inProgress = tasks.value.filter((t) => t.status === 'in_progress').length
  const blocked = tasks.value.filter((t) => t.status === 'blocked').length
  const completed = tasks.value.filter((t) => t.status === 'completed').length
  return {
    labels: ['To Do', 'In Progress', 'Blocked', 'Completed'],
    datasets: [{
      data: [todo, inProgress, blocked, completed],
      backgroundColor: ['#94a3b8', '#3b82f6', '#ef4444', '#22c55e'],
      borderWidth: 0,
    }],
  }
})

const priorityData = computed(() => {
  const labels = ['Low', 'Medium', 'High', 'Critical']
  const counts = ['low', 'medium', 'high', 'critical'].map(
    (p) => tasks.value.filter((t) => t.priority === p).length
  )
  return {
    labels,
    datasets: [{
      label: 'Tasks',
      data: counts,
      backgroundColor: ['#94a3b8', '#eab308', '#f97316', '#ef4444'],
      borderRadius: 6,
      borderSkipped: false,
    }],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 16, font: { size: 11 } } },
  },
}

const barChartOptions = {
  ...chartOptions,
  plugins: { ...chartOptions.plugins, legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
}

onMounted(async () => {
  try {
    const [tasksRes, wsRes] = await Promise.all([
      taskService.getAll(),
      workstreamService.getAll({ per_page: 100 }),
    ])
    tasks.value = tasksRes
    workstreams.value = wsRes.data
    recentTasks.value = [...tasksRes].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome -->
    <div>
      <h1 class="text-xl font-bold text-slate-900 dark:text-white">
        Good {{ new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening' }}, {{ auth.user?.name?.split(' ')[0] ?? 'there' }} 👋
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here's what's happening with your projects</p>
    </div>

    <!-- Stats -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <AppCard v-for="i in 6" :key="i" padding="md">
        <AppSkeleton height="h-14" />
      </AppCard>
    </div>

    <div v-else class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatsCard label="Workstreams" :value="stats.total_workstreams" icon="layers" color="indigo" />
      <StatsCard label="Total Tasks" :value="stats.total_tasks" icon="list" color="blue" />
      <StatsCard label="Completed" :value="stats.completed_tasks" icon="check" color="green" />
      <StatsCard label="In Progress" :value="tasks.filter(t => t.status === 'in_progress').length" icon="trending" color="blue" />
      <StatsCard label="Overdue" :value="stats.overdue_tasks" icon="alert" color="red" />
      <StatsCard label="Due Soon" :value="stats.upcoming_tasks" icon="clock" color="amber" />
    </div>

    <!-- Main content grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Calendar -->
      <div class="xl:col-span-2">
        <AppCard padding="md">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Calendar</h2>
          <div v-if="loading" class="h-80">
            <AppSkeleton height="h-full" rounded="rounded-xl" />
          </div>
          <div v-else class="calendar-wrapper text-xs">
            <FullCalendar :options="calendarOptions" />
          </div>
        </AppCard>
      </div>

      <!-- Right column -->
      <div class="space-y-4">
        <!-- Task Status Doughnut -->
        <AppCard padding="md">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Task Status</h2>
          <div class="h-48">
            <Doughnut v-if="!loading" :data="taskStatusData" :options="chartOptions" />
            <AppSkeleton v-else height="h-full" rounded="rounded-full" width="w-48" />
          </div>
        </AppCard>

        <!-- Priority Bar Chart -->
        <AppCard padding="md">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">By Priority</h2>
          <div class="h-40">
            <Bar v-if="!loading" :data="priorityData" :options="barChartOptions" />
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Recent Tasks -->
    <AppCard padding="md">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
      <div v-if="loading" class="space-y-3">
        <AppSkeleton v-for="i in 5" :key="i" height="h-12" rounded="rounded-lg" />
      </div>
      <div v-else-if="recentTasks.length === 0" class="text-center py-8 text-sm text-slate-400">No tasks yet</div>
      <div v-else class="space-y-1">
        <RouterLink
          v-for="task in recentTasks"
          :key="task.id"
          :to="`/tasks/${task.id}`"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
        >
          <StatusBadge :status="task.status" />
          <span class="flex-1 text-sm text-slate-900 dark:text-white truncate">{{ task.title }}</span>
          <PriorityBadge :priority="task.priority" />
          <span v-if="task.due_date" :class="['text-xs flex-shrink-0', isOverdue(task.due_date) ? 'text-red-500' : 'text-slate-400']">
            {{ formatDate(task.due_date) }}
          </span>
        </RouterLink>
      </div>
    </AppCard>
  </div>
</template>

<style>
.calendar-wrapper .fc {
  font-size: 0.8rem;
}
.calendar-wrapper .fc-button {
  background: #6366f1 !important;
  border-color: #6366f1 !important;
  border-radius: 0.5rem !important;
  font-size: 0.75rem !important;
  padding: 0.25rem 0.75rem !important;
}
.calendar-wrapper .fc-button:hover {
  background: #4f46e5 !important;
}
.calendar-wrapper .fc-button-active {
  background: #4338ca !important;
}
.dark .calendar-wrapper .fc-day-today {
  background: rgba(99,102,241,0.1) !important;
}
.calendar-wrapper .fc-event {
  border-radius: 4px !important;
  border: none !important;
  font-size: 0.7rem !important;
  padding: 1px 4px !important;
}
</style>
