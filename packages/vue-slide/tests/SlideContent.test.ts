import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Content from '../src/Blocks/SlideContent.vue'

describe('SlideContent', () => {
  it('renders slot content', () => {
    const wrapper = mount(Content, {
      props: { index: 1, current: 1 },
      slots: { default: '<p>Hello</p>' },
    })
    expect(wrapper.text()).toContain('Hello')
  })

  it('applies translate-x-0 when index equals current', () => {
    const wrapper = mount(Content, {
      props: { index: 2, current: 2 },
    })
    expect(wrapper.find('div').classes()).toContain('translate-x-0')
  })

  it('applies -translate-x-full when index < current', () => {
    const wrapper = mount(Content, {
      props: { index: 1, current: 3 },
    })
    expect(wrapper.find('div').classes()).toContain('-translate-x-full')
  })

  it('applies translate-x-full when index > current', () => {
    const wrapper = mount(Content, {
      props: { index: 3, current: 1 },
    })
    expect(wrapper.find('div').classes()).toContain('translate-x-full')
  })

  it('defaults index and current to 1', () => {
    const wrapper = mount(Content)
    expect(wrapper.find('div').classes()).toContain('translate-x-0')
  })
})
