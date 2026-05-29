<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import PlaceholderExtension from '@tiptap/extension-placeholder'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { watch } from 'vue'
import ToolbarButton from './ToolbarButton.vue'
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconListUl,
  IconListOl,
  IconCode,
  IconBlockquote,
  IconLink,
} from '../../icons'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    readonly?: boolean
  }>(),
  {
    placeholder: 'Escribe tu nota en Markdown...',
    readonly: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ---- Conversión Markdown ↔ HTML ----
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

function markdownToHtml(md: string): string {
  if (!md) return ''
  return marked.parse(md, { async: false }) as string
}

const EMIT_DEBOUNCE_MS = 300
let emitTimer: ReturnType<typeof setTimeout> | null = null

// ---- Editor tiptap ----
const editor = useEditor({
  content: markdownToHtml(props.modelValue),
  editable: !props.readonly,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        HTMLAttributes: { class: 'text-brand-500 underline' },
      },
    }),
    PlaceholderExtension.configure({
      placeholder: props.placeholder,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-invert max-w-none outline-none min-h-[200px] text-dark-text',
    },
  },
  onUpdate: () => {
    if (emitTimer) clearTimeout(emitTimer)
    emitTimer = setTimeout(() => {
      if (!editor.value) return
      emit('update:modelValue', turndownService.turndown(editor.value.getHTML()))
    }, EMIT_DEBOUNCE_MS)
  },
})

// Sincronizar cambios externos (cambio de nota)
watch(
  () => props.modelValue,
  (newVal) => {
    if (!editor.value) return
    const currentMd = turndownService.turndown(editor.value.getHTML())
    if (newVal !== currentMd) {
      editor.value.commands.setContent(markdownToHtml(newVal))
    }
  },
)

// Sincronizar readonly
watch(
  () => props.readonly,
  (val) => editor.value?.setEditable(!val),
)

// ---- Acciones de toolbar ----
function setLink(): void {
  if (!editor.value) return
  const prev = editor.value.getAttributes('link').href as string | undefined
  const url = globalThis.prompt('URL:', prev ?? 'https://')
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<template>
  <div class="markdown-editor flex flex-col h-full border border-dark-border rounded-lg overflow-hidden bg-dark-bg">
    <!-- Barra de herramientas -->
    <div
      v-if="!readonly"
      class="flex items-center gap-0.5 px-2 py-1.5 border-b border-dark-border bg-dark-sidebar shrink-0 flex-wrap"
    >
      <ToolbarButton
        :active="editor?.isActive('heading', { level: 1 }) ?? false"
        title="Título 1"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <span class="text-xs font-bold">H1</span>
      </ToolbarButton>
      <ToolbarButton
        :active="editor?.isActive('heading', { level: 2 }) ?? false"
        title="Título 2"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <span class="text-xs font-bold">H2</span>
      </ToolbarButton>
      <ToolbarButton
        :active="editor?.isActive('heading', { level: 3 }) ?? false"
        title="Título 3"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <span class="text-xs font-bold">H3</span>
      </ToolbarButton>

      <div class="w-px h-5 bg-dark-border mx-1" />

      <ToolbarButton
        :active="editor?.isActive('bold') ?? false"
        title="Negrita"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <IconBold />
      </ToolbarButton>
      <ToolbarButton
        :active="editor?.isActive('italic') ?? false"
        title="Cursiva"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <IconItalic />
      </ToolbarButton>
      <ToolbarButton
        :active="editor?.isActive('underline') ?? false"
        title="Subrayado"
        @click="editor?.chain().focus().toggleUnderline().run()"
      >
        <IconUnderline />
      </ToolbarButton>

      <div class="w-px h-5 bg-dark-border mx-1" />

      <ToolbarButton
        :active="editor?.isActive('bulletList') ?? false"
        title="Lista sin orden"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <IconListUl />
      </ToolbarButton>
      <ToolbarButton
        :active="editor?.isActive('orderedList') ?? false"
        title="Lista numerada"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <IconListOl />
      </ToolbarButton>

      <div class="w-px h-5 bg-dark-border mx-1" />

      <ToolbarButton
        :active="editor?.isActive('code') ?? false"
        title="Código en línea"
        @click="editor?.chain().focus().toggleCode().run()"
      >
        <IconCode />
      </ToolbarButton>
      <ToolbarButton
        :active="editor?.isActive('blockquote') ?? false"
        title="Cita"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <IconBlockquote />
      </ToolbarButton>
      <ToolbarButton
        :active="editor?.isActive('link') ?? false"
        title="Enlace"
        @click="setLink"
      >
        <IconLink />
      </ToolbarButton>
    </div>

    <!-- Área de edición inline -->
    <div class="flex-1 overflow-y-auto p-4">
      <EditorContent :editor="editor" class="h-full" />
    </div>
  </div>
</template>
