import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Folder, Note } from '@nexus-notes/firebase'
import {
  createFolderDoc,
  createNoteDoc,
  deleteFolderDoc,
  deleteNoteDoc,
  updateFolderDoc,
  updateNoteDoc,
} from '@nexus-notes/firebase'
import type { TreeNode } from '../types'
import { buildTree } from '../tree-builder'

/** Tiempo de espera (ms) para consolidar escrituras frecuentes de contenido. */
const NOTE_SAVE_DEBOUNCE_MS = 500

export const useFolderStore = defineStore('folders', () => {
  const folders = ref<Folder[]>([])
  const notes = ref<Note[]>([])
  const currentFolderId = ref<string | null>(null)
  const isLoading = ref(false)

  /** Debounces pendientes de persistencia a Firestore, indexados por noteId. */
  const pendingNoteSaves = new Map<string, ReturnType<typeof setTimeout>>()

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
    const removedFolders = folders.value.filter((f) => f.id === folderId)
    const removedNotes = notes.value.filter((n) => n.folderId === folderId)
    const wasSelected = currentFolderId.value === folderId

    // Optimistic: eliminar del estado local inmediatamente
    folders.value = folders.value.filter((f) => f.id !== folderId)
    notes.value = notes.value.filter((n) => n.folderId !== folderId)
    if (wasSelected) {
      currentFolderId.value = null
    }

    try {
      // Eliminar notas del folder en Firestore (secuencial)
      for (const note of removedNotes) {
        await deleteNoteDoc(note.id)
      }
      await deleteFolderDoc(folderId)
    } catch (e) {
      // Rollback: reinsertar lo eliminado
      folders.value.push(...removedFolders)
      notes.value.push(...removedNotes)
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
    const index = folders.value.findIndex((f) => f.id === folderId)
    if (index === -1) return

    const previous = { ...folders.value[index]! }

    // Optimistic: aplicar cambio local inmediato
    folders.value[index] = { ...folders.value[index]!, ...updates }

    try {
      await updateFolderDoc(folderId, updates)
    } catch (e) {
      // Rollback
      folders.value[index] = previous
      console.error('Error al actualizar carpeta en Firestore:', e)
    }
  }

  /** Crea una nota en Firestore y la agrega al estado local. */
  async function addNote(note: Omit<Note, 'id'>): Promise<Note> {
    const id = await createNoteDoc(note)
    const newNote: Note = { ...note, id }
    notes.value.push(newNote)
    return newNote
  }

  /** Elimina una nota de Firestore y del estado local. */
  async function removeNote(noteId: string): Promise<void> {
    const removedNote = notes.value.find((n) => n.id === noteId)

    // Optimistic: eliminar del estado local inmediatamente
    notes.value = notes.value.filter((n) => n.id !== noteId)
    // Cancelar cualquier guardado pendiente de esta nota
    cancelPendingNoteSave(noteId)

    try {
      await deleteNoteDoc(noteId)
    } catch (e) {
      // Rollback
      if (removedNote) {
        notes.value.push(removedNote)
      }
      console.error('Error al eliminar nota en Firestore:', e)
    }
  }

  /**
   * Actualiza una nota en el estado local de inmediato y agenda la
   * persistencia a Firestore con debounce para no saturar con cada keystroke.
   */
  function updateNote(noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>): void {
    const index = notes.value.findIndex((n) => n.id === noteId)
    if (index === -1) return

    // Aplicar cambio local inmediato para respuesta instantánea del editor
    notes.value[index] = { ...notes.value[index]!, ...updates }

    // Debounce: cancelar timer previo y programar uno nuevo
    cancelPendingNoteSave(noteId)
    const timer = setTimeout(async () => {
      pendingNoteSaves.delete(noteId)
      try {
        await updateNoteDoc(noteId, { ...updates, updatedAt: new Date().toISOString() })
      } catch (e) {
        console.error('Error al persistir nota en Firestore:', e)
      }
    }, NOTE_SAVE_DEBOUNCE_MS)
    pendingNoteSaves.set(noteId, timer)
  }

  /** Cancela el guardado pendiente de una nota (si existe). */
  function cancelPendingNoteSave(noteId: string): void {
    const timer = pendingNoteSaves.get(noteId)
    if (timer) {
      clearTimeout(timer)
      pendingNoteSaves.delete(noteId)
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
