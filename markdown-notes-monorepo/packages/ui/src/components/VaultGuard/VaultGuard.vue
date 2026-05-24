<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  unlock: [password: string]
}>()

const password = ref('')
const error = ref(false)
const isLoading = ref(false)

async function handleSubmit() {
  if (!password.value) return
  isLoading.value = true
  error.value = false
  emit('unlock', password.value)
}

function handleInput() {
  error.value = false
}

/** Llamar desde el padre si la contraseña fue incorrecta. */
function showError() {
  error.value = true
  password.value = ''
  isLoading.value = false
}

defineExpose({ showError })
</script>

<template>
  <div class="vault-guard">
    <div class="vault-guard__card">
      <h2 class="vault-guard__title">Bóveda Privada</h2>
      <p class="vault-guard__description">
        Ingresa la contraseña maestra para desbloquear tus notas cifradas.
      </p>

      <form class="vault-guard__form" @submit.prevent="handleSubmit">
        <input
          v-model="password"
          type="password"
          class="vault-guard__input"
          :class="{ 'vault-guard__input--error': error }"
          placeholder="Contraseña maestra"
          autocomplete="off"
          :disabled="isLoading"
          @input="handleInput"
        />
        <p v-if="error" class="vault-guard__error">
          Contraseña incorrecta. Intenta de nuevo.
        </p>
        <button
          type="submit"
          class="vault-guard__button"
          :disabled="!password || isLoading"
        >
          {{ isLoading ? 'Desbloqueando...' : 'Desbloquear' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.vault-guard {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--color-bg, #f5f5f5);
}

.vault-guard__card {
  background: var(--color-surface, #ffffff);
  border-radius: 12px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.vault-guard__title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-text, #1a1a1a);
}

.vault-guard__description {
  font-size: 14px;
  color: var(--color-text-muted, #666);
  margin: 0 0 24px;
}

.vault-guard__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vault-guard__input {
  padding: 10px 14px;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.15s;
}

.vault-guard__input:focus {
  border-color: var(--color-primary, #3b82f6);
}

.vault-guard__input--error {
  border-color: var(--color-error, #ef4444);
}

.vault-guard__error {
  color: var(--color-error, #ef4444);
  font-size: 13px;
  margin: 0;
}

.vault-guard__button {
  padding: 10px;
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.vault-guard__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
