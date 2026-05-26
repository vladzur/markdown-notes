import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  type Auth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type UserCredential,
} from 'firebase/auth'

export { onAuthStateChanged, type User } from 'firebase/auth'
import {
  getFirestore,
  type Firestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type DocumentData,
} from 'firebase/firestore'
import type { FirebaseConfig, Folder, Note } from './types'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

/**
 * Inicializa las instancias de Firebase (App, Auth, Firestore).
 * Debe llamarse una sola vez antes de usar cualquier servicio de Firebase.
 *
 * @param config - Configuración del proyecto Firebase.
 * @param useEmulators - Si es true, conecta a los emuladores locales para desarrollo.
 */
export function initializeFirebase(config: FirebaseConfig, useEmulators = false): void {
  if (app) {
    return
  }

  app = initializeApp(config)
  auth = getAuth(app)
  db = getFirestore(app)

  if (useEmulators) {
    connectAuthEmulator(auth, 'http://localhost:9099')
    connectFirestoreEmulator(db, 'localhost', 8080)
  }
}

/**
 * Habilita la persistencia offline de Firestore usando IndexedDB.
 * Debe llamarse después de initializeFirebase y antes de cualquier query.
 */
export async function enableOfflinePersistence(): Promise<void> {
  if (!db) {
    throw new Error('Firestore no inicializado. Llama a initializeFirebase primero.')
  }
  await enableIndexedDbPersistence(db)
}

/** Retorna la instancia de Auth inicializada. */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth no inicializado. Llama a initializeFirebase primero.')
  }
  return auth
}

/** Retorna la instancia de Firestore inicializada. */
export function getFirebaseDb(): Firestore {
  if (!db) {
    throw new Error('Firestore no inicializado. Llama a initializeFirebase primero.')
  }
  return db
}

/** Retorna la instancia de Firebase App inicializada. */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error('Firebase App no inicializado. Llama a initializeFirebase primero.')
  }
  return app
}

// ---------------------------------------------------------------------------
// Helpers de autenticación
// ---------------------------------------------------------------------------

/** Registra un nuevo usuario con email y contraseña. */
export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  const auth = getFirebaseAuth()
  return createUserWithEmailAndPassword(auth, email, password)
}

/** Inicia sesión con email y contraseña. */
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  const auth = getFirebaseAuth()
  return signInWithEmailAndPassword(auth, email, password)
}

/** Inicia sesión con Google mediante ventana emergente. */
export async function signInWithGoogle(): Promise<UserCredential> {
  const auth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

/** Cierra la sesión actual. */
export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth()
  return signOut(auth)
}

// ---------------------------------------------------------------------------
// Helpers de Firestore
// ---------------------------------------------------------------------------

/** Obtiene todas las carpetas de un usuario. */
export async function getUserFolders(userId: string): Promise<Folder[]> {
  const db = getFirebaseDb()
  const q = query(collection(db, 'folders'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Folder))
}

/** Obtiene todas las notas de un usuario. */
export async function getUserNotes(userId: string): Promise<Note[]> {
  const db = getFirebaseDb()
  const q = query(collection(db, 'notes'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Note))
}

/** Crea una carpeta en Firestore y retorna el ID generado. */
export async function createFolderDoc(folder: Omit<Folder, 'id'>): Promise<string> {
  const db = getFirebaseDb()
  const docRef = await addDoc(collection(db, 'folders'), folder as DocumentData)
  return docRef.id
}

/** Crea una nota en Firestore y retorna el ID generado. */
export async function createNoteDoc(note: Omit<Note, 'id'>): Promise<string> {
  const db = getFirebaseDb()
  const docRef = await addDoc(collection(db, 'notes'), note as DocumentData)
  return docRef.id
}

/** Elimina una carpeta de Firestore. */
export async function deleteFolderDoc(folderId: string): Promise<void> {
  const db = getFirebaseDb()
  await deleteDoc(doc(db, 'folders', folderId))
}

/** Elimina una nota de Firestore. */
export async function deleteNoteDoc(noteId: string): Promise<void> {
  const db = getFirebaseDb()
  await deleteDoc(doc(db, 'notes', noteId))
}

/** Actualiza campos de una carpeta en Firestore. */
export async function updateFolderDoc(
  folderId: string,
  updates: Partial<Pick<Folder, 'name' | 'parentId'>>,
): Promise<void> {
  const db = getFirebaseDb()
  await updateDoc(doc(db, 'folders', folderId), updates as DocumentData)
}

/** Actualiza campos de una nota en Firestore. */
export async function updateNoteDoc(
  noteId: string,
  updates: Partial<Pick<Note, 'title' | 'content' | 'updatedAt'>>,
): Promise<void> {
  const db = getFirebaseDb()
  await updateDoc(doc(db, 'notes', noteId), updates as DocumentData)
}
