<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const loading = ref(false)

function validate() {
  errors.email = ''
  errors.password = ''
  let ok = true
  if (!form.email) { errors.email = 'Email is required'; ok = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Enter a valid email'; ok = false }
  if (!form.password) { errors.password = 'Password is required'; ok = false }
  return ok
}

async function submit() {
  if (!validate()) return
  loading.value = true
  try {
    await auth.signIn(form.email, form.password)
    router.push('/dashboard')
  } catch (e: any) {
    toast.error(e.message ?? 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
    <h1 class="text-xl font-bold text-slate-900 dark:text-white mb-1">Sign in</h1>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Welcome back to RSGS Flow</p>

    <form class="space-y-4" @submit.prevent="submit">
      <AppInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="you@company.com"
        :error="errors.email"
        required
        autocomplete="email"
      />
      <AppInput
        v-model="form.password"
        label="Password"
        type="password"
        placeholder="••••••••"
        :error="errors.password"
        required
        autocomplete="current-password"
      />

      <AppButton type="submit" class="w-full justify-center" :loading="loading">
        Sign in
      </AppButton>
    </form>

    <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
      Don't have an account?
      <RouterLink to="/auth/register" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign up</RouterLink>
    </p>
  </div>
</template>
