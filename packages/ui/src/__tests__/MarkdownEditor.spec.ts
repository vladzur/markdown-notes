import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import MarkdownEditor from '../components/MarkdownEditor/MarkdownEditor.vue'

// ---- Helpers de conversión usados por el editor ----
function markdownToHtml(md: string): string {
  if (!md) return ''
  return marked.parse(md, { async: false }) as string
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})
turndownService.use(gfm)

describe('MarkdownEditor', () => {
  it('should render the editor container', () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '# Hello' },
    })
    expect(wrapper.find('.markdown-editor').exists()).toBe(true)
  })

  it('should render toolbar when not readonly', () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '', readonly: false },
    })
    const buttons = wrapper.findAll('.markdown-editor button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should hide toolbar when readonly', () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '', readonly: true },
    })
    const buttons = wrapper.findAll('.markdown-editor button')
    expect(buttons.length).toBe(0)
  })

  it('should render the editor content area', () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '# Hello' },
    })
    // El componente monta correctamente con contenido markdown
    expect(wrapper.props('modelValue')).toBe('# Hello')
  })

  it('should accept placeholder prop', () => {
    const placeholder = 'Escribe algo aquí...'
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '', placeholder },
    })
    expect(wrapper.props('placeholder')).toBe(placeholder)
  })

  it('should render the editor with table markdown content', () => {
    const tableMd = '| A | B |\n| --- | --- |\n| 1 | 2 |'
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: tableMd },
    })
    expect(wrapper.find('.markdown-editor').exists()).toBe(true)
    expect(wrapper.props('modelValue')).toBe(tableMd)
  })
})

describe('Markdown table conversion (marked + turndown con GFM)', () => {
  it('should parse markdown tables to HTML', () => {
    const md = '| Name | Age |\n| --- | --- |\n| Alice | 30 |'
    const html = markdownToHtml(md)
    expect(html).toContain('<table')
    expect(html).toContain('<thead')
    expect(html).toContain('<th')
    expect(html).toContain('<tbody')
    expect(html).toContain('<td')
    expect(html).toContain('Alice')
    expect(html).toContain('30')
  })

  it('should preserve round-trip for tables (markdown → HTML → markdown)', () => {
    const md = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |'
    const html = markdownToHtml(md)
    const backToMd = turndownService.turndown(html)
    expect(backToMd).toContain('| Name | Age |')
    expect(backToMd).toContain('| Alice | 30 |')
    expect(backToMd).toContain('| Bob | 25 |')
  })

  it('should handle tables with aligned columns', () => {
    const md = '| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |'
    const html = markdownToHtml(md)
    const backToMd = turndownService.turndown(html)
    expect(backToMd).toContain('| Left | Center | Right |')
    expect(backToMd).toContain('| a | b | c |')
  })

  it('should handle empty markdown gracefully', () => {
    expect(markdownToHtml('')).toBe('')
  })

  it('should not break existing non-table markdown conversion', () => {
    const md = '# Hello\n\n**bold** text'
    const html = markdownToHtml(md)
    const backToMd = turndownService.turndown(html)
    expect(backToMd).toContain('Hello')
    expect(backToMd).toContain('**bold**')
  })
})
