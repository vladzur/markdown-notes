<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { isAuthReady } = useAuth()
</script>

<template>
  <div v-if="!isAuthReady" class="h-screen flex items-center justify-center bg-dark-bg">
    <p class="text-base text-dark-muted">Cargando sesión...</p>
  </div>
  <NuxtLayout v-else>
    <NuxtPage />
  </NuxtLayout>
</template>
