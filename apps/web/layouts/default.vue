<script setup lang="ts">
import { useFolderStore, useVaultStore } from '@notes-app/core-logic'
import { getUserFolders, getUserNotes } from '@notes-app/firebase'
import { useAuth, logout } from '~/composables/useAuth'
import FolderTree from '@notes-app/ui/src/components/FolderTree/FolderTree.vue'
import ConfirmDialog from '@notes-app/ui/src/components/ConfirmDialog/ConfirmDialog.vue'
import {
  IconPenNib,
  IconFolderPlus,
  IconSearch,
  IconXmark,
  IconBars,
  IconShareNodes,
  IconGear,
  IconLock,
  IconLockOpen,
  IconChevronRight,
} from '@notes-app/ui/src/icons'

const folderStore = useFolderStore()
const vaultStore = useVaultStore()
const { user, isAuthenticated } = useAuth()
const isSidebarOpen = ref(false)
const showConfirmDelete = ref(false)
const folderToDelete = ref<string | null>(null)

const route = useRoute()

// Nota seleccionada desde query param
const currentNoteId = computed(() => (route.query.note as string) || null)

// Breadcrumbs computados
const breadcrumbs = computed(() => {
  const crumbs: { id: string; name: string }[] = []
  const folderId = route.params.folderId as string | undefined
  if (folderId) {
    const folder = folderStore.folders.find(f => f.id === folderId)
    if (folder) {
      crumbs.push({ id: folder.id, name: folder.name })
    }
  }
  if (currentNoteId.value) {
    const note = folderStore.notes.find(n => n.id === currentNoteId.value)
    if (note) {
      crumbs.push({ id: note.id, name: note.title || 'Sin título' })
    }
  }
  return crumbs
})

function handleSelectFolder(folderId: string) {
  folderStore.selectFolder(folderId)
  navigateTo(`/folders/${folderId}`)
  isSidebarOpen.value = false
}

function handleSelectNote(noteId: string, folderId: string) {
  folderStore.selectFolder(folderId)
  navigateTo(`/folders/${folderId}?note=${noteId}`)
  isSidebarOpen.value = false
}

async function handleCreateFolder(parentId: string | null) {
  if (!user.value?.uid) return
  const name = window.prompt('Nombre de la carpeta:')
  if (name && name.trim()) {
    await folderStore.addFolder({
      userId: user.value.uid,
      name: name.trim(),
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

function handleVaultClick() {
  navigateTo('/vault')
}

async function handleLogout() {
  await logout()
  await navigateTo('/login')
}

onMounted(async () => {
  if (isAuthenticated.value && user?.uid && folderStore.folders.length === 0) {
    try {
      const folders = await getUserFolders(user.uid)
      const notes = await getUserNotes(user.uid)
      if (folders.length > 0 || notes.length > 0) {
        folderStore.setData(folders, notes)
      }
    } catch {
      // Silencioso
    }
  }
})
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-dark-bg text-dark-text font-sans antialiased">
    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      @click="isSidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed lg:relative z-30 h-full w-72 flex-shrink-0 bg-dark-sidebar border-r border-dark-border flex flex-col transition-transform duration-300 ease-in-out"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Sidebar Header -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-dark-border">
        <div class="flex items-center gap-2 font-semibold text-lg text-brand-500">
          <IconPenNib />
          <span>NexusNotes</span>
        </div>
        <div class="flex gap-2">
          <button
            class="text-dark-muted hover:text-white transition-colors p-1"
            title="Nueva carpeta"
            @click="handleCreateFolder(null)"
          >
            <IconFolderPlus />
          </button>
          <button class="text-dark-muted hover:text-white transition-colors p-1" title="Buscar">
            <IconSearch />
          </button>
          <button
            class="lg:hidden text-dark-muted hover:text-white transition-colors p-1 ml-2"
            @click="isSidebarOpen = false"
          >
            <IconXmark />
          </button>
        </div>
      </div>

      <!-- Sidebar Content: Folder Tree -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <FolderTree
          :nodes="folderStore.tree"
          :current-folder-id="folderStore.currentFolderId"
          :current-note-id="currentNoteId"
          @select="handleSelectFolder"
          @select-note="handleSelectNote"
          @create-folder="handleCreateFolder"
          @delete-folder="handleDeleteFolder"
        />

        <!-- Secure Area -->
        <div class="pt-4 pb-2">
          <div class="px-2 text-xs font-semibold text-dark-border uppercase tracking-wider mb-1">
            Secure Area
          </div>
          <button
            class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-dark-muted hover:bg-dark-surface hover:text-rose-400 rounded transition-colors group"
            :class="{ 'hover:text-emerald-400': vaultStore.isUnlocked }"
            @click="handleVaultClick"
          >
            <IconLockOpen
              v-if="vaultStore.isUnlocked"
              class="text-emerald-500"
            />
            <IconLock
              v-else
              class="text-rose-500 group-hover:animate-pulse"
            />
            <span class="truncate font-medium">Private Vault</span>
            <span
              v-if="vaultStore.isUnlocked"
              class="ml-auto text-[10px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30"
            >
              Unlocked
            </span>
            <span
              v-else
              class="ml-auto text-[10px] bg-dark-bg px-1.5 py-0.5 rounded border border-dark-border"
            >
              Locked
            </span>
          </button>
        </div>
      </div>

      <!-- Sidebar Footer -->
      <div class="h-14 border-t border-dark-border flex items-center px-4 justify-between bg-dark-bg/50">
        <div class="flex items-center gap-2 text-sm text-dark-muted">
          <div class="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
            {{ user?.email?.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <span class="truncate max-w-[120px]">{{ user?.email ?? 'DevUser' }}</span>
        </div>
        <button
          class="text-dark-muted hover:text-white transition-colors"
          title="Cerrar sesión"
          @click="handleLogout"
        >
          <IconGear />
        </button>
      </div>
    </aside>

    <!-- Main Area -->
    <main class="flex-1 flex flex-col relative w-full lg:w-auto min-w-0">
      <!-- Top Toolbar -->
      <header class="h-16 border-b border-dark-border flex items-center justify-between px-4 lg:px-6 bg-dark-bg shrink-0">
        <div class="flex items-center gap-4">
          <button
            class="lg:hidden p-1.5 text-dark-muted hover:text-white transition-colors rounded"
            @click="isSidebarOpen = true"
          >
            <IconBars />
          </button>
          <div class="text-sm text-dark-muted flex items-center gap-2">
            <template v-for="(crumb, i) in breadcrumbs" :key="crumb.id">
              <IconChevronRight v-if="i > 0" class="text-[10px] opacity-50" />
              <span :class="{ 'text-white font-medium': i === breadcrumbs.length - 1 }">
                {{ crumb.name }}
              </span>
            </template>
            <span v-if="breadcrumbs.length === 0" class="text-white font-medium">
              {{ folderStore.currentFolderId ? 'Notes' : 'Selecciona una carpeta' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-dark-muted bg-dark-surface px-2 py-1 rounded hidden sm:block">
            Saved locally
          </span>
          <button class="bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm shadow-brand-500/20 flex items-center gap-2">
            <IconShareNodes />
            <span class="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <slot />

      <ConfirmDialog
        :open="showConfirmDelete"
        title="Eliminar carpeta"
        message="¿Estás seguro? Las notas dentro de esta carpeta también se eliminarán."
        @confirm="confirmDelete"
        @cancel="showConfirmDelete = false"
      />
    </main>
  </div>
</template>
