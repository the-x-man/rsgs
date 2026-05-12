import { defineStore } from 'pinia'
import { ref } from 'vue'
import { workstreamService } from '../services/workstream.service'
import type { Workstream, FilterOptions, PaginatedResponse } from '../types'

export const useWorkstreamStore = defineStore('workstream', () => {
  const workstreams = ref<Workstream[]>([])
  const current = ref<Workstream | null>(null)
  const loading = ref(false)
  const meta = ref({ page: 1, per_page: 20, total: 0, total_pages: 1 })
  const filters = ref<FilterOptions>({ page: 1, per_page: 20 })

  async function fetchAll(opts: FilterOptions = {}) {
    loading.value = true
    try {
      filters.value = { ...filters.value, ...opts }
      const res: PaginatedResponse<Workstream> = await workstreamService.getAll(filters.value)
      workstreams.value = res.data
      meta.value = res.meta
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    try {
      current.value = await workstreamService.getById(id)
    } finally {
      loading.value = false
    }
  }

  async function create(payload: Partial<Workstream>) {
    const ws = await workstreamService.create(payload)
    workstreams.value.unshift(ws)
    return ws
  }

  async function update(id: string, payload: Partial<Workstream>) {
    const ws = await workstreamService.update(id, payload)
    const idx = workstreams.value.findIndex((w) => w.id === id)
    if (idx !== -1) workstreams.value[idx] = ws
    if (current.value?.id === id) current.value = ws
    return ws
  }

  async function remove(id: string) {
    await workstreamService.delete(id)
    workstreams.value = workstreams.value.filter((w) => w.id !== id)
    if (current.value?.id === id) current.value = null
  }

  return { workstreams, current, loading, meta, filters, fetchAll, fetchById, create, update, remove }
})
