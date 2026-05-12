import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskService } from '../services/task.service'
import type { TaskNote } from '../types'

export const useNoteStore = defineStore('note', () => {
  const notes = ref<TaskNote[]>([])
  const loading = ref(false)

  async function fetchByTask(taskId: string) {
    loading.value = true
    try {
      notes.value = await taskService.getNotes(taskId)
    } finally {
      loading.value = false
    }
  }

  async function add(taskId: string, content: string) {
    const note = await taskService.addNote(taskId, content)
    notes.value.push(note)
    return note
  }

  async function edit(noteId: string, content: string) {
    const note = await taskService.updateNote(noteId, content)
    const idx = notes.value.findIndex((n) => n.id === noteId)
    if (idx !== -1) notes.value[idx] = note
    return note
  }

  async function remove(noteId: string) {
    await taskService.deleteNote(noteId)
    notes.value = notes.value.filter((n) => n.id !== noteId)
  }

  return { notes, loading, fetchByTask, add, edit, remove }
})
