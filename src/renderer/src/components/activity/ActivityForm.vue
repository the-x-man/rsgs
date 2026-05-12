<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import AppInput from '../ui/AppInput.vue'
import AppSelect from '../ui/AppSelect.vue'
import AppButton from '../ui/AppButton.vue'
import TipTapEditor from '../../editor/TipTapEditor.vue'
import { useActivityStore } from '../../stores/activity'
import { isDateInPast, todayIso } from '../../utils/date'
import type { Activity } from '../../types'

interface Props {
  workstreamId: string
  activity?: Activity | null
}

const props = withDefaults(defineProps<Props>(), { activity: null })
const emit = defineEmits<{ close: []; saved: [act: Activity] }>()

const store = useActivityStore()

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const form = reactive({
  title: '',
  description: '',
  due_date: '',
  status: 'active' as Activity['status'],
})

const dateError = ref('')
const saving = ref(false)

watch(() => props.activity, (act) => {
  if (act) {
    form.title = act.title
    form.description = act.description ?? ''
    form.due_date = act.due_date ?? ''
    form.status = act.status
  }
}, { immediate: true })

function validateDate() {
  if (form.due_date && !props.activity && isDateInPast(form.due_date)) {
    dateError.value = 'Due date must be in the future'
    return false
  }
  dateError.value = ''
  return true
}

async function submit() {
  if (!form.title.trim() || !validateDate()) return
  saving.value = true
  try {
    const payload = {
      workstream_id: props.workstreamId,
      title: form.title.trim(),
      description: form.description || null,
      due_date: form.due_date || null,
      status: form.status,
    }
    let act: Activity
    if (props.activity) {
      act = await store.update(props.activity.id, payload)
      toast.success('Activity updated')
    } else {
      act = await store.create(payload)
      toast.success('Activity created')
    }
    emit('saved', act)
  } catch (e: any) {
    toast.error(e.message ?? 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <AppInput v-model="form.title" label="Title" placeholder="Activity title" required />

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
      <TipTapEditor v-model="form.description" placeholder="Describe this activity..." />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <AppInput
        v-model="form.due_date"
        label="Due Date"
        type="date"
        :min="!activity ? todayIso() : undefined"
        :error="dateError"
        @change="validateDate"
      />
      <AppSelect v-model="form.status" label="Status" :options="statusOptions" />
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <AppButton variant="secondary" type="button" @click="emit('close')">Cancel</AppButton>
      <AppButton variant="primary" type="submit" :loading="saving">
        {{ activity ? 'Update' : 'Create' }} Activity
      </AppButton>
    </div>
  </form>
</template>
