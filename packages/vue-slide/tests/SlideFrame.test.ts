import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Frame from '../src/Blocks/SlideFrame.vue'

describe('SlideFrame', () => {
  it('renders slot content', () => {
    const wrapper = mount(Frame, {
      slots: { default: '<div class="test-child">Content</div>' },
    })
    expect(wrapper.find('.test-child').exists()).toBe(true)
    expect(wrapper.text()).toContain('Content')
  })

  it('renders a section element', () => {
    const wrapper = mount(Frame)
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('has overflow-x-hidden class', () => {
    const wrapper = mount(Frame)
    expect(wrapper.classes()).toContain('overflow-x-hidden')
  })
})
