import { useAuth } from '~/composables/useAuth'

/**
 * Middleware que redirige a /login si el usuario no está autenticado.
 */
export default defineNuxtRouteMiddleware(() => {
  if (process.server) return

  const { isAuthReady, isAuthenticated } = useAuth()

  // Esperar a que Firebase resuelva el estado de autenticación
  if (!isAuthReady.value) return

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
