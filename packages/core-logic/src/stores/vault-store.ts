import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { deriveKey } from '@nexus-notes/crypto'

/**
 * Store volátil para la bóveda privada.
 *
 * IMPORTANTE: Esta store NUNCA debe persistirse en localStorage, sessionStorage,
 * IndexedDB ni ningún mecanismo de persistencia de Pinia. Las claves criptográficas
 * deben residir exclusivamente en RAM y destruirse al bloquear la bóveda o cerrar la app.
 */
export const useVaultStore = defineStore('vault', () => {
  /** CryptoKey AES-GCM en RAM. null = bóveda bloqueada. */
  const vaultKey = ref<CryptoKey | null>(null)
  /** Salt del usuario almacenada junto a sus datos cifrados. */
  const vaultSalt = ref<Uint8Array | null>(null)
  /** Tiempo de inactividad en ms antes de bloquear automáticamente. 0 = sin timeout. */
  const inactivityTimeout = ref<number>(0)
  /** ID del timer de inactividad activo. */
  let inactivityTimerId: ReturnType<typeof setTimeout> | null = null

  const isUnlocked = computed(() => vaultKey.value !== null)

  /**
   * Deriva la clave desde la contraseña maestra y desbloquea la bóveda.
   * La clave resultante se almacena exclusivamente en RAM.
   */
  async function unlockVault(password: string, salt: Uint8Array): Promise<boolean> {
    try {
      const key = await deriveKey(password, salt)
      vaultKey.value = key
      vaultSalt.value = salt
      return true
    } catch {
      return false
    }
  }

  /** Bloquea la bóveda inmediatamente, destruyendo la clave de RAM. */
  function lockVault(): void {
    vaultKey.value = null
    vaultSalt.value = null
    clearInactivityTimer()
  }

  /** Reinicia el contador de inactividad. Debe llamarse en cada interacción del usuario. */
  function resetInactivityTimer(): void {
    clearInactivityTimer()
    if (inactivityTimeout.value > 0 && isUnlocked.value) {
      inactivityTimerId = setTimeout(() => {
        lockVault()
      }, inactivityTimeout.value)
    }
  }

  function setInactivityTimeout(ms: number): void {
    inactivityTimeout.value = ms
    if (isUnlocked.value) {
      resetInactivityTimer()
    }
  }

  function clearInactivityTimer(): void {
    if (inactivityTimerId !== null) {
      clearTimeout(inactivityTimerId)
      inactivityTimerId = null
    }
  }

  return {
    vaultKey,
    vaultSalt,
    isUnlocked,
    inactivityTimeout,
    unlockVault,
    lockVault,
    resetInactivityTimer,
    setInactivityTimeout,
    clearInactivityTimer,
  }
})
