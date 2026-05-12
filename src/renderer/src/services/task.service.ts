import { supabase } from './supabase'
import type { Task, TaskNote, FilterOptions } from '../types'

export const taskService = {
  async getByActivity(activityId: string, filters: FilterOptions = {}): Promise<Task[]> {
    const { status, priority } = filters
    let query = supabase!
      .from('tasks')
      .select('*, owners:task_owners(user:users(*))')
      .eq('activity_id', activityId)
      .order('position', { ascending: true })

    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)

    const { data, error } = await query
    if (error) throw error

    return (data ?? []).map((t) => ({
      ...t,
      owners: t.owners?.map((o: { user: unknown }) => o.user) ?? [],
    }))
  },

  async getById(id: string): Promise<Task> {
    const { data, error } = await supabase!
      .from('tasks')
      .select('*, activity:activities(*, workstream:workstreams(*)), owners:task_owners(user:users(*)), notes:task_notes(*, author:users(*))')
      .eq('id', id)
      .single()
    if (error) throw error
    return {
      ...data,
      owners: data.owners?.map((o: { user: unknown }) => o.user) ?? [],
    }
  },

  async getAll(filters: FilterOptions = {}): Promise<Task[]> {
    const { status, priority } = filters
    let query = supabase!
      .from('tasks')
      .select('*, activity:activities(id, title, workstream:workstreams(id, title)), owners:task_owners(user:users(*))')
      .order('due_date', { ascending: true, nullsFirst: false })

    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)

    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map((t) => ({
      ...t,
      owners: t.owners?.map((o: { user: unknown }) => o.user) ?? [],
    }))
  },

  async create(payload: Partial<Task>, ownerIds: string[] = []): Promise<Task> {
    const { data: { user } } = await supabase!.auth.getUser()
    const { data, error } = await supabase!
      .from('tasks')
      .insert({ ...payload, created_by: user?.id })
      .select()
      .single()
    if (error) throw error

    if (ownerIds.length) {
      await supabase!.from('task_owners').insert(
        ownerIds.map((uid) => ({ task_id: data.id, user_id: uid }))
      )
    }

    return data
  },

  async update(id: string, payload: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase!
      .from('tasks')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateOwners(taskId: string, ownerIds: string[]): Promise<void> {
    await supabase!.from('task_owners').delete().eq('task_id', taskId)
    if (ownerIds.length) {
      await supabase!.from('task_owners').insert(
        ownerIds.map((uid) => ({ task_id: taskId, user_id: uid }))
      )
    }
  },

  async updatePosition(id: string, status: string, position: number): Promise<void> {
    const { error } = await supabase!
      .from('tasks')
      .update({ status, position, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase!.from('tasks').delete().eq('id', id)
    if (error) throw error
  },

  async getNotes(taskId: string): Promise<TaskNote[]> {
    const { data, error } = await supabase!
      .from('task_notes')
      .select('*, author:users(*)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async addNote(taskId: string, content: string): Promise<TaskNote> {
    const { data: { user } } = await supabase!.auth.getUser()
    const { data, error } = await supabase!
      .from('task_notes')
      .insert({ task_id: taskId, content, author_id: user?.id })
      .select('*, author:users(*)')
      .single()
    if (error) throw error
    return data
  },

  async updateNote(noteId: string, content: string): Promise<TaskNote> {
    const { data, error } = await supabase!
      .from('task_notes')
      .update({ content, edited_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select('*, author:users(*)')
      .single()
    if (error) throw error
    return data
  },

  async deleteNote(noteId: string): Promise<void> {
    const { error } = await supabase!.from('task_notes').delete().eq('id', noteId)
    if (error) throw error
  },
}
