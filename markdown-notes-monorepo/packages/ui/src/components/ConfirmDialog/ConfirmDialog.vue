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
  <div v-if="open" class="dialog-overlay" @click.self="emit('cancel')">
    <div class="dialog-card">
      <h3 class="dialog-title">{{ title }}</h3>
      <p class="dialog-message">{{ message }}</p>
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn--cancel" @click="emit('cancel')">
          Cancelar
        </button>
        <button class="dialog-btn dialog-btn--confirm" @click="emit('confirm')">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-card {
  background: var(--color-surface, #ffffff);
  border-radius: 12px;
  padding: 24px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
}

.dialog-message {
  font-size: 14px;
  color: var(--color-text-muted, #666);
  margin: 0 0 20px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.dialog-btn--cancel {
  background: var(--color-bg, #eee);
  color: var(--color-text, #333);
}

.dialog-btn--confirm {
  background: var(--color-danger, #ef4444);
  color: white;
}

.dialog-btn:hover {
  opacity: 0.85;
}
</style>
