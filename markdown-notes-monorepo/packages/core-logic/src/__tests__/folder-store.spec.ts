import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFolderStore } from '../stores/folder-store'
import type { Folder, Note } from '@notes-app/firebase'

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

describe('useFolderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

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

  it('should add a new folder', () => {
    const store = useFolderStore()
    store.addFolder(makeFolder({ id: 'new', name: 'New Folder' }))
    expect(store.folders).toHaveLength(1)
    expect(store.folders[0]!.name).toBe('New Folder')
  })

  it('should remove folder and its notes', () => {
    const store = useFolderStore()
    store.addFolder(makeFolder({ id: 'to-remove' }))
    store.addNote(makeNote({ id: 'n-in-folder', folderId: 'to-remove' }))
    store.addNote(makeNote({ id: 'n-other', folderId: 'other' }))

    store.removeFolder('to-remove')
    expect(store.folders).toHaveLength(0)
    // La nota huérfana de otra carpeta se conserva
    expect(store.notes).toHaveLength(1)
    expect(store.notes[0]!.id).toBe('n-other')
  })

  it('should clear currentFolderId when selected folder is removed', () => {
    const store = useFolderStore()
    store.addFolder(makeFolder({ id: 'selected' }))
    store.selectFolder('selected')
    expect(store.currentFolderId).toBe('selected')

    store.removeFolder('selected')
    expect(store.currentFolderId).toBeNull()
  })

  it('should update folder name', () => {
    const store = useFolderStore()
    store.addFolder(makeFolder({ id: 'f-1', name: 'Original' }))
    store.updateFolder('f-1', { name: 'Renamed' })
    expect(store.folders[0]!.name).toBe('Renamed')
  })

  it('should update folder parentId (move)', () => {
    const store = useFolderStore()
    store.addFolder(makeFolder({ id: 'child', parentId: 'old-parent' }))
    store.updateFolder('child', { parentId: 'new-parent' })
    expect(store.folders[0]!.parentId).toBe('new-parent')
  })

  it('should add and remove notes', () => {
    const store = useFolderStore()
    store.addNote(makeNote({ id: 'n-1' }))
    expect(store.notes).toHaveLength(1)

    store.removeNote('n-1')
    expect(store.notes).toHaveLength(0)
  })

  it('should update note content', () => {
    const store = useFolderStore()
    store.addNote(makeNote({ id: 'n-1', title: 'Old', content: 'old' }))
    store.updateNote('n-1', { title: 'New', content: 'new content' })
    expect(store.notes[0]!.title).toBe('New')
    expect(store.notes[0]!.content).toBe('new content')
  })

  it('should filter current notes by selected folder', () => {
    const store = useFolderStore()
    store.addNote(makeNote({ id: 'n-1', folderId: 'f-1', title: 'Note 1' }))
    store.addNote(makeNote({ id: 'n-2', folderId: 'f-2', title: 'Note 2' }))
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
