<script setup lang="ts">
import { ref } from 'vue'
import { IconShieldHalved, IconKey, IconSpinner } from '../../icons'

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
  <div class="flex items-center justify-center h-full bg-dark-bg">
    <div class="bg-dark-sidebar border border-dark-border rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
      <div class="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
        <IconShieldHalved class="text-rose-500 text-2xl" />
      </div>
      <h2 class="text-xl font-bold text-white mb-2">Bóveda Privada</h2>
      <p class="text-sm text-dark-muted mb-6">
        Ingresa la contraseña maestra para desbloquear tus notas cifradas.
      </p>

      <form class="flex flex-col gap-3" @submit.prevent="handleSubmit">
        <div class="relative">
          <IconKey class="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
          <input
            v-model="password"
            type="password"
            class="w-full bg-dark-bg border rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-dark-border"
            :class="error ? 'border-rose-500' : 'border-dark-border'"
            placeholder="Contraseña maestra"
            autocomplete="off"
            :disabled="isLoading"
            @input="handleInput"
          />
        </div>
        <p
          v-if="error"
          data-testid="vault-error"
          class="text-rose-400 text-xs"
        >
          Contraseña incorrecta. Intenta de nuevo.
        </p>
        <button
          type="submit"
          class="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-rose-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          :disabled="!password || isLoading"
        >
          <IconSpinner v-if="isLoading" />
          <span>{{ isLoading ? 'Desbloqueando...' : 'Desbloquear' }}</span>
        </button>
      </form>

      <p class="text-[10px] text-dark-muted uppercase tracking-widest mt-6">
        Client-Side AES-GCM Encryption
      </p>
    </div>
  </div>
</template>
