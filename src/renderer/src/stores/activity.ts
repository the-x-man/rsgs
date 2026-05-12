import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activityService } from '../services/activity.service'
import type { Activity, FilterOptions } from '../types'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<Activity[]>([])
  const current = ref<Activity | null>(null)
  const loading = ref(false)

  async function fetchByWorkstream(workstreamId: string, opts: FilterOptions = {}) {
    loading.value = true
    try {
      const res = await activityService.getByWorkstream(workstreamId, opts)
      activities.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    try {
      current.value = await activityService.getById(id)
    } finally {
      loading.value = false
    }
  }

  async function create(payload: Partial<Activity>) {
    const act = await activityService.create(payload)
    activities.value.unshift(act)
    return act
  }

  async function update(id: string, payload: Partial<Activity>) {
    const act = await activityService.update(id, payload)
    const idx = activities.value.findIndex((a) => a.id === id)
    if (idx !== -1) activities.value[idx] = act
    if (current.value?.id === id) current.value = act
    return act
  }

  async function remove(id: string) {
    await activityService.delete(id)
    activities.value = activities.value.filter((a) => a.id !== id)
    if (current.value?.id === id) current.value = null
  }

  return { activities, current, loading, fetchByWorkstream, fetchById, create, update, remove }
})
