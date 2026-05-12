<script setup>
import { onMounted, ref } from 'vue'
import { isSupabaseConfigured, supabase } from './lib/supabase'

const supabaseConnectionStatus = ref('Not checked yet')
const sessionStatus = ref('Unknown')

onMounted(async () => {
  if (!isSupabaseConfigured || !supabase) {
    supabaseConnectionStatus.value = 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect.'
    sessionStatus.value = 'N/A'
    return
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    supabaseConnectionStatus.value = `Supabase error: ${error.message}`
    sessionStatus.value = 'Unknown'
    return
  }

  supabaseConnectionStatus.value = 'Supabase client initialized successfully.'
  sessionStatus.value = data.session ? 'Signed in' : 'Signed out'
})
</script>

<template>
  <main class="min-h-screen bg-slate-950 text-slate-100">
    <div
      class="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-12"
    >
      <header class="space-y-2">
        <p class="text-sm font-medium uppercase tracking-widest text-emerald-400">
          Electron + Vue + Vite
        </p>
        <h1 class="text-4xl font-bold">Supabase + Tailwind starter</h1>
        <p class="text-slate-300">
          Desktop app scaffold ready for auth, storage, and Postgres-backed features.
        </p>
      </header>

      <section class="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 class="text-lg font-semibold">Supabase status</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex items-start justify-between gap-4">
            <dt class="text-slate-400">Environment</dt>
            <dd :class="isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'">
              {{ isSupabaseConfigured ? 'Configured' : 'Missing env vars' }}
            </dd>
          </div>
          <div class="flex items-start justify-between gap-4">
            <dt class="text-slate-400">Client check</dt>
            <dd class="text-right text-slate-200">{{ supabaseConnectionStatus }}</dd>
          </div>
          <div class="flex items-start justify-between gap-4">
            <dt class="text-slate-400">Session</dt>
            <dd class="text-slate-200">{{ sessionStatus }}</dd>
          </div>
        </dl>
      </section>

      <footer class="flex flex-wrap gap-3 text-sm">
        <a
          class="rounded-md border border-slate-700 px-3 py-2 text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300"
          href="https://electron-vite.org/"
          rel="noreferrer"
          target="_blank"
        >
          Electron Vite Docs
        </a>
        <a
          class="rounded-md border border-slate-700 px-3 py-2 text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300"
          href="https://supabase.com/docs"
          rel="noreferrer"
          target="_blank"
        >
          Supabase Docs
        </a>
      </footer>
    </div>
  </main>
</template>
