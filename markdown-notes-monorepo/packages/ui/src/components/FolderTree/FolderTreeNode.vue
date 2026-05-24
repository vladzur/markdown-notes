<script setup lang="ts">
import type { TreeNode } from '@notes-app/core-logic'
import { ref } from 'vue'

const props = defineProps<{
  node: TreeNode
  currentFolderId: string | null
  depth: number
}>()

const emit = defineEmits<{
  select: [folderId: string]
  createFolder: [parentId: string | null]
  renameFolder: [folderId: string, currentName: string]
  deleteFolder: [folderId: string]
}>()

const isExpanded = ref(true)

function handleClick() {
  emit('select', props.node.folder.id)
}

function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
}
</script>

<template>
  <li class="tree-node">
    <div
      class="tree-node-row"
      :class="{ 'tree-node-row--active': node.folder.id === currentFolderId }"
      :style="{ paddingLeft: `${depth * 20 + 8}px` }"
      @click="handleClick"
      @contextmenu.prevent="emit('createFolder', node.folder.id)"
    >
      <button
        v-if="node.children.length > 0"
        class="tree-toggle"
        @click.stop="isExpanded = !isExpanded"
      >
        {{ isExpanded ? '▾' : '▸' }}
      </button>
      <span v-else class="tree-toggle tree-toggle--spacer"></span>

      <span class="tree-node-name">{{ node.folder.name }}</span>

      <span v-if="node.notes.length > 0" class="tree-node-badge">
        {{ node.notes.length }}
      </span>
    </div>

    <ul v-if="isExpanded && node.children.length > 0" class="tree-children">
      <FolderTreeNode
        v-for="child in node.children"
        :key="child.folder.id"
        :node="child"
        :current-folder-id="currentFolderId"
        :depth="depth + 1"
        @select="emit('select', $event)"
        @create-folder="emit('createFolder', $event)"
        @rename-folder="emit('renameFolder', $event[0], $event[1])"
        @delete-folder="emit('deleteFolder', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.tree-node {
  list-style: none;
}

.tree-node-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px 6px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.15s;
  user-select: none;
}

.tree-node-row:hover {
  background-color: var(--color-bg-hover, rgba(0, 0, 0, 0.05));
}

.tree-node-row--active {
  background-color: var(--color-bg-active, rgba(59, 130, 246, 0.15));
  font-weight: 600;
}

.tree-toggle {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 12px;
  width: 20px;
  height: 20px;
  text-align: center;
  padding: 0;
  color: inherit;
  flex-shrink: 0;
}

.tree-toggle--spacer {
  display: inline-block;
  width: 20px;
  flex-shrink: 0;
}

.tree-node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.tree-node-badge {
  font-size: 11px;
  color: var(--color-text-muted, #888);
  min-width: 18px;
  text-align: center;
  background: var(--color-bg-muted, #eee);
  border-radius: 10px;
  padding: 0 6px;
  line-height: 18px;
}

.tree-children {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
