<script setup lang="ts">
import { loginWithEmail, registerWithEmail, loginWithGoogle, useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'guest',
  layout: 'auth',
})

const { isAuthReady } = useAuth()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const isLogin = computed(() => mode.value === 'login')

async function handleSubmit() {
  isLoading.value = true
  error.value = ''
  try {
    if (isLogin.value) {
      await loginWithEmail(email.value, password.value)
    } else {
      await registerWithEmail(email.value, password.value)
    }
    await navigateTo('/folders')
  } catch (err: any) {
    error.value = mapAuthError(err.code)
  } finally {
    isLoading.value = false
  }
}

async function handleGoogleLogin() {
  isLoading.value = true
  error.value = ''
  try {
    await loginWithGoogle()
    await navigateTo('/folders')
  } catch (err: any) {
    error.value = mapAuthError(err.code)
  } finally {
    isLoading.value = false
  }
}

/** Traduce códigos de error de Firebase Auth a mensajes en español. */
function mapAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found': 'No existe una cuenta con este correo.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/invalid-credential': 'Credenciales inválidas.',
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email': 'El formato del correo no es válido.',
    'auth/popup-closed-by-user': 'Ventana de inicio de sesión cerrada.',
    'auth/cancelled-popup-request': 'Solicitud cancelada.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana emergente.',
    'auth/network-request-failed': 'Error de conexión. Revisa tu red.',
  }
  return map[code] || 'Ocurrió un error inesperado. Intenta de nuevo.'
}
</script>

<template>
  <div class="bg-dark-sidebar border border-dark-border rounded-xl shadow-2xl p-10 max-w-sm w-full text-center">
    <h1 class="text-3xl font-extrabold text-white mb-1">Notes</h1>
    <p class="text-sm text-dark-muted mb-7">Gestión de notas Markdown cifradas</p>

    <!-- Spinner mientras se resuelve la sesión persistida -->
    <div v-if="!isAuthReady" class="text-dark-muted text-sm py-5">Verificando sesión...</div>

    <template v-else>
      <form class="flex flex-col gap-3" @submit.prevent="handleSubmit">
        <input
          v-model="email"
          type="email"
          class="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-dark-border"
          placeholder="Correo electrónico"
          required
          autocomplete="email"
        />
        <input
          v-model="password"
          type="password"
          class="w-full bg-dark-bg border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-dark-border"
          placeholder="Contraseña"
          required
          autocomplete="current-password"
        />

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button
          type="submit"
          class="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Procesando...' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta') }}
        </button>
      </form>

      <div class="flex items-center my-5">
        <span class="flex-1 border-t border-dark-border" />
        <span class="px-3 text-xs text-dark-muted">o</span>
        <span class="flex-1 border-t border-dark-border" />
      </div>

      <button
        class="w-full flex items-center justify-center gap-2.5 py-2.5 bg-dark-bg border border-dark-border text-dark-text rounded-lg text-sm font-medium hover:bg-dark-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isLoading"
        @click="handleGoogleLogin"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Iniciar sesión con Google
      </button>

      <p class="mt-5 text-sm text-dark-muted">
        {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
        <button
          type="button"
          class="bg-transparent border-none text-brand-500 font-semibold cursor-pointer p-0 underline hover:text-brand-400"
          @click="mode = isLogin ? 'register' : 'login'"
        >
          {{ isLogin ? 'Regístrate' : 'Inicia sesión' }}
        </button>
      </p>
    </template>
  </div>
</template>
