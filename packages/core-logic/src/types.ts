import type { Folder, Note } from '@notes-app/firebase'

/** Nodo del árbol jerárquico de carpetas, reconstruido en cliente. */
export interface TreeNode {
  folder: Folder
  children: TreeNode[]
  notes: Note[]
}
