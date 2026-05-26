import { describe, it, expect } from 'vitest'
import type { Folder, Note } from '@nexus-notes/firebase'
import { buildTree } from '../tree-builder'

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

describe('buildTree', () => {
  it('should return empty array for empty input', () => {
    expect(buildTree([], [])).toEqual([])
  })

  it('should create single root node when no parentId', () => {
    const folders = [makeFolder({ id: 'root', parentId: null })]
    const tree = buildTree(folders, [])
    expect(tree).toHaveLength(1)
    expect(tree[0]!.folder.id).toBe('root')
    expect(tree[0]!.children).toHaveLength(0)
  })

  it('should nest children under parents', () => {
    const folders = [
      makeFolder({ id: 'root', parentId: null }),
      makeFolder({ id: 'child', parentId: 'root' }),
    ]
    const tree = buildTree(folders, [])
    expect(tree).toHaveLength(1)
    expect(tree[0]!.children).toHaveLength(1)
    expect(tree[0]!.children[0]!.folder.id).toBe('child')
  })

  it('should handle multi-level nesting', () => {
    const folders = [
      makeFolder({ id: 'root', parentId: null }),
      makeFolder({ id: 'l1', parentId: 'root' }),
      makeFolder({ id: 'l2', parentId: 'l1' }),
      makeFolder({ id: 'l3', parentId: 'l2' }),
    ]
    const tree = buildTree(folders, [])
    expect(tree).toHaveLength(1)
    const l1 = tree[0]!.children[0]
    expect(l1).toBeDefined()
    const l2 = l1!.children[0]
    expect(l2).toBeDefined()
    const l3 = l2!.children[0]
    expect(l3).toBeDefined()
    expect(l3!.folder.id).toBe('l3')
  })

  it('should support multiple root folders', () => {
    const folders = [
      makeFolder({ id: 'root-1', parentId: null }),
      makeFolder({ id: 'root-2', parentId: null }),
    ]
    const tree = buildTree(folders, [])
    expect(tree).toHaveLength(2)
  })

  it('should associate notes with their folder', () => {
    const folders = [makeFolder({ id: 'f-1' })]
    const notes = [
      makeNote({ id: 'n-1', folderId: 'f-1' }),
      makeNote({ id: 'n-2', folderId: 'f-1' }),
    ]
    const tree = buildTree(folders, notes)
    expect(tree[0]!.notes).toHaveLength(2)
    expect(tree[0]!.notes[0]!.id).toBe('n-1')
  })

  it('should handle notes whose folder does not exist (excluded silently)', () => {
    const folders = [makeFolder({ id: 'f-1' })]
    const notes = [makeNote({ id: 'n-orphan', folderId: 'non-existent' })]
    const tree = buildTree(folders, notes)
    expect(tree[0]!.notes).toHaveLength(0)
  })

  it('should handle folders whose parentId references non-existent folder as roots', () => {
    const folders = [makeFolder({ id: 'orphan', parentId: 'ghost' })]
    const tree = buildTree(folders, [])
    // Debe tratarse como raíz porque su parentId no existe
    expect(tree).toHaveLength(1)
    expect(tree[0]!.folder.id).toBe('orphan')
  })

  it('should preserve order of insertion', () => {
    const folders = [
      makeFolder({ id: 'a', parentId: null, name: 'Alpha' }),
      makeFolder({ id: 'b', parentId: null, name: 'Beta' }),
      makeFolder({ id: 'c', parentId: null, name: 'Gamma' }),
    ]
    const tree = buildTree(folders, [])
    expect(tree.map((n) => n.folder.name)).toEqual(['Alpha', 'Beta', 'Gamma'])
  })

  it('should handle large flat structure efficiently', () => {
    const count = 1000
    const folders: Folder[] = Array.from({ length: count }, (_, i) =>
      makeFolder({ id: `f-${i}`, parentId: i > 0 ? `f-${i - 1}` : null }),
    )
    const notes: Note[] = Array.from({ length: count }, (_, i) =>
      makeNote({ id: `n-${i}`, folderId: `f-${i}` }),
    )
    const tree = buildTree(folders, notes)
    // Debe haber una sola raíz, con profundidad count-1
    let node = tree[0]!
    let depth = 0
    while (node.children.length > 0) {
      depth++
      node = node.children[0]!
    }
    expect(depth).toBe(count - 1)
  })
})
