<script setup lang="ts">
import { IconBars, IconLock, IconLockOpen } from '../../icons'

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
  <header class="h-16 border-b border-dark-border flex items-center justify-between px-4 lg:px-6 bg-dark-bg shrink-0">
    <div class="flex items-center gap-4">
      <button
        class="lg:hidden p-1.5 text-dark-muted hover:text-white transition-colors rounded"
        title="Menú lateral"
        @click="emit('toggle-sidebar')"
      >
        <IconBars />
      </button>
      <div v-if="breadcrumbs && breadcrumbs.length > 0" class="text-sm text-dark-muted flex items-center gap-2">
        <template v-for="(crumb, i) in breadcrumbs" :key="crumb.id">
          <span v-if="i > 0" class="text-[10px] opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-3"><path d="m9 18 6-6-6-6"/></svg>
          </span>
          <span :class="{ 'text-white font-medium': i === breadcrumbs.length - 1 }">{{ crumb.name }}</span>
        </template>
      </div>
      <span v-else class="text-base font-bold text-dark-text">Notes</span>
    </div>

    <div class="flex items-center gap-3">
      <button
        class="p-1.5 text-dark-muted hover:text-white transition-colors rounded"
        :class="{ 'text-emerald-400': isVaultUnlocked }"
        title="Bóveda"
        @click="emit('toggle-vault')"
      >
        <IconLockOpen v-if="isVaultUnlocked" />
        <IconLock v-else />
      </button>
    </div>
  </header>
</template>
