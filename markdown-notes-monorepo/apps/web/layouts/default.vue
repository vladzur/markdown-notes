<script setup lang="ts">
import { useFolderStore } from '@notes-app/core-logic'

const folderStore = useFolderStore()
const isSidebarOpen = ref(true)
const showConfirmDelete = ref(false)
const folderToDelete = ref<string | null>(null)

function handleSelectFolder(folderId: string) {
  folderStore.selectFolder(folderId)
}

function handleCreateFolder(parentId: string | null) {
  // TODO: implementar diálogo de creación una vez que Firebase esté conectado
  const name = window.prompt('Nombre de la carpeta:')
  if (name) {
    folderStore.addFolder({
      id: `local-${Date.now()}`,
      userId: '',
      name,
      parentId,
      isPrivateVault: false,
      createdAt: new Date().toISOString(),
    })
  }
}

function handleDeleteFolder(folderId: string) {
  folderToDelete.value = folderId
  showConfirmDelete.value = true
}

function confirmDelete() {
  if (folderToDelete.value) {
    folderStore.removeFolder(folderToDelete.value)
  }
  showConfirmDelete.value = false
  folderToDelete.value = null
}
</script>

<template>
  <div class="app-layout">
    <AppHeader
      :is-vault-unlocked="false"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      @toggle-vault="navigateTo('/vault')"
    />

    <div class="app-body">
      <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': !isSidebarOpen }">
        <FolderTree
          :nodes="folderStore.tree"
          :current-folder-id="folderStore.currentFolderId"
          @select="handleSelectFolder"
          @create-folder="handleCreateFolder"
          @delete-folder="handleDeleteFolder"
        />
      </aside>

      <main class="app-main">
        <slot />
      </main>
    </div>

    <ConfirmDialog
      :open="showConfirmDelete"
      title="Eliminar carpeta"
      message="¿Estás seguro? Las notas dentro de esta carpeta también se eliminarán."
      @confirm="confirmDelete"
      @cancel="showConfirmDelete = false"
    />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-sidebar {
  width: 260px;
  min-width: 0;
  border-right: 1px solid var(--color-border, #e5e5e5);
  background: var(--color-surface, #ffffff);
  transition: width 0.2s ease;
  overflow: hidden;
}

.app-sidebar--collapsed {
  width: 0;
  border-right: none;
}

.app-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
