import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { FirebaseConfig } from '../types'

const mockConfig: FirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test.appspot.com',
  messagingSenderId: '123456',
  appId: '1:123:web:abc',
}

const mockAuth = { name: 'mock-auth' }
const mockDb = { name: 'mock-firestore' }
const mockApp = { name: 'mock-app' }

// Mocks declarados con vi.hoisted para garantizar que se evalúan antes
const mocks = vi.hoisted(() => ({
  initializeApp: vi.fn(),
  getAuth: vi.fn(),
  getFirestore: vi.fn(),
  connectAuthEmulator: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
  enableIndexedDbPersistence: vi.fn(),
}))

vi.mock('firebase/app', () => ({
  initializeApp: mocks.initializeApp,
}))

vi.mock('firebase/auth', () => ({
  getAuth: mocks.getAuth,
  connectAuthEmulator: mocks.connectAuthEmulator,
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: mocks.getFirestore,
  connectFirestoreEmulator: mocks.connectFirestoreEmulator,
  enableIndexedDbPersistence: mocks.enableIndexedDbPersistence,
}))

describe('initializeFirebase', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mocks.initializeApp.mockReturnValue(mockApp)
    mocks.getAuth.mockReturnValue(mockAuth)
    mocks.getFirestore.mockReturnValue(mockDb)
  })

  it('should initialize Firebase App with provided config', async () => {
    const { initializeFirebase } = await import('../firebase')
    initializeFirebase(mockConfig)
    expect(mocks.initializeApp).toHaveBeenCalledWith(mockConfig)
  })

  it('should initialize Auth and Firestore', async () => {
    const { initializeFirebase } = await import('../firebase')
    initializeFirebase(mockConfig)
    expect(mocks.getAuth).toHaveBeenCalledTimes(1)
    expect(mocks.getFirestore).toHaveBeenCalledTimes(1)
  })

  it('should not reinitialize if already initialized', async () => {
    const { initializeFirebase } = await import('../firebase')
    initializeFirebase(mockConfig)
    initializeFirebase(mockConfig)
    expect(mocks.initializeApp).toHaveBeenCalledTimes(1)
  })

  it('should connect to emulators when useEmulators is true', async () => {
    const { initializeFirebase } = await import('../firebase')
    initializeFirebase(mockConfig, true)
    expect(mocks.connectAuthEmulator).toHaveBeenCalled()
    expect(mocks.connectFirestoreEmulator).toHaveBeenCalled()
  })

  it('should not connect to emulators when useEmulators is false', async () => {
    const { initializeFirebase } = await import('../firebase')
    initializeFirebase(mockConfig, false)
    expect(mocks.connectAuthEmulator).not.toHaveBeenCalled()
    expect(mocks.connectFirestoreEmulator).not.toHaveBeenCalled()
  })
})

describe('enableOfflinePersistence', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mocks.initializeApp.mockReturnValue(mockApp)
    mocks.getAuth.mockReturnValue(mockAuth)
    mocks.getFirestore.mockReturnValue(mockDb)
  })

  it('should throw if Firestore is not initialized', async () => {
    const { enableOfflinePersistence } = await import('../firebase')
    await expect(enableOfflinePersistence()).rejects.toThrow('Firestore no inicializado')
  })

  it('should enable IndexedDB persistence when Firestore is initialized', async () => {
    const { initializeFirebase, enableOfflinePersistence } = await import('../firebase')
    initializeFirebase(mockConfig)
    await enableOfflinePersistence()
    expect(mocks.enableIndexedDbPersistence).toHaveBeenCalled()
  })
})

describe('getters', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mocks.initializeApp.mockReturnValue(mockApp)
    mocks.getAuth.mockReturnValue(mockAuth)
    mocks.getFirestore.mockReturnValue(mockDb)
  })

  it('should throw if getters called before initialization', async () => {
    const { getFirebaseAuth, getFirebaseDb, getFirebaseApp } = await import('../firebase')
    expect(() => getFirebaseAuth()).toThrow('Firebase Auth no inicializado')
    expect(() => getFirebaseDb()).toThrow('Firestore no inicializado')
    expect(() => getFirebaseApp()).toThrow('Firebase App no inicializado')
  })

  it('should return instances after initialization', async () => {
    const { initializeFirebase, getFirebaseAuth, getFirebaseDb, getFirebaseApp } =
      await import('../firebase')
    initializeFirebase(mockConfig)
    expect(getFirebaseAuth()).toBe(mockAuth)
    expect(getFirebaseDb()).toBe(mockDb)
    expect(getFirebaseApp()).toBe(mockApp)
  })
})
