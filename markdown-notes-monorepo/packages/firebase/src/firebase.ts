import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth'
import {
  getFirestore,
  type Firestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from 'firebase/firestore'
import type { FirebaseConfig } from './types'

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
