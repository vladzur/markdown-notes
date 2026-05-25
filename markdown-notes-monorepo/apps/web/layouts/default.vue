<script setup lang="ts">
import { useFolderStore } from '@notes-app/core-logic'
import { getUserFolders, getUserNotes } from '@notes-app/firebase'
import { useAuth, logout } from '~/composables/useAuth'
import AppHeader from '@notes-app/ui/src/components/AppHeader/AppHeader.vue'
import FolderTree from '@notes-app/ui/src/components/FolderTree/FolderTree.vue'
import ConfirmDialog from '@notes-app/ui/src/components/ConfirmDialog/ConfirmDialog.vue'

const folderStore = useFolderStore()
const { user, isAuthenticated } = useAuth()
const isSidebarOpen = ref(true)
const showConfirmDelete = ref(false)
const folderToDelete = ref<string | null>(null)

function handleSelectFolder(folderId: string) {
  folderStore.selectFolder(folderId)
  navigateTo(`/folders/${folderId}`)
}

function handleCreateFolder(parentId: string | null) {
  // TODO: implementar diálogo de creación una vez que Firebase esté conectado
  const name = window.prompt('Nombre de la carpeta:')
  if (name && name.trim()) {
    const folder = {
      userId: user?.uid ?? '',
      name: name.trim(),
      parentId,
      isPrivateVault: false,
      createdAt: new Date().toISOString(),
    }
    folderStore.addFolder({
      id: `local-${Date.now()}`,
      ...folder,
    })
    // TODO: persistir en Firestore en segundo plano
  }
}

function handleDeleteFolder(folderId: string) {
  folderToDelete.value = folderId
  showConfirmDelete.value = true
}

function confirmDelete() {
  if (folderToDelete.value) {
    folderStore.removeFolder(folderToDelete.value)
    // TODO: eliminar de Firestore en segundo plano
  }
  showConfirmDelete.value = false
  folderToDelete.value = null
}

async function handleLogout() {
  await logout()
  await navigateTo('/login')
}

// Cargar datos reales de Firestore cuando el usuario está autenticado
onMounted(async () => {
  if (isAuthenticated.value && user?.uid && folderStore.folders.length === 0) {
    try {
      const folders = await getUserFolders(user.uid)
      const notes = await getUserNotes(user.uid)
      if (folders.length > 0 || notes.length > 0) {
        folderStore.setData(folders, notes)
      }
    } catch {
      // Silencioso: la app funciona en modo local incluso sin Firestore
    }
  }
})
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
        <div class="sidebar-header">
          <span class="sidebar-title">Carpetas</span>
          <button
            class="sidebar-new-btn"
            title="Nueva carpeta"
            @click="handleCreateFolder(null)"
          >
            + Nueva
          </button>
        </div>
        <FolderTree
          :nodes="folderStore.tree"
          :current-folder-id="folderStore.currentFolderId"
          @select="handleSelectFolder"
          @create-folder="handleCreateFolder"
          @delete-folder="handleDeleteFolder"
        />
        <div class="sidebar-footer">
          <span v-if="user?.email" class="sidebar-user">{{ user.email }}</span>
          <button class="sidebar-logout-btn" @click="handleLogout">
            Salir
          </button>
        </div>
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
  display: flex;
  flex-direction: column;
}

.app-sidebar--collapsed {
  width: 0;
  border-right: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted, #888);
}

.sidebar-new-btn {
  border: 1px solid var(--color-border, #ddd);
  background: var(--color-surface, #fff);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-primary, #3b82f6);
  white-space: nowrap;
}

.sidebar-new-btn:hover {
  background: var(--color-bg, #f5f5f5);
}

.sidebar-footer {
  margin-top: auto;
  padding: 10px 16px;
  border-top: 1px solid var(--color-border, #e5e5e5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sidebar-user {
  font-size: 12px;
  color: var(--color-text-muted, #888);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-logout-btn {
  border: none;
  background: none;
  padding: 2px 6px;
  font-size: 12px;
  color: var(--color-error, #ef4444);
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
}

.sidebar-logout-btn:hover {
  background: var(--color-bg-hover, rgba(0, 0, 0, 0.05));
}

.app-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
