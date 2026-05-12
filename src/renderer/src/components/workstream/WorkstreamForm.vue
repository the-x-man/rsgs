<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import AppInput from '../ui/AppInput.vue'
import AppSelect from '../ui/AppSelect.vue'
import AppTextarea from '../ui/AppTextarea.vue'
import AppButton from '../ui/AppButton.vue'
import { useWorkstreamStore } from '../../stores/workstream'
import type { Workstream } from '../../types'

interface Props {
  workstream?: Workstream | null
}

const props = withDefaults(defineProps<Props>(), { workstream: null })
const emit = defineEmits<{ close: []; saved: [ws: Workstream] }>()

const store = useWorkstreamStore()
const saving = ref(false)

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const form = reactive({
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  reinvention_partner: '',
  status: 'active' as Workstream['status'],
})

watch(() => props.workstream, (ws) => {
  if (ws) {
    form.title = ws.title
    form.description = ws.description ?? ''
    form.start_date = ws.start_date ?? ''
    form.end_date = ws.end_date ?? ''
    form.reinvention_partner = ws.reinvention_partner ?? ''
    form.status = ws.status
  }
}, { immediate: true })

async function submit() {
  if (!form.title.trim()) return
  saving.value = true
  try {
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      reinvention_partner: form.reinvention_partner || null,
      status: form.status,
    }
    let ws: Workstream
    if (props.workstream) {
      ws = await store.update(props.workstream.id, payload)
      toast.success('Workstream updated')
    } else {
      ws = await store.create(payload)
      toast.success('Workstream created')
    }
    emit('saved', ws)
  } catch (e: any) {
    toast.error(e.message ?? 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <AppInput v-model="form.title" label="Title" placeholder="Workstream title" required />
    <AppTextarea v-model="form.description" label="Description" placeholder="Optional description..." :rows="3" />
    <div class="grid grid-cols-2 gap-4">
      <AppInput v-model="form.start_date" label="Start Date" type="date" />
      <AppInput v-model="form.end_date" label="End Date" type="date" />
    </div>
    <AppInput v-model="form.reinvention_partner" label="Reinvention Partner" placeholder="Partner name" />
    <AppSelect v-model="form.status" label="Status" :options="statusOptions" />

    <div class="flex justify-end gap-3 pt-2">
      <AppButton variant="secondary" type="button" @click="emit('close')">Cancel</AppButton>
      <AppButton variant="primary" type="submit" :loading="saving">
        {{ workstream ? 'Update' : 'Create' }} Workstream
      </AppButton>
    </div>
  </form>
</template>
