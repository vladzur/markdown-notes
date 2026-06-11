import type { FirebaseApp } from 'firebase/app'
import type { Auth, UserCredential } from 'firebase/auth'
import type { DocumentData, Firestore } from 'firebase/firestore'
import type { FirebaseConfig, Folder, Note, UserProfile } from './types'
import { initializeApp } from 'firebase/app'
import {

  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,

} from 'firebase/auth'
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,

  getDocs,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'

export { onAuthStateChanged, type User } from 'firebase/auth'

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

  // Usar persistentLocalCache en lugar de enableIndexedDbPersistence
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })

  if (useEmulators) {
    connectAuthEmulator(auth, 'http://localhost:9099')
    connectFirestoreEmulator(db, 'localhost', 8080)
  }
}

/**
 * @deprecated La persistencia offline ahora se inicializa automáticamente en initializeFirebase.
 */
export async function enableOfflinePersistence(): Promise<void> {
  if (!db) {
    throw new Error('Firestore no inicializado. Llama a initializeFirebase primero.')
  }
  return Promise.resolve()
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
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Folder))
}

/** Obtiene todas las notas de un usuario. */
export async function getUserNotes(userId: string): Promise<Note[]> {
  const db = getFirebaseDb()
  const q = query(collection(db, 'notes'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Note))
}

/** Obtiene el perfil del usuario (o crea uno nulo localmente si no existe en BD). */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = getFirebaseDb()
  const { getDoc, doc } = await import('firebase/firestore')
  const dbDoc = await getDoc(doc(db, 'users', userId))
  if (dbDoc.exists()) {
    return { id: dbDoc.id, ...dbDoc.data() } as UserProfile
  }
  return null
}

/** Actualiza o crea el perfil del usuario. Se guarda en el doc con ID = userId. */
export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const db = getFirebaseDb()
  const { setDoc, doc } = await import('firebase/firestore')
  await setDoc(doc(db, 'users', userId), { id: userId, ...data }, { merge: true })
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
