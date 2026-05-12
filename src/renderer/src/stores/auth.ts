import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '../services/auth.service'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  async function init() {
    loading.value = true
    try {
      const session = await authService.getSession()
      if (session) {
        user.value = await authService.getUser()
      }
    } catch {
      user.value = null
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    try {
      await authService.signIn(email, password)
      user.value = await authService.getUser()
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await authService.signOut()
    user.value = null
  }

  return { user, loading, initialized, init, signIn, signOut }
})
