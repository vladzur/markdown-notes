import type { Folder, Note } from '@notes-app/firebase'
import type { TreeNode } from './types'

/**
 * Reconstruye el árbol jerárquico de carpetas a partir de arreglos planos
 * de folders y notes en O(N). Las notas se asocian al nodo de su carpeta
 * contenedora mediante `folderId`.
 *
 * @param folders - Arreglo plano de carpetas del usuario.
 * @param notes - Arreglo plano de notas del usuario.
 * @returns Raíces del árbol de carpetas (nodos sin parentId).
 */
export function buildTree(folders: Folder[], notes: Note[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>()

  // Primer pase: crear nodos para todas las carpetas
  for (const folder of folders) {
    nodeMap.set(folder.id, { folder, children: [], notes: [] })
  }

  // Segundo pase: asociar notas a su carpeta contenedora
  for (const note of notes) {
    const node = nodeMap.get(note.folderId)
    if (node) {
      node.notes.push(note)
    }
  }

  // Tercer pase: enlazar hijos con padres
  const roots: TreeNode[] = []
  for (const folder of folders) {
    const node = nodeMap.get(folder.id)!
    if (folder.parentId && nodeMap.has(folder.parentId)) {
      nodeMap.get(folder.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
