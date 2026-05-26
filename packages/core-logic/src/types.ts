import type { Folder, Note } from '@nexus-notes/firebase'

/** Nodo del árbol jerárquico de carpetas, reconstruido en cliente. */
export interface TreeNode {
  folder: Folder
  children: TreeNode[]
  notes: Note[]
}
