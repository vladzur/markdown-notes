import type { Folder, Note } from '@nexus-notes/firebase'
import type { TreeNode } from '../types'
import {
  createFolderDoc,
  deleteFolderDoc,
  deleteNoteDoc,
  updateFolderDoc,
} from '@nexus-notes/firebase'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { buildTree } from '../tree-builder'
import { useNoteStore } from './note-store'

export const useFolderStore = defineStore('folders', () => {
  const folders = ref<Folder[]>([])
  const currentFolderId = ref<string | null>(null)
  const isLoading = ref(false)

  const noteStore = useNoteStore()

  /** Árbol jerárquico reconstruido a partir de folders y notes planos. */
  const tree = computed<TreeNode[]>(() => buildTree(folders.value, noteStore.notes))

  /** Notas de la carpeta actualmente seleccionada. */
  const currentNotes = computed<Note[]>(() => {
    if (!currentFolderId.value)
      return []
    return noteStore.getNotesByFolderId(currentFolderId.value)
  })

  /** Reemplaza todo el estado local con datos planos desde Firestore. */
  async function setData(fetchedFolders: Folder[], fetchedNotes: Note[]): Promise<void> {
    folders.value = fetchedFolders
    await noteStore.setNotes(fetchedNotes)
  }

  /** Crea una carpeta en Firestore y la agrega al estado local. */
  async function addFolder(folder: Omit<Folder, 'id'>): Promise<Folder> {
    const id = await createFolderDoc(folder)
    const newFolder: Folder = { ...folder, id }
    folders.value.push(newFolder)
    return newFolder
  }

  /** Elimina una carpeta y sus notas asociadas de Firestore y del estado local. */
  async function removeFolder(folderId: string): Promise<void> {
    // Snapshot para rollback en caso de error
    const removedFolders = folders.value.filter(f => f.id === folderId)
    const wasSelected = currentFolderId.value === folderId

    // Optimistic: eliminar del estado local inmediatamente
    folders.value = folders.value.filter(f => f.id !== folderId)
    if (wasSelected) {
      currentFolderId.value = null
    }

    // Delegar eliminación local de notas al noteStore
    const removedNoteIds = noteStore.removeNotesByFolderId(folderId)

    try {
      // Eliminar notas del folder en Firestore (secuencial)
      for (const noteId of removedNoteIds) {
        await deleteNoteDoc(noteId)
      }
      await deleteFolderDoc(folderId)
    }
    catch (e) {
      // Rollback
      folders.value.push(...removedFolders)
      if (wasSelected) {
        currentFolderId.value = folderId
      }
      console.error('Error al eliminar carpeta en Firestore:', e)
    }
  }

  /** Actualiza una carpeta en Firestore y en el estado local (sin debounce). */
  async function updateFolder(
    folderId: string,
    updates: Partial<Pick<Folder, 'name' | 'parentId'>>,
  ): Promise<void> {
    const index = folders.value.findIndex(f => f.id === folderId)
    if (index === -1)
      return

    const previous = { ...folders.value[index]! }

    // Optimistic: aplicar cambio local inmediato
    folders.value[index] = { ...folders.value[index]!, ...updates }

    try {
      await updateFolderDoc(folderId, updates)
    }
    catch (e) {
      // Rollback
      folders.value[index] = previous
      console.error('Error al actualizar carpeta en Firestore:', e)
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
    currentFolderId,
    isLoading,
    tree,
    currentNotes,
    setData,
    addFolder,
    removeFolder,
    updateFolder,
    selectFolder,
    setLoading,
  }
})
