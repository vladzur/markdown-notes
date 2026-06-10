import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNoteStore } from '../stores/note-store'
import type { Note } from '@nexus-notes/firebase'

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'n-1',
    userId: 'user-1',
    folderId: 'f-1',
    title: 'Test Note',
    content: '# Hello',
    isEncrypted: false,
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const firestoreMocks = vi.hoisted(() => ({
  createNoteDoc: vi.fn(),
  deleteNoteDoc: vi.fn(),
  updateNoteDoc: vi.fn(),
}))

vi.mock('@nexus-notes/firebase', () => ({
  createNoteDoc: firestoreMocks.createNoteDoc,
  deleteNoteDoc: firestoreMocks.deleteNoteDoc,
  updateNoteDoc: firestoreMocks.updateNoteDoc,
}))

describe('useNoteStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with empty state', () => {
    const store = useNoteStore()
    expect(store.notes).toEqual([])
    expect(store.currentNoteId).toBeNull()
  })

  it('should add a new note (Firestore + local)', async () => {
    firestoreMocks.createNoteDoc.mockResolvedValue('firestore-note-id')
    const store = useNoteStore()

    const note = await store.addNote({
      userId: 'user-1',
      folderId: 'f-1',
      title: 'New',
      content: '',
      isEncrypted: false,
      updatedAt: '2026-01-01T00:00:00Z',
    })

    expect(firestoreMocks.createNoteDoc).toHaveBeenCalledTimes(1)
    expect(note.id).toBe('firestore-note-id')
    expect(store.notes).toHaveLength(1)
  })

  it('should remove note (optimistic + Firestore)', async () => {
    firestoreMocks.deleteNoteDoc.mockResolvedValue(undefined)
    const store = useNoteStore()
    store.setNotes([makeNote({ id: 'n-1' })])

    await store.removeNote('n-1')

    expect(firestoreMocks.deleteNoteDoc).toHaveBeenCalledWith('n-1')
    expect(store.notes).toHaveLength(0)
  })

  it('should rollback note removal if Firestore fails', async () => {
    firestoreMocks.deleteNoteDoc.mockRejectedValue(new Error('Firestore error'))
    const store = useNoteStore()
    store.setNotes([makeNote({ id: 'n-1', title: 'Important' })])

    await store.removeNote('n-1')

    expect(store.notes).toHaveLength(1)
    expect(store.notes[0]!.title).toBe('Important')
  })

  it('should update note content locally immediately', () => {
    const store = useNoteStore()
    store.setNotes([makeNote({ id: 'n-1', title: 'Old', content: 'old' })])

    store.updateNote('n-1', { title: 'New', content: 'new content' })

    expect(store.notes[0]!.title).toBe('New')
    expect(store.notes[0]!.content).toBe('new content')
    expect(firestoreMocks.updateNoteDoc).not.toHaveBeenCalled()
  })

  it('should debounce Firestore writes on rapid updates', async () => {
    vi.useFakeTimers()
    const store = useNoteStore()
    const note = makeNote({ id: 'n-1', title: '', content: '' })
    store.setNotes([note])

    store.updateNote('n-1', { content: 'a' })
    store.updateNote('n-1', { content: 'ab' })
    store.updateNote('n-1', { content: 'abc' })

    expect(firestoreMocks.updateNoteDoc).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)

    expect(firestoreMocks.updateNoteDoc).toHaveBeenCalledTimes(1)
    expect(firestoreMocks.updateNoteDoc).toHaveBeenCalledWith('n-1', {
      content: 'abc',
      updatedAt: expect.any(String),
    })
  })

  it('should cancel pending save when note is removed', async () => {
    vi.useFakeTimers()
    const store = useNoteStore()
    store.setNotes([makeNote({ id: 'n-1', content: 'edit' })])
    firestoreMocks.deleteNoteDoc.mockResolvedValue(undefined)

    store.updateNote('n-1', { content: 'changed' })
    await store.removeNote('n-1')

    vi.advanceTimersByTime(500)
    expect(firestoreMocks.updateNoteDoc).not.toHaveBeenCalled()
  })
})
