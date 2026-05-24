import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Folder, Note } from '@notes-app/firebase'
import type { TreeNode } from '../types'
import { buildTree } from '../tree-builder'

export const useFolderStore = defineStore('folders', () => {
  const folders = ref<Folder[]>([])
  const notes = ref<Note[]>([])
  const currentFolderId = ref<string | null>(null)
  const isLoading = ref(false)

  /** Árbol jerárquico reconstruido a partir de folders y notes planos. */
  const tree = computed<TreeNode[]>(() => buildTree(folders.value, notes.value))

  /** Notas de la carpeta actualmente seleccionada. */
  const currentNotes = computed<Note[]>(() => {
    if (!currentFolderId.value) return []
    return notes.value.filter((n) => n.folderId === currentFolderId.value)
  })

  /** Reemplaza todo el estado local con datos planos desde Firestore. */
  function setData(fetchedFolders: Folder[], fetchedNotes: Note[]): void {
    folders.value = fetchedFolders
    notes.value = fetchedNotes
  }

  function addFolder(folder: Folder): void {
    folders.value.push(folder)
  }

  function removeFolder(folderId: string): void {
    // Eliminar la carpeta y sus notas asociadas
    folders.value = folders.value.filter((f) => f.id !== folderId)
    notes.value = notes.value.filter((n) => n.folderId !== folderId)
    if (currentFolderId.value === folderId) {
      currentFolderId.value = null
    }
  }

  function updateFolder(folderId: string, updates: Partial<Pick<Folder, 'name' | 'parentId'>>): void {
    const index = folders.value.findIndex((f) => f.id === folderId)
    if (index !== -1) {
      folders.value[index] = { ...folders.value[index]!, ...updates }
    }
  }

  function addNote(note: Note): void {
    notes.value.push(note)
  }

  function removeNote(noteId: string): void {
    notes.value = notes.value.filter((n) => n.id !== noteId)
  }

  function updateNote(noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>): void {
    const index = notes.value.findIndex((n) => n.id === noteId)
    if (index !== -1) {
      notes.value[index] = { ...notes.value[index]!, ...updates }
    }
  }

  function selectFolder(folderId: string | null): void {
    currentFolderId.value = folderId
  }

  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  return {
    folders,
    notes,
    currentFolderId,
    isLoading,
    tree,
    currentNotes,
    setData,
    addFolder,
    removeFolder,
    updateFolder,
    addNote,
    removeNote,
    updateNote,
    selectFolder,
    setLoading,
  }
})
