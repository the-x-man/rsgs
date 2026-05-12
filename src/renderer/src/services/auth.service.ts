import { supabase } from './supabase'
import type { User } from '../types'

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase!.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase!.auth.getSession()
    if (error) throw error
    return data.session
  },

  async getUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase!.auth.getUser()
    if (error || !user) return null

    const { data: profile } = await supabase!
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  },

  async updateProfile(id: string, updates: Partial<User>) {
    const { data, error } = await supabase!
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase!.from('users').select('*').order('name')
    if (error) throw error
    return data ?? []
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase!.auth.onAuthStateChange(callback)
  },
}
