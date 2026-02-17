import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Textarea from '../src/FormTextarea.vue'

describe('FormTextarea', () => {
  it('renders a textarea element', () => {
    const wrapper = mount(Textarea, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('displays the model value', () => {
    const wrapper = mount(Textarea, {
      props: { modelValue: 'Some text' },
    })
    expect(wrapper.find('textarea').element.value).toBe('Some text')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Textarea, {
      props: { modelValue: '' },
    })

    await wrapper.find('textarea').setValue('new text')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new text'])
  })

  it('exposes focus method', () => {
    const wrapper = mount(Textarea, {
      props: { modelValue: '' },
    })
    expect(typeof wrapper.vm.focus).toBe('function')
  })
})
