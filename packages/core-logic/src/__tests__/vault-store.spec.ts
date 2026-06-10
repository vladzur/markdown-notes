import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useVaultStore } from '../stores/vault-store'
import * as firebaseMod from '@nexus-notes/firebase'

// Mocks
vi.mock('@nexus-notes/firebase', () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}))

describe('useVaultStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start locked', () => {
    const store = useVaultStore()
    expect(store.isUnlocked).toBe(false)
    expect(store.vaultKey).toBeNull()
  })

  it('should setup vault and unlock automatically', async () => {
    const store = useVaultStore()
    // Mock user
    vi.mocked(firebaseMod.getUserProfile).mockResolvedValue(null)
    await store.loadUserProfile('user123')
    
    expect(store.isVaultConfigured).toBe(false)
    
    const result = await store.setupVault('password')
    expect(result).toBe(true)
    expect(store.isVaultConfigured).toBe(true)
    expect(store.isUnlocked).toBe(true)
    expect(firebaseMod.updateUserProfile).toHaveBeenCalledWith('user123', expect.any(Object))
  })

  it('should fail to unlock with incorrect password', async () => {
    const store = useVaultStore()
    vi.mocked(firebaseMod.getUserProfile).mockResolvedValue(null)
    await store.loadUserProfile('user123')
    
    await store.setupVault('password')
    store.lockVault()
    
    const result = await store.unlockVault('wrong-password')
    expect(result).toBe(false)
    expect(store.isUnlocked).toBe(false)
  })

  it('should lock vault and destroy key from RAM', async () => {
    const store = useVaultStore()
    await store.loadUserProfile('user123')
    await store.setupVault('password')

    expect(store.isUnlocked).toBe(true)
    store.lockVault()
    expect(store.isUnlocked).toBe(false)
    expect(store.vaultKey).toBeNull()
  })

  it('should auto-lock after inactivity timeout', async () => {
    const store = useVaultStore()
    await store.loadUserProfile('user123')
    await store.setupVault('password')

    store.setInactivityTimeout(60_000) // 1 minuto
    expect(store.isUnlocked).toBe(true)

    // Avanzar el timer
    vi.advanceTimersByTime(60_000)
    expect(store.isUnlocked).toBe(false)
    expect(store.vaultKey).toBeNull()
  })

  it('should reset inactivity timer on user interaction', async () => {
    const store = useVaultStore()
    await store.loadUserProfile('user123')
    await store.setupVault('password')

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
    await store.loadUserProfile('user123')
    await store.setupVault('password')

    store.setInactivityTimeout(0) // Sin timeout
    vi.advanceTimersByTime(3_600_000) // 1 hora
    expect(store.isUnlocked).toBe(true)
  })
})
