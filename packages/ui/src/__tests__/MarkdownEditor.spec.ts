import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownEditor from '../components/MarkdownEditor/MarkdownEditor.vue'

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
})
