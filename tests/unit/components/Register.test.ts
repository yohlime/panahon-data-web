import { VueWrapper, mount } from '@vue/test-utils'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import Register from '@/components/Register.vue'

type LocalTestCtx = {
  wrapper: VueWrapper
}

const vuetify = createVuetify({ components })

global.ResizeObserver = require('resize-observer-polyfill')

const mMutateFn = vi.fn()
vi.mock('@tanstack/vue-query', () => ({
  useMutation: () => ({
    isLoading: false,
    isError: false,
    mutate: mMutateFn,
  }),
}))

describe('Register', () => {
  beforeEach<LocalTestCtx>((ctx) => {
    ctx.wrapper = mount(
      {
        template: '<v-layout><register /></v-layout>',
      },
      {
        props: {},
        global: {
          components: {
            Register,
          },
          plugins: [vuetify],
        },
      }
    )
  })

  afterEach<LocalTestCtx>(({ wrapper }) => {
    wrapper.unmount()
  })

  it<LocalTestCtx>('mount', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')

    expect(inputs).toHaveLength(5)

    for (const input of inputs) {
      expect(input.element.value).toEqual('')
    }

    const button = wrapper.find('button')

    await vi.waitUntil(() => button.element.disabled, { timeout: 4500 })

    expect(button.element.innerHTML).toMatch(/[rR]egister/)
    expect(button.element.disabled).toBe(true)
  })

  it<LocalTestCtx>('validation', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')
    const buttons = wrapper.findAll('button')

    await vi.waitUntil(() => buttons[0].element.disabled, { timeout: 4500 })
    expect(buttons[0].element.disabled).toBe(true)

    const registerArgs: Record<string, string> = {
      full_name: 'John Doe',
      email: 'jdoe@email.com',
      username: 'jdoe123',
      password: 'secretPaSS',
      confirm_password: 'secretPaSS',
    }

    await Promise.all(inputs.map((input) => input.setValue(registerArgs[input.element.name])))
    for (const input of inputs) {
      expect(input.element.value).toEqual(registerArgs[input.element.name])
    }

    await vi.waitUntil(() => !buttons[0].element.disabled, { timeout: 4500 })
    expect(buttons[0].element.disabled).toBe(false)
  })

  it<LocalTestCtx>('submit', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')

    const registerArgs: Record<string, string> = {
      full_name: 'John Doe',
      email: 'jdoe@email.com',
      username: 'jdoe123',
      password: 'secretPaSS',
      confirm_password: 'secretPaSS',
    }

    await Promise.all(inputs.map((input) => input.setValue(registerArgs[input.element.name])))
    await wrapper.find('form').trigger('submit')

    expect(mMutateFn).toHaveBeenCalledWith(registerArgs)
  })
})
