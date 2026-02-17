import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Field from '../src/FormField.vue'

describe('FormField', () => {
  it('renders an input element', () => {
    const wrapper = mount(Field, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('displays the model value', () => {
    const wrapper = mount(Field, {
      props: { modelValue: 'hello' },
    })
    expect(wrapper.find('input').element.value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Field, {
      props: { modelValue: '' },
    })

    await wrapper.find('input').setValue('new value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value'])
  })

  it('has input-bordered class', () => {
    const wrapper = mount(Field, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('input').classes()).toContain('input-bordered')
  })

  it('exposes focus method', () => {
    const wrapper = mount(Field, {
      props: { modelValue: '' },
    })
    expect(typeof wrapper.vm.focus).toBe('function')
  })
})
