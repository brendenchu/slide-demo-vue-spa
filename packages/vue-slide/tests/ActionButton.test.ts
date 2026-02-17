import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionButton from '../src/UI/ActionButton.vue'

describe('ActionButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(ActionButton, {
      slots: { default: 'Close' },
    })
    expect(wrapper.text()).toBe('Close')
  })

  it('is a button element', () => {
    const wrapper = mount(ActionButton)
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('has type="button"', () => {
    const wrapper = mount(ActionButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('has primary btn class', () => {
    const wrapper = mount(ActionButton)
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('emits click event', async () => {
    const wrapper = mount(ActionButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
