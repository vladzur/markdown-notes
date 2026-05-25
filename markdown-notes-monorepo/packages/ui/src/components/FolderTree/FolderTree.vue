<script setup lang="ts">
import type { TreeNode } from '@notes-app/core-logic'
import FolderTreeNode from './FolderTreeNode.vue'

defineProps<{
  nodes: TreeNode[]
  currentFolderId: string | null
  currentNoteId?: string | null
}>()

const emit = defineEmits<{
  select: [folderId: string]
  selectNote: [noteId: string, folderId: string]
  createFolder: [parentId: string | null]
  renameFolder: [folderId: string, currentName: string]
  deleteFolder: [folderId: string]
}>()
</script>

<template>
  <nav class="h-full overflow-y-auto py-1">
    <ul class="list-none m-0 p-0">
      <FolderTreeNode
        v-for="node in nodes"
        :key="node.folder.id"
        :node="node"
        :current-folder-id="currentFolderId"
        :current-note-id="currentNoteId"
        :depth="0"
        @select="(id: string) => emit('select', id)"
        @select-note="(noteId: string, folderId: string) => emit('selectNote', noteId, folderId)"
        @create-folder="(parentId: string | null) => emit('createFolder', parentId)"
        @rename-folder="(id: string, name: string) => emit('renameFolder', id, name)"
        @delete-folder="(id: string) => emit('deleteFolder', id)"
      />
    </ul>
  </nav>
</template>
