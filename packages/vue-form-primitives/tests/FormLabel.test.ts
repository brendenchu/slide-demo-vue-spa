import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Label from '../src/FormLabel.vue'

describe('FormLabel', () => {
  it('renders value prop text', () => {
    const wrapper = mount(Label, {
      props: { value: 'Email Address' },
    })
    expect(wrapper.text()).toBe('Email Address')
  })

  it('renders slot content when no value prop', () => {
    const wrapper = mount(Label, {
      slots: { default: 'Slot Label' },
    })
    expect(wrapper.text()).toBe('Slot Label')
  })

  it('renders a label element', () => {
    const wrapper = mount(Label)
    expect(wrapper.element.tagName).toBe('LABEL')
  })

  it('has label class', () => {
    const wrapper = mount(Label)
    expect(wrapper.classes()).toContain('label')
  })
})
