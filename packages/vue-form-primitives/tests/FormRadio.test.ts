import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Radio from '../src/FormRadio.vue'

describe('FormRadio', () => {
  it('renders a radio input', () => {
    const wrapper = mount(Radio, {
      props: { checked: null },
    })
    expect(wrapper.find('input[type="radio"]').exists()).toBe(true)
  })

  it('is checked when checked matches value', () => {
    const wrapper = mount(Radio, {
      props: { checked: 'option1', value: 'option1' },
    })
    expect(wrapper.find('input').element.checked).toBe(true)
  })

  it('is unchecked when checked does not match value', () => {
    const wrapper = mount(Radio, {
      props: { checked: 'option1', value: 'option2' },
    })
    expect(wrapper.find('input').element.checked).toBe(false)
  })

  it('emits update:checked on change', async () => {
    const wrapper = mount(Radio, {
      props: { checked: null, value: 'selected' },
    })

    await wrapper.find('input').setValue(true)

    expect(wrapper.emitted('update:checked')).toBeTruthy()
  })

  it('has radio-primary class', () => {
    const wrapper = mount(Radio, {
      props: { checked: null },
    })
    expect(wrapper.find('input').classes()).toContain('radio-primary')
  })
})
