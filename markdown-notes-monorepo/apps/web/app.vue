<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { isAuthReady } = useAuth()
</script>

<template>
  <div v-if="!isAuthReady" class="app-loading">
    <p class="app-loading__text">Cargando sesión...</p>
  </div>
  <NuxtLayout v-else>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.app-loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f5f5f5);
}

.app-loading__text {
  font-size: 16px;
  color: var(--color-text-muted, #888);
}
</style>
