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

async function handleLogin() {
  isLoading.value = true
  error.value = ''
  try {
    await loginWithEmail(email.value, password.value)
    await navigateTo('/folders')
  } catch (err: any) {
    error.value = mapAuthError(err.code)
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  isLoading.value = true
  error.value = ''
  try {
    await registerWithEmail(email.value, password.value)
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
  <div class="login-card">
    <h1 class="login-title">Notes</h1>
    <p class="login-subtitle">Gestión de notas Markdown cifradas</p>

    <!-- Spinner mientras se resuelve la sesión persistida -->
    <div v-if="!isAuthReady" class="login-loading">Verificando sesión...</div>

    <template v-else>
      <form class="login-form" @submit.prevent="isLogin ? handleLogin() : handleRegister()">
        <input
          v-model="email"
          type="email"
          class="login-input"
          placeholder="Correo electrónico"
          required
          autocomplete="email"
        />
        <input
          v-model="password"
          type="password"
          class="login-input"
          placeholder="Contraseña"
          required
          autocomplete="current-password"
        />

        <p v-if="error" class="login-error">{{ error }}</p>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? 'Procesando...' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta') }}
        </button>
      </form>

      <div class="login-divider">
        <span class="login-divider__text">o</span>
      </div>

      <button class="login-google-btn" :disabled="isLoading" @click="handleGoogleLogin">
        <svg class="login-google-btn__icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Iniciar sesión con Google
      </button>

      <p class="login-toggle">
        {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
        <button type="button" class="login-toggle__link" @click="mode = isLogin ? 'register' : 'login'">
          {{ isLogin ? 'Regístrate' : 'Inicia sesión' }}
        </button>
      </p>
    </template>
  </div>
</template>

<style scoped>
.login-card {
  background: var(--color-surface, #ffffff);
  border-radius: 12px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.login-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 4px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--color-text-muted, #666);
  margin: 0 0 28px;
}

.login-loading {
  color: var(--color-text-muted, #888);
  font-size: 14px;
  padding: 20px 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-input {
  padding: 10px 14px;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 6px;
  font-size: 16px;
  outline: none;
}

.login-input:focus {
  border-color: var(--color-primary, #3b82f6);
}

.login-error {
  color: var(--color-error, #ef4444);
  font-size: 13px;
  margin: 0;
}

.login-btn {
  padding: 10px;
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border, #ddd);
}

.login-divider__text {
  padding: 0 12px;
  font-size: 13px;
  color: var(--color-text-muted, #888);
}

.login-google-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  background: var(--color-surface, #ffffff);
  color: var(--color-text, #333);
  border: 1px solid var(--color-border, #ddd);
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.login-google-btn:hover {
  background: var(--color-bg, #f5f5f5);
}

.login-google-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-google-btn__icon {
  flex-shrink: 0;
}

.login-toggle {
  margin: 20px 0 0;
  font-size: 14px;
  color: var(--color-text-muted, #666);
}

.login-toggle__link {
  background: none;
  border: none;
  color: var(--color-primary, #3b82f6);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}
</style>
