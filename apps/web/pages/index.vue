<script setup lang="ts">
// Redirige a /folders solo en el cliente para permitir que nuxt generate
// produzca un index.html válido para entornos Capacitor y Tauri
onMounted(() => {
  navigateTo('/folders', { replace: true })
})
</script>

<template>
  <div />
</template>
