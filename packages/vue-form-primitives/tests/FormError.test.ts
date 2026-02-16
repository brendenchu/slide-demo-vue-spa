import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Error from '../src/FormError.vue'

describe('FormError', () => {
  it('renders message text', () => {
    const wrapper = mount(Error, {
      props: { message: 'This field is required' },
    })
    expect(wrapper.text()).toContain('This field is required')
  })

  it('is hidden when no message provided', () => {
    const wrapper = mount(Error, {
      props: { message: undefined },
    })
    // v-show sets display: none via inline style
    expect(wrapper.find('div').element.style.display).toBe('none')
  })

  it('has error text styling', () => {
    const wrapper = mount(Error, {
      props: { message: 'Error' },
    })
    expect(wrapper.find('p').classes()).toContain('text-error')
  })
})
