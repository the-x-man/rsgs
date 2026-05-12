<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'

interface Props {
  modelValue?: string | null
  placeholder?: string
  readonly?: boolean
  minHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Write something...',
  readonly: false,
  minHeight: '120px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue ?? '',
  editable: !props.readonly,
  extensions: [
    StarterKit,
    Underline,
    Placeholder.configure({ placeholder: props.placeholder }),
    Link.configure({ openOnClick: false }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val ?? '', false)
  }
})

watch(() => props.readonly, (val) => {
  editor.value?.setEditable(!val)
})

onBeforeUnmount(() => editor.value?.destroy())

function toggleBold() { editor.value?.chain().focus().toggleBold().run() }
function toggleItalic() { editor.value?.chain().focus().toggleItalic().run() }
function toggleUnderline() { editor.value?.chain().focus().toggleUnderline().run() }
function toggleCode() { editor.value?.chain().focus().toggleCode().run() }
function toggleBullet() { editor.value?.chain().focus().toggleBulletList().run() }
function toggleOrdered() { editor.value?.chain().focus().toggleOrderedList().run() }
function toggleBlockquote() { editor.value?.chain().focus().toggleBlockquote().run() }
function setHeading(level: 1 | 2 | 3) { editor.value?.chain().focus().toggleHeading({ level }).run() }

function isActive(name: string, opts?: object) {
  return editor.value?.isActive(name, opts) ?? false
}
</script>

<template>
  <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
    <div v-if="!readonly" class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
      <button
        v-for="({ fn, label, check }) in [
          { fn: () => setHeading(1), label: 'H1', check: 'heading' },
          { fn: () => setHeading(2), label: 'H2', check: 'heading' },
          { fn: () => setHeading(3), label: 'H3', check: 'heading' },
        ]"
        :key="label"
        type="button"
        :class="['px-2 py-1 text-xs font-mono rounded transition-colors', isActive(check, { level: parseInt(label[1]) }) ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']"
        @click="fn"
      >{{ label }}</button>

      <div class="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

      <button type="button" :class="['px-2 py-1 text-xs font-bold rounded transition-colors', isActive('bold') ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']" @click="toggleBold">B</button>
      <button type="button" :class="['px-2 py-1 text-xs italic rounded transition-colors', isActive('italic') ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']" @click="toggleItalic">I</button>
      <button type="button" :class="['px-2 py-1 text-xs underline rounded transition-colors', isActive('underline') ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']" @click="toggleUnderline">U</button>
      <button type="button" :class="['px-2 py-1 text-xs font-mono rounded transition-colors', isActive('code') ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']" @click="toggleCode">&lt;/&gt;</button>

      <div class="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

      <button type="button" :class="['px-2 py-1 text-xs rounded transition-colors', isActive('bulletList') ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']" @click="toggleBullet">• List</button>
      <button type="button" :class="['px-2 py-1 text-xs rounded transition-colors', isActive('orderedList') ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']" @click="toggleOrdered">1. List</button>
      <button type="button" :class="['px-2 py-1 text-xs rounded transition-colors', isActive('blockquote') ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700']" @click="toggleBlockquote">" Quote</button>
    </div>

    <EditorContent
      :editor="editor"
      :style="{ minHeight: minHeight }"
      class="tiptap px-4 py-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
    />
  </div>
</template>
