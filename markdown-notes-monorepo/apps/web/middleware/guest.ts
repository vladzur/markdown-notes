/**
 * Middleware que redirige a /folders si el usuario ya inició sesión.
 */
export default defineNuxtRouteMiddleware(() => {
  // En entorno real: verificar Firebase Auth
  // const auth = getFirebaseAuth()
  // if (auth.currentUser) return navigateTo('/folders')
})
