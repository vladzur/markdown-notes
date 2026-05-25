<script setup lang="ts">
import type { TreeNode } from '@notes-app/core-logic'
import { ref } from 'vue'
import { IconChevronRight, IconFolder, IconMarkdown } from '../../icons'

const props = defineProps<{
  node: TreeNode
  currentFolderId: string | null
  currentNoteId?: string | null
  depth: number
}>()

const emit = defineEmits<{
  select: [folderId: string]
  selectNote: [noteId: string, folderId: string]
  createFolder: [parentId: string | null]
  renameFolder: [folderId: string, currentName: string]
  deleteFolder: [folderId: string]
}>()

const isExpanded = ref(true)

function handleClick() {
  emit('select', props.node.folder.id)
}

function handleNoteClick(noteId: string) {
  emit('selectNote', noteId, props.node.folder.id)
}
</script>

<template>
  <li>
    <!-- Fila de carpeta -->
    <div
      data-testid="folder-row"
      class="flex items-center gap-1 py-1.5 pr-2 rounded cursor-pointer select-none transition-colors hover:bg-dark-surface/50"
      :class="{ 'bg-brand-500/10 text-dark-text font-semibold': node.folder.id === currentFolderId }"
      :style="{ paddingLeft: `${depth * 20 + 8}px` }"
      @click="handleClick"
      @contextmenu.prevent="emit('createFolder', node.folder.id)"
    >
      <button
        v-if="node.children.length > 0 || node.notes.length > 0"
        data-testid="expand-toggle"
        class="border-none bg-transparent cursor-pointer text-xs w-5 h-5 text-center p-0 text-dark-muted flex-shrink-0 flex items-center justify-center"
        @click.stop="isExpanded = !isExpanded"
      >
        <IconChevronRight
          class="transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
        />
      </button>
      <span v-else class="inline-block w-5 flex-shrink-0" />

      <IconFolder class="text-brand-500 flex-shrink-0" />

      <span
        data-testid="folder-name"
        class="flex-1 truncate text-sm text-dark-text"
      >{{ node.folder.name }}</span>

      <span
        v-if="node.notes.length > 0"
        data-testid="note-count"
        class="text-[11px] text-dark-muted bg-dark-bg px-1.5 py-0 rounded-full min-w-[18px] text-center leading-[18px]"
      >
        {{ node.notes.length }}
      </span>
    </div>

    <!-- Hijos expandidos: subcarpetas + notas -->
    <template v-if="isExpanded">
      <!-- Subcarpetas -->
      <ul v-if="node.children.length > 0" class="list-none m-0 p-0">
        <FolderTreeNode
          v-for="child in node.children"
          :key="child.folder.id"
          :node="child"
          :current-folder-id="currentFolderId"
          :current-note-id="currentNoteId"
          :depth="depth + 1"
          @select="emit('select', $event)"
          @select-note="emit('selectNote', $event[0], $event[1])"
          @create-folder="emit('createFolder', $event)"
          @rename-folder="emit('renameFolder', $event[0], $event[1])"
          @delete-folder="emit('deleteFolder', $event)"
        />
      </ul>

      <!-- Notas dentro de esta carpeta -->
      <ul v-if="node.notes.length > 0" class="list-none m-0 p-0">
        <li
          v-for="note in node.notes"
          :key="note.id"
          data-testid="note-row"
          class="flex items-center gap-2 py-1.5 pr-2 rounded cursor-pointer select-none transition-colors hover:bg-dark-surface/50 text-dark-muted hover:text-dark-text"
          :class="{ 'bg-brand-500/10 text-dark-text font-medium': note.id === currentNoteId }"
          :style="{ paddingLeft: `${(depth + 1) * 20 + 8}px` }"
          @click.stop="handleNoteClick(note.id)"
        >
          <span class="inline-block w-5 flex-shrink-0" />
          <IconMarkdown class="text-xs opacity-50 flex-shrink-0" />
          <span
            data-testid="note-title"
            class="flex-1 truncate text-sm"
          >{{ note.title || 'Sin título' }}</span>
        </li>
      </ul>
    </template>
  </li>
</template>
