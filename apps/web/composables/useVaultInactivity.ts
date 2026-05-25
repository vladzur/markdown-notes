import { useVaultStore } from '@notes-app/core-logic'

/**
 * Composable que integra el timer de inactividad de la bóveda
 * con los eventos globales del navegador (mouse, teclado, touch).
 *
 * Debe llamarse una sola vez en el layout principal de la aplicación.
 */
export function useVaultInactivity() {
  const vaultStore = useVaultStore()

  function handleActivity() {
    if (vaultStore.isUnlocked) {
      vaultStore.resetInactivityTimer()
    }
  }

  function activate() {
    const events = ['mousemove', 'keydown', 'touchstart', 'scroll'] as const
    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true })
    }
  }

  function deactivate() {
    const events = ['mousemove', 'keydown', 'touchstart', 'scroll'] as const
    for (const event of events) {
      window.removeEventListener(event, handleActivity)
    }
    vaultStore.clearInactivityTimer()
  }

  onUnmounted(deactivate)

  return { activate, deactivate }
}
