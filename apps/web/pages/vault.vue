<script setup lang="ts">
import { useVaultStore } from '@nexus-notes/core-logic'
import VaultGuard from '@nexus-notes/ui/src/components/VaultGuard/VaultGuard.vue'
import MarkdownEditor from '@nexus-notes/ui/src/components/MarkdownEditor/MarkdownEditor.vue'

definePageMeta({
  middleware: 'auth',
})

const vaultStore = useVaultStore()
const vaultGuardRef = ref<InstanceType<typeof VaultGuard> | null>(null)
const vaultContent = ref('')

async function handleSubmit(password: string) {
  let success = false
  if (vaultStore.isVaultConfigured) {
    success = await vaultStore.unlockVault(password)
  } else {
    success = await vaultStore.setupVault(password)
  }

  if (!success) {
    vaultGuardRef.value?.showError()
  }
}
</script>

<template>
  <div class="h-full">
    <VaultGuard
      v-if="!vaultStore.isUnlocked"
      ref="vaultGuardRef"
      :is-configured="vaultStore.isVaultConfigured"
      @submit="handleSubmit"
    />
    <div v-else class="h-full flex flex-col">
      <div class="px-4 py-3 bg-dark-surface/30 border-b border-dark-border">
        <h2 class="m-0 mb-1 text-base font-bold text-dark-text">Bóveda Desbloqueada</h2>
        <p class="m-0 text-xs text-dark-muted">Las notas cifradas se muestran aquí. El contenido se descifra solo en RAM.</p>
      </div>
      <div class="flex-1">
        <MarkdownEditor v-model="vaultContent" placeholder="Nota cifrada..." />
      </div>
    </div>
  </div>
</template>
