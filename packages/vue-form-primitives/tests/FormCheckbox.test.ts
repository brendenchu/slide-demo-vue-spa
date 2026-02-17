import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Checkbox from '../src/FormCheckbox.vue'

describe('FormCheckbox', () => {
  it('renders a checkbox input', () => {
    const wrapper = mount(Checkbox, {
      props: { checked: false },
    })
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('is checked when checked equals value', () => {
    const wrapper = mount(Checkbox, {
      props: { checked: 'yes', value: 'yes' },
    })
    expect(wrapper.find('input').element.checked).toBe(true)
  })

  it('is unchecked when checked does not equal value', () => {
    const wrapper = mount(Checkbox, {
      props: { checked: 'no', value: 'yes' },
    })
    expect(wrapper.find('input').element.checked).toBe(false)
  })

  it('emits update:checked on change', async () => {
    const wrapper = mount(Checkbox, {
      props: { checked: false, value: true },
    })

    await wrapper.find('input').setValue(true)

    expect(wrapper.emitted('update:checked')).toBeTruthy()
  })

  it('has checkbox-primary class', () => {
    const wrapper = mount(Checkbox, {
      props: { checked: false },
    })
    expect(wrapper.find('input').classes()).toContain('checkbox-primary')
  })
})
