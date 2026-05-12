import { supabase } from './supabase'
import type { Activity, FilterOptions, PaginatedResponse } from '../types'

export const activityService = {
  async getByWorkstream(
    workstreamId: string,
    filters: FilterOptions = {}
  ): Promise<PaginatedResponse<Activity>> {
    const { page = 1, per_page = 50, search, status } = filters
    const from = (page - 1) * per_page
    const to = from + per_page - 1

    let query = supabase!
      .from('activities')
      .select('*, tasks(count)', { count: 'exact' })
      .eq('workstream_id', workstreamId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) query = query.ilike('title', `%${search}%`)
    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) throw error

    return {
      data: data ?? [],
      meta: { page, per_page, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / per_page) },
    }
  },

  async getById(id: string): Promise<Activity> {
    const { data, error } = await supabase!
      .from('activities')
      .select('*, workstream:workstreams(*), tasks(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async getAll(filters: FilterOptions = {}): Promise<Activity[]> {
    const { search, status } = filters
    let query = supabase!
      .from('activities')
      .select('*, workstream:workstreams(id, title)')
      .order('due_date', { ascending: true, nullsFirst: false })

    if (search) query = query.ilike('title', `%${search}%`)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async create(payload: Partial<Activity>): Promise<Activity> {
    const { data: { user } } = await supabase!.auth.getUser()
    const { data, error } = await supabase!
      .from('activities')
      .insert({ ...payload, created_by: user?.id })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: Partial<Activity>): Promise<Activity> {
    const { data, error } = await supabase!
      .from('activities')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase!.from('activities').delete().eq('id', id)
    if (error) throw error
  },
}
