export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export type WorkstreamStatus = 'active' | 'completed' | 'archived' | 'on_hold'

export interface Workstream {
  id: string
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  reinvention_partner: string | null
  status: WorkstreamStatus
  created_by: string | null
  created_at: string
  updated_at: string
  activities?: Activity[]
  _count?: { activities: number; tasks: number }
}

export type ActivityStatus = 'active' | 'completed' | 'cancelled'

export interface Activity {
  id: string
  workstream_id: string
  title: string
  description: string | null
  due_date: string | null
  status: ActivityStatus
  created_by: string | null
  created_at: string
  updated_at: string
  workstream?: Workstream
  tasks?: Task[]
  _count?: { tasks: number }
}

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  activity_id: string
  title: string
  description: string | null
  due_date: string | null
  status: TaskStatus
  priority: TaskPriority
  position: number
  created_by: string | null
  created_at: string
  updated_at: string
  activity?: Activity
  owners?: User[]
  notes?: TaskNote[]
  _count?: { notes: number; owners: number }
}

export interface TaskOwner {
  task_id: string
  user_id: string
  assigned_at: string
  user?: User
}

export interface TaskNote {
  id: string
  task_id: string
  content: string
  author_id: string | null
  edited_at: string | null
  created_at: string
  updated_at: string
  author?: User
}

export interface StatusReport {
  id: string
  title: string
  workstream_ids: string[]
  content: ReportContent | null
  generated_by: string | null
  created_at: string
}

export interface ReportContent {
  executive_summary: string
  workstream_progress: WorkstreamProgress[]
  risks: RiskItem[]
  upcoming_milestones: Milestone[]
  completed_items: string[]
  metrics: ReportMetrics
}

export interface WorkstreamProgress {
  workstream_id: string
  title: string
  status: WorkstreamStatus
  completion_percent: number
  activities: ActivitySummary[]
}

export interface ActivitySummary {
  id: string
  title: string
  status: ActivityStatus
  task_count: number
  completed_tasks: number
}

export interface RiskItem {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  owner?: string
}

export interface Milestone {
  title: string
  due_date: string
  activity_id?: string
  task_id?: string
}

export interface ReportMetrics {
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  blocked_tasks: number
  overdue_tasks: number
  completion_rate: number
}

export interface KanbanColumn {
  id: TaskStatus
  label: string
  tasks: Task[]
  color: string
}

export interface DashboardStats {
  total_workstreams: number
  total_activities: number
  total_tasks: number
  overdue_tasks: number
  upcoming_tasks: number
  completed_tasks: number
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  color?: string
  extendedProps?: {
    type: 'task' | 'activity' | 'workstream'
    status: string
    priority?: TaskPriority
  }
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timeout?: number
}

export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface FilterOptions {
  search?: string
  status?: string
  priority?: string
  owner?: string
  start_date?: string
  end_date?: string
  page?: number
  per_page?: number
}

export interface BreadcrumbItem {
  label: string
  to?: string
}

export type Theme = 'light' | 'dark' | 'system'
