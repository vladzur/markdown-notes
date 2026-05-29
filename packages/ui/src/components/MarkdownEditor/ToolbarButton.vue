<script setup lang="ts">
defineProps<{
  active: boolean
  title: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="p-1.5 rounded transition-colors text-dark-muted hover:text-white hover:bg-dark-surface"
    :class="{ 'text-brand-500 bg-dark-surface': active }"
    :title="title"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
