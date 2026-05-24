<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  error.value = ''
  try {
    // En entorno real: usar Firebase Auth
    // await signInWithEmailAndPassword(getFirebaseAuth(), email.value, password.value)
    await navigateTo('/folders')
  } catch {
    error.value = 'Credenciales inválidas. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">Notes</h1>
      <p class="login-subtitle">Gestión de notas Markdown cifradas</p>

      <form class="login-form" @submit.prevent="handleLogin">
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
          {{ isLoading ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f5f5f5);
}

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
</style>
