import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VaultGuard from '../components/VaultGuard/VaultGuard.vue'

describe('VaultGuard', () => {
  it('should render title and description', () => {
    const wrapper = mount(VaultGuard)
    expect(wrapper.text()).toContain('Bóveda Privada')
    expect(wrapper.text()).toContain('contraseña maestra')
  })

  it('should emit unlock with password on submit', async () => {
    const wrapper = mount(VaultGuard)
    const input = wrapper.find('input')
    await input.setValue('my-secret-password')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('unlock')).toBeTruthy()
    expect(wrapper.emitted('unlock')![0]).toEqual(['my-secret-password'])
  })

  it('should disable button when password is empty', () => {
    const wrapper = mount(VaultGuard)
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should enable button when password is entered', async () => {
    const wrapper = mount(VaultGuard)
    await wrapper.find('input').setValue('test')
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('should show error via showError method', async () => {
    const wrapper = mount(VaultGuard)
    expect(wrapper.find('.vault-guard__error').exists()).toBe(false)

    // @ts-expect-error -- método expuesto por defineExpose
    wrapper.vm.showError()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.vault-guard__error').exists()).toBe(true)
    expect(wrapper.find('.vault-guard__error').text()).toContain('incorrecta')
  })
})
