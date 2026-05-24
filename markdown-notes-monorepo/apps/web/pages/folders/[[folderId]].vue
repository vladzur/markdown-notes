<script setup lang="ts">
import { useFolderStore } from '@notes-app/core-logic'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const folderStore = useFolderStore()
const markdownContent = ref('')

// Sincronizar currentFolderId con la ruta
const folderId = computed(() => (route.params.folderId as string) || null)
watchEffect(() => {
  folderStore.selectFolder(folderId.value)
})

// Cargar datos mock para desarrollo local sin Firebase
onMounted(() => {
  if (folderStore.folders.length === 0) {
    folderStore.setData(
      [
        { id: 'root-1', userId: 'local', name: 'Proyectos', parentId: null, isPrivateVault: false, createdAt: new Date().toISOString() },
        { id: 'root-2', userId: 'local', name: 'Personal', parentId: null, isPrivateVault: false, createdAt: new Date().toISOString() },
        { id: 'child-1', userId: 'local', name: 'Notas Técnicas', parentId: 'root-1', isPrivateVault: false, createdAt: new Date().toISOString() },
      ],
      [
        { id: 'note-1', userId: 'local', folderId: 'root-1', title: 'Bienvenido', content: '# Bienvenido\n\nEsta es tu primera nota.', isEncrypted: false, updatedAt: new Date().toISOString() },
        { id: 'note-2', userId: 'local', folderId: 'child-1', title: 'Arquitectura', content: '## Monorepo\n\nUsamos pnpm workspaces.', isEncrypted: false, updatedAt: new Date().toISOString() },
      ],
    )
  }
})
</script>

<template>
  <NuxtLayout>
    <div class="folders-page">
      <MarkdownEditor v-if="folderStore.currentFolderId" v-model="markdownContent" />
      <div v-else class="folders-page__empty">
        <p>Selecciona una carpeta para ver sus notas</p>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.folders-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.folders-page__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #888);
  font-size: 15px;
}
</style>
