import { ref, computed, readonly } from 'vue'

/** Estado reactivo de autenticación. */
export function useAuth() {
  const user = ref<{ uid: string; email: string | null } | null>(null)
  const isAuthenticated = computed(() => user.value !== null)

  function setUser(newUser: { uid: string; email: string | null } | null) {
    user.value = newUser
  }

  return {
    user: readonly(user),
    isAuthenticated,
    setUser,
  }
}
