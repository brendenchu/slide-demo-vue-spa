import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NavigationButton from '../src/UI/NavigationButton.vue'

describe('NavigationButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(NavigationButton, {
      slots: { default: 'Go Next' },
    })
    expect(wrapper.text()).toBe('Go Next')
  })

  it('defaults to button type', () => {
    const wrapper = mount(NavigationButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('applies primary theme by default', () => {
    const wrapper = mount(NavigationButton)
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('applies neutral theme when specified', () => {
    const wrapper = mount(NavigationButton, {
      props: { theme: 'neutral' },
    })
    expect(wrapper.classes()).toContain('btn-neutral')
  })

  it('applies outline class when specified', () => {
    const wrapper = mount(NavigationButton, {
      props: { outline: true },
    })
    expect(wrapper.classes()).toContain('btn-outline')
  })

  it('emits click event', async () => {
    const wrapper = mount(NavigationButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
