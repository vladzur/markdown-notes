<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <textarea
    class="w-full h-full bg-transparent text-dark-text outline-none resize-none font-mono text-sm leading-relaxed p-4 border-none placeholder:text-dark-border"
    :value="modelValue"
    :placeholder="placeholder ?? 'Escribe tu nota en Markdown...'"
    :readonly="readonly"
    @input="onInput"
  />
</template>
