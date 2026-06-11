<script setup lang="ts">
import PlaceholderExtension from '@tiptap/extension-placeholder'
import { TableKit } from '@tiptap/extension-table/kit'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { watch } from 'vue'
import {
  IconBlockquote,
  IconBold,
  IconCode,
  IconItalic,
  IconLink,
  IconListOl,
  IconListUl,
  IconUnderline,
} from '../../icons'
import ToolbarButton from './ToolbarButton.vue'

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

// Soporte para GFM: tablas, strikethrough, listas de tareas
turndownService.use(gfm)

function markdownToHtml(md: string): string {
  if (!md)
    return ''
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
    TableKit.configure({
      table: {
        HTMLAttributes: {
          class: 'prose-table',
        },
      },
    }),
    PlaceholderExtension.configure({
      placeholder: props.placeholder,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-invert max-w-none outline-none min-h-[200px]',
    },
  },
  onUpdate: () => {
    if (emitTimer)
      clearTimeout(emitTimer)
    emitTimer = setTimeout(() => {
      if (!editor.value)
        return
      emit('update:modelValue', turndownService.turndown(editor.value.getHTML()))
    }, EMIT_DEBOUNCE_MS)
  },
})

// Sincronizar cambios externos (cambio de nota)
watch(
  () => props.modelValue,
  (newVal) => {
    if (!editor.value)
      return
    const currentMd = turndownService.turndown(editor.value.getHTML())
    if (newVal !== currentMd) {
      editor.value.commands.setContent(markdownToHtml(newVal))
    }
  },
)

// Sincronizar readonly
watch(
  () => props.readonly,
  val => editor.value?.setEditable(!val),
)

// ---- Acciones de toolbar ----
function setLink(): void {
  if (!editor.value)
    return
  const prev = editor.value.getAttributes('link').href as string | undefined
  const url = globalThis.prompt('URL:', prev ?? 'https://')
  if (url === null)
    return
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

<style>
/* Espaciado compacto para el editor: anula defaults de typography */
.ProseMirror {
  line-height: 1.6;
}

.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3 {
  margin-top: 0.8em;
  margin-bottom: 0.3em;
}

.ProseMirror h1:first-child,
.ProseMirror h2:first-child,
.ProseMirror h3:first-child,
.ProseMirror > :first-child {
  margin-top: 0;
}

.ProseMirror p {
  margin-top: 0.4em;
  margin-bottom: 0.4em;
}

.ProseMirror ul,
.ProseMirror ol {
  margin-top: 0.25em;
  margin-bottom: 0.4em;
  padding-left: 1.5em;
}

.ProseMirror li {
  margin-top: 0.1em;
  margin-bottom: 0.1em;
}

.ProseMirror li p {
  margin-top: 0.15em;
  margin-bottom: 0.15em;
}

.ProseMirror ul ul,
.ProseMirror ul ol,
.ProseMirror ol ul,
.ProseMirror ol ol {
  margin-top: 0.15em;
  margin-bottom: 0.15em;
}

.ProseMirror blockquote {
  margin-top: 0.4em;
  margin-bottom: 0.4em;
  border-left-color: #475569;
}

.ProseMirror pre {
  margin-top: 0.4em;
  margin-bottom: 0.4em;
}

.ProseMirror hr {
  margin-top: 1em;
  margin-bottom: 1em;
}

.ProseMirror code {
  background-color: #1e293b;
  padding: 0.15em 0.3em;
  border-radius: 3px;
  font-weight: 400;
  font-size: 0.875em;
}

.ProseMirror code::before,
.ProseMirror code::after {
  content: none;
}

.ProseMirror pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

/* ---- Tablas ---- */
.ProseMirror table {
  border-collapse: collapse;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  width: 100%;
  table-layout: auto;
}

.ProseMirror th,
.ProseMirror td {
  border: 1px solid #475569;
  padding: 0.4em 0.75em;
  text-align: left;
  vertical-align: top;
  min-width: 3em;
}

.ProseMirror th {
  background-color: #1e293b;
  font-weight: 600;
  color: #e2e8f0;
}

.ProseMirror td {
  background-color: #0f172a;
}

.ProseMirror th p,
.ProseMirror td p {
  margin-top: 0;
  margin-bottom: 0;
}

/* Wrapper que Tiptap usa para tablas en modo editable */
.ProseMirror .tableWrapper {
  overflow-x: auto;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
</style>
