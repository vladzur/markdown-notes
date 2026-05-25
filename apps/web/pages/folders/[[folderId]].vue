<script setup lang="ts">
import { useFolderStore } from '@notes-app/core-logic'
import { useAuth } from '~/composables/useAuth'
import MarkdownEditor from '@notes-app/ui/src/components/MarkdownEditor/MarkdownEditor.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const folderStore = useFolderStore()
const { user } = useAuth()

// Sincronizar currentFolderId con la ruta
const folderId = computed(() => (route.params.folderId as string) || null)
watchEffect(() => {
  folderStore.selectFolder(folderId.value)
})

// Nota seleccionada desde query param
const selectedNoteId = computed(() => (route.query.note as string) || null)

const selectedNote = computed(() => {
  if (!selectedNoteId.value) return null
  return folderStore.notes.find((n) => n.id === selectedNoteId.value) ?? null
})

const noteTitle = computed({
  get: () => selectedNote.value?.title ?? '',
  set: (val) => {
    if (selectedNoteId.value) {
      folderStore.updateNote(selectedNoteId.value, { title: val })
    }
  },
})

const noteContent = computed({
  get: () => selectedNote.value?.content ?? '',
  set: (val) => {
    if (selectedNoteId.value) {
      folderStore.updateNote(selectedNoteId.value, { content: val })
    }
  },
})

function handleCreateNote() {
  if (!folderStore.currentFolderId) return
  const now = new Date().toISOString()
  const note = {
    id: `local-${Date.now()}`,
    userId: user.value?.uid ?? '',
    folderId: folderStore.currentFolderId,
    title: '',
    content: '',
    isEncrypted: false,
    updatedAt: now,
  }
  folderStore.addNote(note)
  navigateTo(`/folders/${folderStore.currentFolderId}?note=${note.id}`)
}
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Sin folder seleccionado -->
    <div v-if="!folderStore.currentFolderId" class="flex-1 flex items-center justify-center text-dark-muted text-sm">
      <p>Selecciona una carpeta para ver sus notas</p>
    </div>

    <!-- Folder seleccionado pero sin nota -->
    <div v-else-if="!selectedNote" class="flex-1 flex flex-col items-center justify-center gap-3 text-dark-muted text-sm">
      <p>Selecciona una nota del panel lateral o crea una nueva</p>
      <button
        class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors"
        @click="handleCreateNote"
      >
        + Nueva nota
      </button>
    </div>

    <!-- Editor de nota -->
    <template v-else>
      <div class="flex-1 overflow-y-auto p-4 lg:p-8 flex justify-center">
        <div class="w-full max-w-3xl">
          <input
            v-model="noteTitle"
            type="text"
            class="w-full bg-transparent text-3xl font-bold text-white placeholder-dark-border outline-none border-none mb-6 font-sans"
            placeholder="Título de la nota"
          />
          <MarkdownEditor
            v-model="noteContent"
            placeholder="Escribe tu nota en Markdown..."
          />
        </div>
      </div>
    </template>
  </div>
</template>
