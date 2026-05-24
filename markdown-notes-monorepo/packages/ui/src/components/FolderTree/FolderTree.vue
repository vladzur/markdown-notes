<script setup lang="ts">
import type { TreeNode } from '@notes-app/core-logic'
import FolderTreeNode from './FolderTreeNode.vue'

defineProps<{
  nodes: TreeNode[]
  currentFolderId: string | null
}>()

const emit = defineEmits<{
  select: [folderId: string]
  createFolder: [parentId: string | null]
  renameFolder: [folderId: string, currentName: string]
  deleteFolder: [folderId: string]
}>()
</script>

<template>
  <nav class="folder-tree">
    <ul class="tree-list">
      <FolderTreeNode
        v-for="node in nodes"
        :key="node.folder.id"
        :node="node"
        :current-folder-id="currentFolderId"
        :depth="0"
        @select="(id: string) => emit('select', id)"
        @create-folder="(parentId: string | null) => emit('createFolder', parentId)"
        @rename-folder="(id: string, name: string) => emit('renameFolder', id, name)"
        @delete-folder="(id: string) => emit('deleteFolder', id)"
      />
    </ul>
  </nav>
</template>

<style scoped>
.folder-tree {
  height: 100%;
  overflow-y: auto;
  padding: 4px 0;
}

.tree-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
