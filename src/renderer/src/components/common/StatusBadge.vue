<script setup lang="ts">
import AppBadge from '../ui/AppBadge.vue'
import type { TaskStatus, ActivityStatus, WorkstreamStatus } from '../../types'
import { STATUS_LABELS, STATUS_COLORS, WORKSTREAM_STATUS_LABELS, ACTIVITY_STATUS_LABELS } from '../../utils/format'

interface Props {
  status: TaskStatus | ActivityStatus | WorkstreamStatus
  type?: 'task' | 'activity' | 'workstream'
}

const props = withDefaults(defineProps<Props>(), { type: 'task' })

function getLabel() {
  if (props.type === 'workstream') return WORKSTREAM_STATUS_LABELS[props.status as WorkstreamStatus] ?? props.status
  if (props.type === 'activity') return ACTIVITY_STATUS_LABELS[props.status as ActivityStatus] ?? props.status
  return STATUS_LABELS[props.status as TaskStatus] ?? props.status
}

function getVariant(): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  const s = props.status
  if (s === 'completed') return 'success'
  if (s === 'blocked' || s === 'cancelled') return 'danger'
  if (s === 'in_progress' || s === 'active') return 'info'
  if (s === 'on_hold') return 'warning'
  if (s === 'archived') return 'default'
  return 'default'
}
</script>

<template>
  <AppBadge :variant="getVariant()" dot>{{ getLabel() }}</AppBadge>
</template>
