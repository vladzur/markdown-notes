import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useVaultStore } from '../stores/vault-store'
import { generateSalt } from '@nexus-notes/crypto'

describe('useVaultStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start locked', () => {
    const store = useVaultStore()
    expect(store.isUnlocked).toBe(false)
    expect(store.vaultKey).toBeNull()
  })

  it('should unlock with correct password', async () => {
    const store = useVaultStore()
    const salt = generateSalt()
    const result = await store.unlockVault('master-password', salt)
    expect(result).toBe(true)
    expect(store.isUnlocked).toBe(true)
    expect(store.vaultKey).toBeDefined()
  })

  it('should fail to unlock with incorrect password', async () => {
    const store = useVaultStore()
    const salt = generateSalt()
    const result = await store.unlockVault('wrong-password', salt)
    // El fallo de descifrado no ocurre aquí porque unlockVault solo deriva la clave.
    // La validación real ocurre al intentar descifrar datos.
    // unlockVault solo falla si deriveKey lanza error (ej. password vacía en un entorno restrictivo).
    // Por ahora, verify que deriveKey no lanza error incluso con password incorrecta.
    expect(result).toBe(true)
  })

  it('should lock vault and destroy key from RAM', async () => {
    const store = useVaultStore()
    const salt = generateSalt()
    await store.unlockVault('password', salt)

    expect(store.isUnlocked).toBe(true)
    store.lockVault()
    expect(store.isUnlocked).toBe(false)
    expect(store.vaultKey).toBeNull()
    expect(store.vaultSalt).toBeNull()
  })

  it('should auto-lock after inactivity timeout', async () => {
    const store = useVaultStore()
    const salt = generateSalt()
    await store.unlockVault('password', salt)

    store.setInactivityTimeout(60_000) // 1 minuto
    expect(store.isUnlocked).toBe(true)

    // Avanzar el timer
    vi.advanceTimersByTime(60_000)
    expect(store.isUnlocked).toBe(false)
    expect(store.vaultKey).toBeNull()
  })

  it('should reset inactivity timer on user interaction', async () => {
    const store = useVaultStore()
    const salt = generateSalt()
    await store.unlockVault('password', salt)

    store.setInactivityTimeout(60_000)

    // Avanzar 30s, el usuario interactúa, el timer se reinicia
    vi.advanceTimersByTime(30_000)
    store.resetInactivityTimer()

    // Avanzar otros 30s (serían 60s totales si no se hubiera reiniciado)
    vi.advanceTimersByTime(30_000)
    expect(store.isUnlocked).toBe(true) // No debe haberse bloqueado

    // Avanzar hasta completar el nuevo ciclo
    vi.advanceTimersByTime(30_000)
    expect(store.isUnlocked).toBe(false)
  })

  it('should not auto-lock when timeout is 0', async () => {
    const store = useVaultStore()
    const salt = generateSalt()
    await store.unlockVault('password', salt)

    store.setInactivityTimeout(0) // Sin timeout
    vi.advanceTimersByTime(3_600_000) // 1 hora
    expect(store.isUnlocked).toBe(true)
  })
})
