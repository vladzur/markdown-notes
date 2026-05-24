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
    const names = wrapper.findAll('.tree-node-name')
    expect(names).toHaveLength(2)
    expect(names[0]!.text()).toBe('Proyectos')
    expect(names[1]!.text()).toBe('Personal')
  })

  it('should emit select when clicking a node', async () => {
    const nodes = [makeNode({ id: 'root-1', name: 'Proyectos' })]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: null },
    })
    await wrapper.find('.tree-node-row').trigger('click')
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
    const rows = wrapper.findAll('.tree-node-row')
    expect(rows[0]!.classes()).toContain('tree-node-row--active')
    expect(rows[1]!.classes()).not.toContain('tree-node-row--active')
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
    expect(wrapper.find('.tree-node-badge').text()).toBe('1')
  })

  it('should expand nested children by default', () => {
    const child = makeNode({ id: 'child', name: 'Hijo', parentId: 'root' })
    const nodes = [makeNode({ id: 'root', name: 'Raíz' }, [child])]
    const wrapper = mount(FolderTree, {
      props: { nodes, currentFolderId: null },
    })
    // Ambos niveles deben ser visibles
    const names = wrapper.findAll('.tree-node-name')
    expect(names).toHaveLength(2)
    expect(names[1]!.text()).toBe('Hijo')
  })
})
