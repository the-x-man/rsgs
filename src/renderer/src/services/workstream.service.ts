import { supabase } from './supabase'
import type { Workstream, FilterOptions, PaginatedResponse } from '../types'

export const workstreamService = {
  async getAll(filters: FilterOptions = {}): Promise<PaginatedResponse<Workstream>> {
    const { page = 1, per_page = 20, search, status } = filters
    const from = (page - 1) * per_page
    const to = from + per_page - 1

    let query = supabase!
      .from('workstreams')
      .select('*, activities(count)', { count: 'exact' })
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

  async getById(id: string): Promise<Workstream> {
    const { data, error } = await supabase!
      .from('workstreams')
      .select('*, activities(*, tasks(count))')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(payload: Partial<Workstream>): Promise<Workstream> {
    const { data: { user } } = await supabase!.auth.getUser()
    const { data, error } = await supabase!
      .from('workstreams')
      .insert({ ...payload, created_by: user?.id })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: Partial<Workstream>): Promise<Workstream> {
    const { data, error } = await supabase!
      .from('workstreams')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase!.from('workstreams').delete().eq('id', id)
    if (error) throw error
  },
}
