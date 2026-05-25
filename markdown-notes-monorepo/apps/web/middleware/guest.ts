import { useAuth } from '~/composables/useAuth'

/**
 * Middleware que redirige a /folders si el usuario ya inició sesión.
 */
export default defineNuxtRouteMiddleware(() => {
  if (process.server) return

  const { isAuthReady, isAuthenticated } = useAuth()

  if (!isAuthReady.value) return

  if (isAuthenticated.value) {
    return navigateTo('/folders')
  }
})
