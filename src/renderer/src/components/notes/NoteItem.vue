<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import UserAvatar from '../common/UserAvatar.vue'
import AppButton from '../ui/AppButton.vue'
import TipTapEditor from '../../editor/TipTapEditor.vue'
import { useNoteStore } from '../../stores/note'
import { useAuthStore } from '../../stores/auth'
import { formatDateTime, fromNow } from '../../utils/date'
import type { TaskNote } from '../../types'

interface Props { note: TaskNote }
defineProps<Props>()

const noteStore = useNoteStore()
const auth = useAuthStore()
const editing = ref(false)
const editContent = ref('')
const saving = ref(false)

function startEdit(note: TaskNote) {
  editContent.value = note.content
  editing.value = true
}

async function saveEdit(note: TaskNote) {
  if (!editContent.value.trim()) return
  saving.value = true
  try {
    await noteStore.edit(note.id, editContent.value)
    editing.value = false
    toast.success('Note updated')
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    saving.value = false
  }
}

async function deleteNote(note: TaskNote) {
  try {
    await noteStore.remove(note.id)
    toast.success('Note deleted')
  } catch (e: any) {
    toast.error(e.message)
  }
}

function isOwn(note: TaskNote): boolean {
  return note.author_id === auth.user?.id
}
</script>

<template>
  <div class="flex gap-3 group">
    <UserAvatar :name="note.author?.name" :avatar-url="note.author?.avatar_url" size="sm" class="flex-shrink-0 mt-0.5" />

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-xs font-semibold text-slate-900 dark:text-white">{{ note.author?.name ?? 'Unknown' }}</span>
        <span class="text-xs text-slate-400" :title="formatDateTime(note.created_at)">{{ fromNow(note.created_at) }}</span>
        <span v-if="note.edited_at" class="text-xs text-slate-400 italic">(edited)</span>
        <div v-if="isOwn(note)" class="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
            @click="startEdit(note)"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            class="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            @click="deleteNote(note)"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="editing">
        <TipTapEditor v-model="editContent" min-height="80px" />
        <div class="flex gap-2 mt-2">
          <AppButton size="xs" :loading="saving" @click="saveEdit(note)">Save</AppButton>
          <AppButton size="xs" variant="ghost" @click="editing = false">Cancel</AppButton>
        </div>
      </div>
      <div
        v-else
        class="prose-content text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3"
        v-html="note.content"
      />
    </div>
  </div>
</template>
