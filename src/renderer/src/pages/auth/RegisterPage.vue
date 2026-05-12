<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '', confirm: '' })
const errors = reactive({ name: '', email: '', password: '', confirm: '' })
const loading = ref(false)

function validate() {
  Object.keys(errors).forEach((k) => ((errors as Record<string, string>)[k] = ''))
  let ok = true
  if (!form.name.trim()) { errors.name = 'Name is required'; ok = false }
  if (!form.email) { errors.email = 'Email is required'; ok = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Enter a valid email'; ok = false }
  if (form.password.length < 8) { errors.password = 'Password must be at least 8 characters'; ok = false }
  if (form.password !== form.confirm) { errors.confirm = 'Passwords do not match'; ok = false }
  return ok
}

async function submit() {
  if (!validate()) return
  loading.value = true
  try {
    await authService.signUp(form.email, form.password, form.name)
    toast.success('Account created! Please check your email to verify.')
    router.push('/auth/login')
  } catch (e: any) {
    toast.error(e.message ?? 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
    <h1 class="text-xl font-bold text-slate-900 dark:text-white mb-1">Create account</h1>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Get started with RSGS Flow</p>

    <form class="space-y-4" @submit.prevent="submit">
      <AppInput v-model="form.name" label="Full Name" placeholder="Jane Smith" :error="errors.name" required />
      <AppInput v-model="form.email" label="Email" type="email" placeholder="you@company.com" :error="errors.email" required />
      <AppInput v-model="form.password" label="Password" type="password" placeholder="8+ characters" :error="errors.password" required />
      <AppInput v-model="form.confirm" label="Confirm Password" type="password" placeholder="Confirm password" :error="errors.confirm" required />

      <AppButton type="submit" class="w-full justify-center" :loading="loading">
        Create Account
      </AppButton>
    </form>

    <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
      Already have an account?
      <RouterLink to="/auth/login" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</RouterLink>
    </p>
  </div>
</template>
