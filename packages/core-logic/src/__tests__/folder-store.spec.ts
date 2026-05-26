import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFolderStore } from '../stores/folder-store'
import type { Folder, Note } from '@notes-app/firebase'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFolder(overrides: Partial<Folder> = {}): Folder {
  return {
    id: 'f-1',
    userId: 'user-1',
    name: 'Test Folder',
    parentId: null,
    isPrivateVault: false,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

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

// ---------------------------------------------------------------------------
// Mocks de Firestore
// ---------------------------------------------------------------------------

const firestoreMocks = vi.hoisted(() => ({
  createFolderDoc: vi.fn(),
  createNoteDoc: vi.fn(),
  deleteFolderDoc: vi.fn(),
  deleteNoteDoc: vi.fn(),
  updateFolderDoc: vi.fn(),
  updateNoteDoc: vi.fn(),
}))

vi.mock('@notes-app/firebase', () => ({
  createFolderDoc: firestoreMocks.createFolderDoc,
  createNoteDoc: firestoreMocks.createNoteDoc,
  deleteFolderDoc: firestoreMocks.deleteFolderDoc,
  deleteNoteDoc: firestoreMocks.deleteNoteDoc,
  updateFolderDoc: firestoreMocks.updateFolderDoc,
  updateNoteDoc: firestoreMocks.updateNoteDoc,
}))

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('useFolderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // -----------------------------------------------------------------------
  // Estado inicial
  // -----------------------------------------------------------------------

  it('should initialize with empty state', () => {
    const store = useFolderStore()
    expect(store.folders).toEqual([])
    expect(store.notes).toEqual([])
    expect(store.currentFolderId).toBeNull()
    expect(store.tree).toEqual([])
  })

  it('should set data and build tree', () => {
    const store = useFolderStore()
    const folders = [makeFolder({ id: 'root', name: 'Root' })]
    store.setData(folders, [])
    expect(store.folders).toHaveLength(1)
    expect(store.tree).toHaveLength(1)
    expect(store.tree[0]!.folder.name).toBe('Root')
  })

  // -----------------------------------------------------------------------
  // addFolder
  // -----------------------------------------------------------------------

  it('should add a new folder (Firestore + local)', async () => {
    firestoreMocks.createFolderDoc.mockResolvedValue('firestore-id-1')
    const store = useFolderStore()

    const folder = await store.addFolder({
      userId: 'user-1',
      name: 'New Folder',
      parentId: null,
      isPrivateVault: false,
      createdAt: '2026-01-01T00:00:00Z',
    })

    expect(firestoreMocks.createFolderDoc).toHaveBeenCalledTimes(1)
    expect(folder.id).toBe('firestore-id-1')
    expect(store.folders).toHaveLength(1)
    expect(store.folders[0]!.name).toBe('New Folder')
  })

  // -----------------------------------------------------------------------
  // removeFolder
  // -----------------------------------------------------------------------

  it('should remove folder and its notes (optimistic + Firestore)', async () => {
    firestoreMocks.deleteNoteDoc.mockResolvedValue(undefined)
    firestoreMocks.deleteFolderDoc.mockResolvedValue(undefined)

    const store = useFolderStore()
    store.setData(
      [makeFolder({ id: 'to-remove' }), makeFolder({ id: 'keep', name: 'Keep' })],
      [
        makeNote({ id: 'n-in-folder', folderId: 'to-remove' }),
        makeNote({ id: 'n-other', folderId: 'keep' }),
      ],
    )

    await store.removeFolder('to-remove')

    expect(firestoreMocks.deleteNoteDoc).toHaveBeenCalledWith('n-in-folder')
    expect(firestoreMocks.deleteFolderDoc).toHaveBeenCalledWith('to-remove')
    expect(store.folders).toHaveLength(1)
    expect(store.folders[0]!.id).toBe('keep')
    expect(store.notes).toHaveLength(1)
    expect(store.notes[0]!.id).toBe('n-other')
  })

  it('should clear currentFolderId when selected folder is removed', async () => {
    firestoreMocks.deleteFolderDoc.mockResolvedValue(undefined)
    firestoreMocks.deleteNoteDoc.mockResolvedValue(undefined)

    const store = useFolderStore()
    store.setData([makeFolder({ id: 'selected' })], [])
    store.selectFolder('selected')

    await store.removeFolder('selected')
    expect(store.currentFolderId).toBeNull()
  })

  it('should rollback folder removal if Firestore fails', async () => {
    firestoreMocks.deleteNoteDoc.mockResolvedValue(undefined)
    firestoreMocks.deleteFolderDoc.mockRejectedValue(new Error('Firestore error'))

    const store = useFolderStore()
    store.setData([makeFolder({ id: 'f-1', name: 'Important' })], [])
    store.selectFolder('f-1')

    await store.removeFolder('f-1')

    // Estado restaurado tras error
    expect(store.folders).toHaveLength(1)
    expect(store.folders[0]!.name).toBe('Important')
    expect(store.currentFolderId).toBe('f-1')
  })

  // -----------------------------------------------------------------------
  // updateFolder
  // -----------------------------------------------------------------------

  it('should update folder name (optimistic + Firestore)', async () => {
    firestoreMocks.updateFolderDoc.mockResolvedValue(undefined)
    const store = useFolderStore()
    store.setData([makeFolder({ id: 'f-1', name: 'Original' })], [])

    await store.updateFolder('f-1', { name: 'Renamed' })

    expect(store.folders[0]!.name).toBe('Renamed')
    expect(firestoreMocks.updateFolderDoc).toHaveBeenCalledWith('f-1', { name: 'Renamed' })
  })

  it('should update folder parentId (move)', async () => {
    firestoreMocks.updateFolderDoc.mockResolvedValue(undefined)
    const store = useFolderStore()
    store.setData([makeFolder({ id: 'child', parentId: 'old-parent' })], [])

    await store.updateFolder('child', { parentId: 'new-parent' })

    expect(store.folders[0]!.parentId).toBe('new-parent')
    expect(firestoreMocks.updateFolderDoc).toHaveBeenCalledWith('child', { parentId: 'new-parent' })
  })

  it('should rollback folder update if Firestore fails', async () => {
    firestoreMocks.updateFolderDoc.mockRejectedValue(new Error('Firestore error'))
    const store = useFolderStore()
    store.setData([makeFolder({ id: 'f-1', name: 'Original' })], [])

    await store.updateFolder('f-1', { name: 'Renamed' })

    // Rollback: nombre restaurado
    expect(store.folders[0]!.name).toBe('Original')
  })

  it('should not update a non-existent folder', async () => {
    const store = useFolderStore()
    await store.updateFolder('missing', { name: 'Nope' })
    expect(firestoreMocks.updateFolderDoc).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // addNote
  // -----------------------------------------------------------------------

  it('should add a new note (Firestore + local)', async () => {
    firestoreMocks.createNoteDoc.mockResolvedValue('firestore-note-id')
    const store = useFolderStore()

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

  // -----------------------------------------------------------------------
  // removeNote
  // -----------------------------------------------------------------------

  it('should remove note (optimistic + Firestore)', async () => {
    firestoreMocks.deleteNoteDoc.mockResolvedValue(undefined)
    const store = useFolderStore()
    store.setData([], [makeNote({ id: 'n-1' })])

    await store.removeNote('n-1')

    expect(firestoreMocks.deleteNoteDoc).toHaveBeenCalledWith('n-1')
    expect(store.notes).toHaveLength(0)
  })

  it('should rollback note removal if Firestore fails', async () => {
    firestoreMocks.deleteNoteDoc.mockRejectedValue(new Error('Firestore error'))
    const store = useFolderStore()
    store.setData([], [makeNote({ id: 'n-1', title: 'Important' })])

    await store.removeNote('n-1')

    // Rollback
    expect(store.notes).toHaveLength(1)
    expect(store.notes[0]!.title).toBe('Important')
  })

  // -----------------------------------------------------------------------
  // updateNote (local inmediato + debounce Firestore)
  // -----------------------------------------------------------------------

  it('should update note content locally immediately', () => {
    const store = useFolderStore()
    store.setData([], [makeNote({ id: 'n-1', title: 'Old', content: 'old' })])

    store.updateNote('n-1', { title: 'New', content: 'new content' })

    expect(store.notes[0]!.title).toBe('New')
    expect(store.notes[0]!.content).toBe('new content')
    // Firestore no se llama aún (debounce)
    expect(firestoreMocks.updateNoteDoc).not.toHaveBeenCalled()
  })

  it('should debounce Firestore writes on rapid updates', async () => {
    vi.useFakeTimers()
    const store = useFolderStore()
    const note = makeNote({ id: 'n-1', title: '', content: '' })
    store.setData([], [note])

    // Simular 5 keystrokes rápidos
    store.updateNote('n-1', { content: 'a' })
    store.updateNote('n-1', { content: 'ab' })
    store.updateNote('n-1', { content: 'abc' })
    store.updateNote('n-1', { content: 'abcd' })
    store.updateNote('n-1', { content: 'abcde' })

    // Nada se ha persistido aún
    expect(firestoreMocks.updateNoteDoc).not.toHaveBeenCalled()

    // Avanzar el timer del debounce
    vi.advanceTimersByTime(500)

    // Solo una llamada a Firestore con el último valor
    expect(firestoreMocks.updateNoteDoc).toHaveBeenCalledTimes(1)
    expect(firestoreMocks.updateNoteDoc).toHaveBeenCalledWith('n-1', {
      content: 'abcde',
      updatedAt: expect.any(String),
    })
  })

  it('should cancel pending save when note is removed', async () => {
    vi.useFakeTimers()
    const store = useFolderStore()
    store.setData([], [makeNote({ id: 'n-1', content: 'edit' })])
    firestoreMocks.deleteNoteDoc.mockResolvedValue(undefined)

    store.updateNote('n-1', { content: 'changed' })
    await store.removeNote('n-1')

    // Avanzar timer: no debe llamar a updateNoteDoc porque la nota se eliminó
    vi.advanceTimersByTime(500)
    expect(firestoreMocks.updateNoteDoc).not.toHaveBeenCalled()
  })

  it('should not update a non-existent note', () => {
    const store = useFolderStore()
    store.updateNote('missing', { title: 'Nope' })
    // No lanza error, simplemente no hace nada
  })

  // -----------------------------------------------------------------------
  // currentNotes
  // -----------------------------------------------------------------------

  it('should filter current notes by selected folder', () => {
    const store = useFolderStore()
    store.setData(
      [],
      [
        makeNote({ id: 'n-1', folderId: 'f-1', title: 'Note 1' }),
        makeNote({ id: 'n-2', folderId: 'f-2', title: 'Note 2' }),
      ],
    )
    store.selectFolder('f-1')

    expect(store.currentNotes).toHaveLength(1)
    expect(store.currentNotes[0]!.id).toBe('n-1')
  })

  // -----------------------------------------------------------------------
  // isLoading
  // -----------------------------------------------------------------------

  it('should track loading state', () => {
    const store = useFolderStore()
    expect(store.isLoading).toBe(false)
    store.setLoading(true)
    expect(store.isLoading).toBe(true)
  })
})
