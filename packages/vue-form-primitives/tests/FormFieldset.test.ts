import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Fieldset from '../src/FormFieldset.vue'

describe('FormFieldset', () => {
  it('renders a fieldset element', () => {
    const wrapper = mount(Fieldset)
    expect(wrapper.element.tagName).toBe('FIELDSET')
  })

  it('renders legend as sr-only when provided', () => {
    const wrapper = mount(Fieldset, {
      props: { legend: 'Personal Info' },
    })
    const legend = wrapper.find('legend')
    expect(legend.exists()).toBe(true)
    expect(legend.classes()).toContain('sr-only')
    expect(legend.text()).toBe('Personal Info')
  })

  it('does not render legend when not provided', () => {
    const wrapper = mount(Fieldset)
    expect(wrapper.find('legend').exists()).toBe(false)
  })

  it('renders query as h3 heading', () => {
    const wrapper = mount(Fieldset, {
      props: { query: 'What is your name?' },
    })
    expect(wrapper.find('h3').text()).toBe('What is your name?')
  })

  it('renders slot content', () => {
    const wrapper = mount(Fieldset, {
      slots: { default: '<input type="text" />' },
    })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('uses flex layout for single column', () => {
    const wrapper = mount(Fieldset, {
      props: { columns: 1 },
    })
    const inner = wrapper.find('div')
    expect(inner.classes()).toContain('flex')
    expect(inner.classes()).toContain('flex-col')
  })

  it('uses grid layout for two columns', () => {
    const wrapper = mount(Fieldset, {
      props: { columns: 2 },
    })
    const inner = wrapper.find('div')
    expect(inner.classes()).toContain('grid')
    expect(inner.classes()).toContain('grid-cols-2')
  })
})
