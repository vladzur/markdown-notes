<script setup lang="ts">
import { useVaultStore } from '@notes-app/core-logic'
import { generateSalt } from '@notes-app/crypto'

definePageMeta({
  middleware: 'auth',
})

const vaultStore = useVaultStore()
const vaultGuardRef = ref<InstanceType<typeof import('@notes-app/ui').VaultGuard> | null>(null)

async function handleUnlock(password: string) {
  // En entorno real: la salt se obtiene del perfil del usuario en Firestore
  const salt = generateSalt()
  const success = await vaultStore.unlockVault(password, salt)

  if (!success) {
    vaultGuardRef.value?.showError()
  }
}
</script>

<template>
  <NuxtLayout>
    <VaultGuard
      v-if="!vaultStore.isUnlocked"
      ref="vaultGuardRef"
      @unlock="handleUnlock"
    />
    <div v-else class="vault-content">
      <div class="vault-content__header">
        <h2>Bóveda Desbloqueada</h2>
        <p>Las notas cifradas se muestran aquí. El contenido se descifra solo en RAM.</p>
      </div>
      <MarkdownEditor v-model="''" placeholder="Nota cifrada..." />
    </div>
  </NuxtLayout>
</template>

<style scoped>
.vault-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.vault-content__header {
  padding: 12px 16px;
  background: var(--color-bg-muted, #f0f0f0);
  border-bottom: 1px solid var(--color-border, #e5e5e5);
}

.vault-content__header h2 {
  margin: 0 0 4px;
  font-size: 16px;
}

.vault-content__header p {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted, #888);
}
</style>
