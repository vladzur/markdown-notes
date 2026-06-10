import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { deriveKey, generateSalt, generateValidationHash, toBase64, fromBase64 } from '@nexus-notes/crypto'
import { getUserProfile, updateUserProfile } from '@nexus-notes/firebase'

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
  /** Salt del usuario cargada desde Firebase. */
  const vaultSalt = ref<Uint8Array | null>(null)
  
  /** Tiempo de inactividad en ms antes de bloquear automáticamente. Por defecto 5 mins. */
  const inactivityTimeout = ref<number>(300_000)
  /** ID del timer de inactividad activo. */
  let inactivityTimerId: ReturnType<typeof setTimeout> | null = null

  const isVaultConfigured = ref(false)
  const isLoaded = ref(false)
  const validationHashCache = ref<string | null>(null)
  const currentUserId = ref<string | null>(null)

  const isUnlocked = computed(() => vaultKey.value !== null)

  /** 
   * Carga la configuración inicial de la bóveda desde el perfil del usuario.
   */
  async function loadUserProfile(userId: string): Promise<void> {
    currentUserId.value = userId
    const profile = await getUserProfile(userId)
    if (profile && profile.vaultSalt && profile.vaultValidationHash) {
      isVaultConfigured.value = true
      vaultSalt.value = fromBase64(profile.vaultSalt)
      validationHashCache.value = profile.vaultValidationHash
    } else {
      isVaultConfigured.value = false
    }
    isLoaded.value = true
  }

  /**
   * Configura la bóveda por primera vez: genera la salt, valida el hash y guarda en Firestore.
   */
  async function setupVault(password: string): Promise<boolean> {
    if (!currentUserId.value) throw new Error('User not loaded in vault store')
    const salt = generateSalt()
    const validationHash = await generateValidationHash(password, salt)
    
    await updateUserProfile(currentUserId.value, {
      vaultSalt: toBase64(salt),
      vaultValidationHash: validationHash
    })

    isVaultConfigured.value = true
    vaultSalt.value = salt
    validationHashCache.value = validationHash
    
    // Auto-desbloquear tras configurarlo
    return await unlockVault(password)
  }

  /**
   * Deriva la clave desde la contraseña maestra y la verifica contra el hash guardado.
   * Si es correcta, la clave AES-GCM se almacena en RAM.
   */
  async function unlockVault(password: string): Promise<boolean> {
    if (!isVaultConfigured.value || !vaultSalt.value || !validationHashCache.value) {
      return false
    }

    try {
      // 1. Validar contraseña
      const hashToTest = await generateValidationHash(password, vaultSalt.value)
      if (hashToTest !== validationHashCache.value) {
        return false // Contraseña incorrecta
      }

      // 2. Derivar clave maestra
      const key = await deriveKey(password, vaultSalt.value)
      vaultKey.value = key
      resetInactivityTimer()
      return true
    } catch {
      return false
    }
  }

  /** Bloquea la bóveda inmediatamente, destruyendo la clave de RAM. */
  function lockVault(): void {
    vaultKey.value = null
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
    isVaultConfigured,
    isLoaded,
    inactivityTimeout,
    loadUserProfile,
    setupVault,
    unlockVault,
    lockVault,
    resetInactivityTimer,
    setInactivityTimeout,
    clearInactivityTimer,
  }
})
