import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import FolderTree from '../components/FolderTree/FolderTree.vue'
import type { TreeNode } from '@notes-app/core-logic'

function makeNode(overrides: Partial<TreeNode['folder']> = {}, children: TreeNode[] = [], notes: TreeNode['notes'] = []): TreeNode {
  return {
    folder: {
      id: 'f-1',
      userId: 'user-1',
      name: 'Test Folder',
      parentId: null,
      isPrivateVault: false,
      createdAt: '2026-01-01T00:00:00Z',
      ...overrides,
    },
    children,
    notes,
  }
}

describe('FolderTree', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render root nodes', () => {
    const nodes = [
      makeNode({ id: 'root-1', name: 'Proyectos' }),
      makeNode({ id: 'root-2', name: 'Personal' }),
    ]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: null },
    })
    const names = wrapper.findAll('[data-testid="folder-name"]')
    expect(names).toHaveLength(2)
    expect(names[0]!.text()).toBe('Proyectos')
    expect(names[1]!.text()).toBe('Personal')
  })

  it('should emit select when clicking a node', async () => {
    const nodes = [makeNode({ id: 'root-1', name: 'Proyectos' })]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: null },
    })
    await wrapper.find('[data-testid="folder-row"]').trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual(['root-1'])
  })

  it('should mark current folder as active', () => {
    const nodes = [
      makeNode({ id: 'active', name: 'Activo' }),
      makeNode({ id: 'other', name: 'Otro' }),
    ]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: 'active' },
    })
    const rows = wrapper.findAll('[data-testid="folder-row"]')
    expect(rows[0]!.classes()).toContain('bg-brand-500/10')
    expect(rows[1]!.classes()).not.toContain('bg-brand-500/10')
  })

  it('should show note count badge', () => {
    const nodes = [
      makeNode(
        { id: 'f-1', name: 'Con Notas' },
        [],
        [
          { id: 'n-1', userId: 'u1', folderId: 'f-1', title: 'N1', content: '', isEncrypted: false, updatedAt: '' },
        ],
      ),
    ]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: null },
    })
    expect(wrapper.find('[data-testid="note-count"]').text()).toBe('1')
  })

  it('should expand nested children by default', () => {
    const child = makeNode({ id: 'child', name: 'Hijo', parentId: 'root' })
    const nodes = [makeNode({ id: 'root', name: 'Raíz' }, [child])]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: null },
    })
    const names = wrapper.findAll('[data-testid="folder-name"]')
    expect(names).toHaveLength(2)
    expect(names[1]!.text()).toBe('Hijo')
  })

  it('should render notes as children inside a folder', () => {
    const nodes = [
      makeNode(
        { id: 'f-1', name: 'Proyectos' },
        [],
        [
          { id: 'n-1', userId: 'u1', folderId: 'f-1', title: 'Nota importante', content: '# Hola', isEncrypted: false, updatedAt: '2026-01-01' },
          { id: 'n-2', userId: 'u1', folderId: 'f-1', title: 'Otra nota', content: '', isEncrypted: false, updatedAt: '2026-01-02' },
        ],
      ),
    ]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: 'f-1' },
    })
    const noteTitles = wrapper.findAll('[data-testid="note-title"]')
    expect(noteTitles).toHaveLength(2)
    expect(noteTitles[0]!.text()).toBe('Nota importante')
    expect(noteTitles[1]!.text()).toBe('Otra nota')
  })

  it('should emit selectNote when clicking a note', async () => {
    const nodes = [
      makeNode(
        { id: 'f-1', name: 'Proyectos' },
        [],
        [
          { id: 'n-1', userId: 'u1', folderId: 'f-1', title: 'Mi nota', content: '', isEncrypted: false, updatedAt: '' },
        ],
      ),
    ]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: 'f-1' },
    })
    await wrapper.find('[data-testid="note-row"]').trigger('click')
    expect(wrapper.emitted('selectNote')).toBeTruthy()
    expect(wrapper.emitted('selectNote')![0]).toEqual(['n-1', 'f-1'])
  })

  it('should mark current note as active', () => {
    const nodes = [
      makeNode(
        { id: 'f-1', name: 'Proyectos' },
        [],
        [
          { id: 'n-1', userId: 'u1', folderId: 'f-1', title: 'Activa', content: '', isEncrypted: false, updatedAt: '' },
          { id: 'n-2', userId: 'u1', folderId: 'f-1', title: 'Inactiva', content: '', isEncrypted: false, updatedAt: '' },
        ],
      ),
    ]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: 'f-1', currentNoteId: 'n-1' },
    })
    const rows = wrapper.findAll('[data-testid="note-row"]')
    expect(rows[0]!.classes()).toContain('bg-brand-500/10')
    expect(rows[1]!.classes()).not.toContain('bg-brand-500/10')
  })
})
