import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFolderStore } from '../stores/folder-store'
import { useNoteStore } from '../stores/note-store'
import type { Folder, Note } from '@nexus-notes/firebase'

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

const firestoreMocks = vi.hoisted(() => ({
  createFolderDoc: vi.fn(),
  deleteFolderDoc: vi.fn(),
  updateFolderDoc: vi.fn(),
  deleteNoteDoc: vi.fn(),
}))

vi.mock('@nexus-notes/firebase', () => ({
  createFolderDoc: firestoreMocks.createFolderDoc,
  deleteFolderDoc: firestoreMocks.deleteFolderDoc,
  updateFolderDoc: firestoreMocks.updateFolderDoc,
  deleteNoteDoc: firestoreMocks.deleteNoteDoc,
}))

describe('useFolderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with empty state', () => {
    const store = useFolderStore()
    expect(store.folders).toEqual([])
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

  it('should remove folder and its notes (optimistic + Firestore)', async () => {
    firestoreMocks.deleteFolderDoc.mockResolvedValue(undefined)
    firestoreMocks.deleteNoteDoc.mockResolvedValue(undefined)

    const store = useFolderStore()
    const noteStore = useNoteStore()
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
    expect(noteStore.notes).toHaveLength(1)
    expect(noteStore.notes[0]!.id).toBe('n-other')
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

  it('should update folder name (optimistic + Firestore)', async () => {
    firestoreMocks.updateFolderDoc.mockResolvedValue(undefined)
    const store = useFolderStore()
    store.setData([makeFolder({ id: 'f-1', name: 'Original' })], [])

    await store.updateFolder('f-1', { name: 'Renamed' })

    expect(store.folders[0]!.name).toBe('Renamed')
    expect(firestoreMocks.updateFolderDoc).toHaveBeenCalledWith('f-1', { name: 'Renamed' })
  })

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

  it('should track loading state', () => {
    const store = useFolderStore()
    expect(store.isLoading).toBe(false)
    store.setLoading(true)
    expect(store.isLoading).toBe(true)
  })
})
