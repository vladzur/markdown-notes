import { initializeFirebase, enableOfflinePersistence, getFirebaseAuth, onAuthStateChanged } from '@notes-app/firebase'
import { setAuthUser } from '~/composables/useAuth'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  initializeFirebase({
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  })

  try {
    await enableOfflinePersistence()
  } catch {
    console.warn('Persistencia offline de Firestore no disponible en este entorno.')
  }

  // Sincronizar estado de autenticación de Firebase con el estado reactivo
  onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
    setAuthUser(fbUser)
  })
})
