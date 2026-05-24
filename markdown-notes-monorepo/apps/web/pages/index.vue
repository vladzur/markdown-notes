<script setup lang="ts">
// Redirige a /folders (definido en routeRules de nuxt.config.ts)
definePageMeta({
  middleware: () => navigateTo('/folders'),
})
</script>

<template>
  <div />
</template>
