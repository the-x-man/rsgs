<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import NoteItem from './NoteItem.vue'
import TipTapEditor from '../../editor/TipTapEditor.vue'
import AppButton from '../ui/AppButton.vue'
import AppSkeleton from '../ui/AppSkeleton.vue'
import EmptyState from '../common/EmptyState.vue'
import { useNoteStore } from '../../stores/note'

interface Props { taskId: string }
const props = defineProps<Props>()

const noteStore = useNoteStore()
const newNote = ref('')
const submitting = ref(false)

onMounted(() => noteStore.fetchByTask(props.taskId))

async function addNote() {
  if (!newNote.value.trim() || newNote.value === '<p></p>') return
  submitting.value = true
  try {
    await noteStore.add(props.taskId, newNote.value)
    newNote.value = ''
    toast.success('Note added')
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
      <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      Running Log
      <span class="text-xs font-normal text-slate-400">({{ noteStore.notes.length }})</span>
    </h3>

    <!-- Notes list -->
    <div v-if="noteStore.loading" class="space-y-4">
      <AppSkeleton v-for="i in 3" :key="i" height="h-16" rounded="rounded-xl" />
    </div>

    <div v-else-if="noteStore.notes.length === 0">
      <EmptyState title="No notes yet" description="Add the first note to start tracking progress" />
    </div>

    <div v-else class="space-y-4">
      <NoteItem v-for="note in noteStore.notes" :key="note.id" :note="note" />
    </div>

    <!-- New note input -->
    <div class="border-t border-slate-100 dark:border-slate-800 pt-4">
      <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Add Note</label>
      <TipTapEditor v-model="newNote" placeholder="Add a note, update, or comment..." min-height="80px" />
      <div class="flex justify-end mt-2">
        <AppButton size="sm" :loading="submitting" @click="addNote">Add Note</AppButton>
      </div>
    </div>
  </div>
</template>
