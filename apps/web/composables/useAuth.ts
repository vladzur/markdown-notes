import { ref, computed, readonly } from 'vue'
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser,
  type User,
} from '@nexus-notes/firebase'

/** Datos mínimos del usuario en el estado reactivo. */
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

/** Estado singleton compartido entre todas las llamadas a useAuth(). */
const user = ref<AuthUser | null>(null)
const isAuthReady = ref(false)
const isAuthenticated = computed(() => user.value !== null)

/** Mapea un User de Firebase al shape local. */
function mapUser(firebaseUser: User | null): AuthUser | null {
  if (!firebaseUser) return null
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  }
}

/** Acciones de autenticación a nivel módulo (acceden al estado singleton). */
export async function loginWithEmail(email: string, password: string) {
  await signInWithEmail(email, password)
}

export async function registerWithEmail(email: string, password: string) {
  await signUpWithEmail(email, password)
}

export async function loginWithGoogle() {
  await signInWithGoogle()
}

export async function logout() {
  await signOutUser()
  user.value = null
}

/** Sincroniza el estado local con el usuario de Firebase Auth. */
export function setAuthUser(firebaseUser: User | null) {
  user.value = mapUser(firebaseUser)
  isAuthReady.value = true
}

/**
 * Composable de autenticación.
 *
 * El estado es singleton: cualquier componente que llame useAuth() comparte
 * el mismo usuario reactivo y la misma bandera isAuthReady.
 */
export function useAuth() {
  return {
    user: readonly(user),
    isAuthenticated,
    isAuthReady: readonly(isAuthReady),
  }
}
