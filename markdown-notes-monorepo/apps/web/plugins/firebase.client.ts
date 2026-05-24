import { initializeFirebase, enableOfflinePersistence } from '@notes-app/firebase'

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
    // La persistencia offline puede fallar en navegadores que no soportan IndexedDB
    console.warn('Persistencia offline de Firestore no disponible en este entorno.')
  }
})
