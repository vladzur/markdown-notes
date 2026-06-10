import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Note } from '@nexus-notes/firebase'
import {
  createNoteDoc,
  deleteNoteDoc,
  updateNoteDoc,
} from '@nexus-notes/firebase'

/** Tiempo de espera (ms) para consolidar escrituras frecuentes de contenido. */
const NOTE_SAVE_DEBOUNCE_MS = 500

export const useNoteStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const currentNoteId = ref<string | null>(null)

  /** Debounces pendientes de persistencia a Firestore, indexados por noteId. */
  const pendingNoteSaves = new Map<string, ReturnType<typeof setTimeout>>()

  const currentNote = computed<Note | undefined>(() => {
    return notes.value.find(n => n.id === currentNoteId.value)
  })

  function setNotes(fetchedNotes: Note[]): void {
    notes.value = fetchedNotes
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
    const wasSelected = currentNoteId.value === noteId

    // Optimistic
    notes.value = notes.value.filter((n) => n.id !== noteId)
    if (wasSelected) {
      currentNoteId.value = null
    }
    cancelPendingNoteSave(noteId)

    try {
      await deleteNoteDoc(noteId)
    } catch (e) {
      // Rollback
      if (removedNote) {
        notes.value.push(removedNote)
      }
      if (wasSelected) {
        currentNoteId.value = noteId
      }
      console.error('Error al eliminar nota en Firestore:', e)
    }
  }

  /** Actualiza una nota en el estado local y agenda la persistencia a Firestore. */
  function updateNote(noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>): void {
    const index = notes.value.findIndex((n) => n.id === noteId)
    if (index === -1) return

    notes.value[index] = { ...notes.value[index]!, ...updates }

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

  function selectNote(noteId: string | null): void {
    currentNoteId.value = noteId
  }

  function getNotesByFolderId(folderId: string): Note[] {
    return notes.value.filter(n => n.folderId === folderId)
  }

  /** Elimina localmente todas las notas de una carpeta y retorna sus IDs para ser eliminadas en Firestore */
  function removeNotesByFolderId(folderId: string): string[] {
    const notesToRemove = notes.value.filter(n => n.folderId === folderId)
    const idsToRemove = notesToRemove.map(n => n.id)
    
    if (currentNoteId.value && idsToRemove.includes(currentNoteId.value)) {
      currentNoteId.value = null
    }
    
    notes.value = notes.value.filter(n => n.folderId !== folderId)
    return idsToRemove
  }

  return {
    notes,
    currentNoteId,
    currentNote,
    setNotes,
    addNote,
    removeNote,
    updateNote,
    selectNote,
    getNotesByFolderId,
    removeNotesByFolderId,
    cancelPendingNoteSave,
  }
})
