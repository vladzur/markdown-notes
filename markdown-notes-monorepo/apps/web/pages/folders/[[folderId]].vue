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

const selectedNoteId = ref<string | null>(null)

// Sincronizar currentFolderId con la ruta y resetear nota seleccionada al cambiar de carpeta
const folderId = computed(() => (route.params.folderId as string) || null)
watchEffect(() => {
  folderStore.selectFolder(folderId.value)
  selectedNoteId.value = null
})

// Notas del folder actual
const currentNotes = computed(() => folderStore.currentNotes)

// Nota seleccionada
const selectedNote = computed(() => {
  if (!selectedNoteId.value) return null
  return folderStore.notes.find((n) => n.id === selectedNoteId.value) ?? null
})

// Binding bidireccional con la nota seleccionada
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
  selectedNoteId.value = note.id
}

function handleSelectNote(noteId: string) {
  selectedNoteId.value = noteId
}

function handleDeleteNote(noteId: string) {
  if (selectedNoteId.value === noteId) {
    selectedNoteId.value = null
  }
  folderStore.removeNote(noteId)
  // TODO: eliminar de Firestore en segundo plano
}
</script>

<template>
  <div class="folders-page">
    <!-- Sin folder seleccionado -->
    <div v-if="!folderStore.currentFolderId" class="folders-page__empty">
      <p>Selecciona una carpeta para ver sus notas</p>
    </div>

    <!-- Folder seleccionado -->
    <template v-else>
      <div class="folders-page__layout">
        <!-- Panel de lista de notas -->
        <aside class="notes-panel">
          <div class="notes-panel__header">
            <span class="notes-panel__count">{{ currentNotes.length }} nota{{ currentNotes.length === 1 ? '' : 's' }}</span>
            <button
              class="notes-panel__new-btn"
              @click="handleCreateNote"
            >
              + Nueva
            </button>
          </div>

          <div v-if="currentNotes.length === 0" class="notes-panel__empty">
            <p>Esta carpeta está vacía.</p>
            <p>Crea tu primera nota.</p>
          </div>

          <ul v-else class="notes-panel__list">
            <li
              v-for="note in currentNotes"
              :key="note.id"
              class="notes-panel__item"
              :class="{ 'notes-panel__item--active': note.id === selectedNoteId }"
              @click="handleSelectNote(note.id)"
            >
              <div class="notes-panel__item-main">
                <span class="notes-panel__item-title">{{ note.title || 'Sin título' }}</span>
                <span class="notes-panel__item-date">{{ note.updatedAt.slice(0, 10) }}</span>
              </div>
              <button
                class="notes-panel__item-delete"
                title="Eliminar nota"
                @click.stop="handleDeleteNote(note.id)"
              >
                &times;
              </button>
            </li>
          </ul>
        </aside>

        <!-- Panel editor -->
        <section class="editor-panel">
          <template v-if="selectedNote">
            <input
              v-model="noteTitle"
              type="text"
              class="editor-panel__title-input"
              placeholder="Título de la nota"
            />
            <MarkdownEditor
              v-model="noteContent"
              placeholder="Escribe tu nota en Markdown..."
            />
          </template>
          <div v-else class="editor-panel__empty">
            <p>Selecciona una nota o crea una nueva para empezar a editar</p>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.folders-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.folders-page__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #888);
  font-size: 15px;
}

.folders-page__layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ---- Panel de lista de notas ---- */
.notes-panel {
  width: 240px;
  min-width: 0;
  border-right: 1px solid var(--color-border, #e5e5e5);
  background: var(--color-surface, #ffffff);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notes-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
}

.notes-panel__count {
  font-size: 12px;
  color: var(--color-text-muted, #888);
}

.notes-panel__new-btn {
  border: 1px solid var(--color-border, #ddd);
  background: var(--color-surface, #fff);
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-primary, #3b82f6);
  white-space: nowrap;
}

.notes-panel__new-btn:hover {
  background: var(--color-bg, #f5f5f5);
}

.notes-panel__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 20px;
  color: var(--color-text-muted, #888);
  font-size: 13px;
  text-align: center;
}

.notes-panel__list {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
}

.notes-panel__item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
  transition: background 0.1s;
}

.notes-panel__item:hover {
  background: var(--color-bg, #f9f9f9);
}

.notes-panel__item--active {
  background: var(--color-bg, #f0f4ff);
}

.notes-panel__item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notes-panel__item-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notes-panel__item-date {
  font-size: 11px;
  color: var(--color-text-muted, #aaa);
}

.notes-panel__item-delete {
  border: none;
  background: none;
  font-size: 18px;
  color: var(--color-text-muted, #bbb);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s, color 0.1s;
}

.notes-panel__item:hover .notes-panel__item-delete {
  opacity: 1;
}

.notes-panel__item-delete:hover {
  color: var(--color-error, #ef4444);
}

/* ---- Panel editor ---- */
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-panel__title-input {
  border: none;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 600;
  outline: none;
  background: var(--color-surface, #fff);
}

.editor-panel__title-input::placeholder {
  color: var(--color-text-muted, #bbb);
}

.editor-panel__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #888);
  font-size: 15px;
}
</style>
