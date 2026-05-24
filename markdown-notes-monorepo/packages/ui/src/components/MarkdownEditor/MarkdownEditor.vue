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
  <div class="markdown-editor">
    <textarea
      class="markdown-editor__input"
      :value="modelValue"
      :placeholder="placeholder ?? 'Escribe tu nota en Markdown...'"
      :readonly="readonly"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.markdown-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.markdown-editor__input {
  flex: 1;
  width: 100%;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text, #1a1a1a);
  background: var(--color-bg, #ffffff);
}
</style>
