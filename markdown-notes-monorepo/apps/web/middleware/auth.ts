/**
 * Middleware que redirige a /login si el usuario no está autenticado.
 */
export default defineNuxtRouteMiddleware(() => {
  // En entorno real: verificar Firebase Auth
  // const auth = getFirebaseAuth()
  // if (!auth.currentUser) return navigateTo('/login')

  // Modo desarrollo: sin autenticación requerida por ahora
})
