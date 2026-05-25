<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('cancel')">
    <div class="bg-dark-sidebar border border-dark-border rounded-xl shadow-2xl p-6 max-w-sm w-[90%]">
      <h3 class="text-lg font-bold text-dark-text mb-2">{{ title }}</h3>
      <p class="text-sm text-dark-muted mb-5">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 text-sm font-medium border border-dark-border text-dark-text rounded-lg hover:bg-dark-surface transition-colors"
          @click="emit('cancel')"
        >
          Cancelar
        </button>
        <button
          class="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          @click="emit('confirm')"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>
