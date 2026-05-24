<script setup lang="ts">
defineProps<{
  breadcrumbs?: { id: string; name: string }[]
  isVaultUnlocked?: boolean
}>()

const emit = defineEmits<{
  'toggle-sidebar': []
  'toggle-vault': []
}>()
</script>

<template>
  <header class="app-header">
    <div class="app-header__left">
      <button class="app-header__icon-btn" title="Menú lateral" @click="emit('toggle-sidebar')">
        ☰
      </button>
    </div>

    <div class="app-header__center">
      <span class="app-header__title">Notes</span>
    </div>

    <div class="app-header__right">
      <button
        class="app-header__icon-btn app-header__vault-btn"
        :class="{ 'app-header__vault-btn--unlocked': isVaultUnlocked }"
        title="Bóveda"
        @click="emit('toggle-vault')"
      >
        {{ isVaultUnlocked ? '🔓' : '🔒' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 12px;
  background: var(--color-surface, #ffffff);
  border-bottom: 1px solid var(--color-border, #e5e5e5);
}

.app-header__left,
.app-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80px;
}

.app-header__right {
  justify-content: flex-end;
}

.app-header__center {
  flex: 1;
  text-align: center;
}

.app-header__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
}

.app-header__icon-btn {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}

.app-header__icon-btn:hover {
  background: var(--color-bg-hover, rgba(0, 0, 0, 0.05));
}

.app-header__vault-btn--unlocked {
  color: var(--color-primary, #3b82f6);
}
</style>
