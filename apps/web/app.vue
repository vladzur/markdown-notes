<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { isAuthReady } = useAuth()
</script>

<template>
  <NuxtLayout>
    <template v-if="!isAuthReady">
      <div class="h-screen flex items-center justify-center bg-dark-bg">
        <p class="text-base text-dark-muted">
          Cargando sesión...
        </p>
      </div>
      <div class="hidden">
        <NuxtPage />
      </div>
    </template>
    <NuxtPage v-else />
  </NuxtLayout>
</template>
