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
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
}))

vi.mock('firebase/app', () => ({
  initializeApp: mocks.initializeApp,
}))

vi.mock('firebase/auth', () => ({
  getAuth: mocks.getAuth,
  connectAuthEmulator: mocks.connectAuthEmulator,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  signInWithPopup: mocks.signInWithPopup,
  signOut: mocks.signOut,
  GoogleAuthProvider: mocks.GoogleAuthProvider,
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: mocks.getFirestore,
  connectFirestoreEmulator: mocks.connectFirestoreEmulator,
  enableIndexedDbPersistence: mocks.enableIndexedDbPersistence,
  collection: mocks.collection,
  query: mocks.query,
  where: mocks.where,
  getDocs: mocks.getDocs,
  addDoc: mocks.addDoc,
  updateDoc: mocks.updateDoc,
  deleteDoc: mocks.deleteDoc,
  doc: mocks.doc,
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

describe('auth helpers', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mocks.initializeApp.mockReturnValue(mockApp)
    mocks.getAuth.mockReturnValue(mockAuth)
    mocks.getFirestore.mockReturnValue(mockDb)
  })

  it('signUpWithEmail should call createUserWithEmailAndPassword', async () => {
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: '123' } })
    const { initializeFirebase, signUpWithEmail } = await import('../firebase')
    initializeFirebase(mockConfig)
    await signUpWithEmail('a@b.com', '123456')
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'a@b.com', '123456')
  })

  it('signInWithEmail should call signInWithEmailAndPassword', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({ user: { uid: '123' } })
    const { initializeFirebase, signInWithEmail } = await import('../firebase')
    initializeFirebase(mockConfig)
    await signInWithEmail('a@b.com', '123456')
    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'a@b.com', '123456')
  })

  it('signInWithGoogle should call signInWithPopup with GoogleAuthProvider', async () => {
    const mockProvider = { name: 'google-provider' }
    mocks.GoogleAuthProvider.mockReturnValue(mockProvider)
    mocks.signInWithPopup.mockResolvedValue({ user: { uid: '456' } })
    const { initializeFirebase, signInWithGoogle } = await import('../firebase')
    initializeFirebase(mockConfig)
    await signInWithGoogle()
    expect(mocks.GoogleAuthProvider).toHaveBeenCalled()
    expect(mocks.signInWithPopup).toHaveBeenCalledWith(mockAuth, mockProvider)
  })

  it('signOutUser should call signOut', async () => {
    mocks.signOut.mockResolvedValue(undefined)
    const { initializeFirebase, signOutUser } = await import('../firebase')
    initializeFirebase(mockConfig)
    await signOutUser()
    expect(mocks.signOut).toHaveBeenCalledWith(mockAuth)
  })
})

describe('firestore helpers', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mocks.initializeApp.mockReturnValue(mockApp)
    mocks.getAuth.mockReturnValue(mockAuth)
    mocks.getFirestore.mockReturnValue(mockDb)
  })

  it('getUserFolders should query by userId', async () => {
    mocks.getDocs.mockResolvedValue({ docs: [] })
    mocks.collection.mockReturnValue('folders-collection')
    mocks.where.mockReturnValue('where-clause')
    mocks.query.mockReturnValue('query-object')
    const { initializeFirebase, getUserFolders } = await import('../firebase')
    initializeFirebase(mockConfig)
    await getUserFolders('user-1')
    expect(mocks.collection).toHaveBeenCalledWith(mockDb, 'folders')
    expect(mocks.where).toHaveBeenCalledWith('userId', '==', 'user-1')
    expect(mocks.query).toHaveBeenCalledWith('folders-collection', 'where-clause')
    expect(mocks.getDocs).toHaveBeenCalledWith('query-object')
  })

  it('getUserNotes should query by userId', async () => {
    mocks.getDocs.mockResolvedValue({ docs: [] })
    mocks.collection.mockReturnValue('notes-collection')
    mocks.where.mockReturnValue('where-clause')
    mocks.query.mockReturnValue('query-object')
    const { initializeFirebase, getUserNotes } = await import('../firebase')
    initializeFirebase(mockConfig)
    await getUserNotes('user-1')
    expect(mocks.collection).toHaveBeenCalledWith(mockDb, 'notes')
    expect(mocks.where).toHaveBeenCalledWith('userId', '==', 'user-1')
  })

  it('createFolderDoc should call addDoc and return id', async () => {
    mocks.addDoc.mockResolvedValue({ id: 'firestore-id' })
    mocks.collection.mockReturnValue('folders-collection')
    const { initializeFirebase, createFolderDoc } = await import('../firebase')
    initializeFirebase(mockConfig)
    const id = await createFolderDoc({
      userId: 'user-1',
      name: 'Test',
      parentId: null,
      isPrivateVault: false,
      createdAt: '2026-01-01',
    })
    expect(id).toBe('firestore-id')
    expect(mocks.addDoc).toHaveBeenCalledWith('folders-collection', expect.objectContaining({ name: 'Test' }))
  })

  it('deleteFolderDoc should call deleteDoc', async () => {
    mocks.doc.mockReturnValue('doc-ref')
    mocks.deleteDoc.mockResolvedValue(undefined)
    const { initializeFirebase, deleteFolderDoc } = await import('../firebase')
    initializeFirebase(mockConfig)
    await deleteFolderDoc('folder-id')
    expect(mocks.doc).toHaveBeenCalledWith(mockDb, 'folders', 'folder-id')
    expect(mocks.deleteDoc).toHaveBeenCalledWith('doc-ref')
  })

  it('deleteNoteDoc should call deleteDoc', async () => {
    mocks.doc.mockReturnValue('doc-ref')
    mocks.deleteDoc.mockResolvedValue(undefined)
    const { initializeFirebase, deleteNoteDoc } = await import('../firebase')
    initializeFirebase(mockConfig)
    await deleteNoteDoc('note-id')
    expect(mocks.doc).toHaveBeenCalledWith(mockDb, 'notes', 'note-id')
    expect(mocks.deleteDoc).toHaveBeenCalledWith('doc-ref')
  })

  it('updateFolderDoc should call updateDoc with folder data', async () => {
    mocks.doc.mockReturnValue('folder-doc-ref')
    mocks.updateDoc.mockResolvedValue(undefined)
    const { initializeFirebase, updateFolderDoc } = await import('../firebase')
    initializeFirebase(mockConfig)
    await updateFolderDoc('folder-id', { name: 'Renamed' })
    expect(mocks.doc).toHaveBeenCalledWith(mockDb, 'folders', 'folder-id')
    expect(mocks.updateDoc).toHaveBeenCalledWith('folder-doc-ref', { name: 'Renamed' })
  })

  it('updateNoteDoc should call updateDoc with note data', async () => {
    mocks.doc.mockReturnValue('note-doc-ref')
    mocks.updateDoc.mockResolvedValue(undefined)
    const { initializeFirebase, updateNoteDoc } = await import('../firebase')
    initializeFirebase(mockConfig)
    await updateNoteDoc('note-id', { title: 'New Title', content: '# Hello' })
    expect(mocks.doc).toHaveBeenCalledWith(mockDb, 'notes', 'note-id')
    expect(mocks.updateDoc).toHaveBeenCalledWith('note-doc-ref', { title: 'New Title', content: '# Hello' })
  })
})
