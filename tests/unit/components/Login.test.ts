import { VueWrapper, mount } from '@vue/test-utils'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

// @ts-expect-error not exported member
import { mockMutateFn } from '@tanstack/vue-query'

import Login from '@/components/Login.vue'

type LocalTestCtx = {
  wrapper: VueWrapper
}

const vuetify = createVuetify({ components })

global.ResizeObserver = require('resize-observer-polyfill')

vi.mock('@tanstack/vue-query')

describe('Login', () => {
  beforeEach<LocalTestCtx>((ctx) => {
    ctx.wrapper = mount(
      {
        template: '<v-layout><login /></v-layout>',
      },
      {
        props: {},
        global: {
          components: {
            Login,
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

    expect(inputs).toHaveLength(2)

    for (const input of inputs) {
      expect(input.element.value).toEqual('')
    }

    const button = wrapper.find('button')

    await vi.waitUntil(() => button.element.disabled, { timeout: 4500 })

    expect(button.element.innerHTML).toMatch(/[lL]og [iI]n/)
    expect(button.element.disabled).toBe(true)
  })

  it<LocalTestCtx>('validation', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')
    const button = wrapper.find('button')

    await vi.waitUntil(() => button.element.disabled, { timeout: 4500 })
    expect(button.element.disabled).toBe(true)

    const loginArgs: Record<string, string> = {
      username: 'jdoe123',
      password: 'secretPaSS',
    }

    await Promise.all(inputs.map((input) => input.setValue(loginArgs[input.element.name])))
    for (const input of inputs) {
      expect(input.element.value).toEqual(loginArgs[input.element.name])
    }
    await vi.waitUntil(() => !button.element.disabled, { timeout: 4500 })
    expect(button.element.disabled).toBe(false)

    // password too short
    const passwordInput = inputs.find(({ element: { name } }) => name === 'password')
    passwordInput?.setValue('short')
    expect(passwordInput?.element.value).toEqual('short')
    await vi.waitUntil(() => button.element.disabled, { timeout: 4500 })
    expect(button.element.disabled).toBe(true)

    // input valid password again
    await passwordInput?.setValue(loginArgs['password'])
    expect(passwordInput?.element.value).toEqual(loginArgs['password'])
    await vi.waitUntil(() => !button.element.disabled, { timeout: 4500 })
    expect(button.element.disabled).toBe(false)
  })

  it<LocalTestCtx>('submit', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')

    const loginArgs: Record<string, string> = {
      username: 'jdoe123',
      password: 'secretPaSS',
    }

    await Promise.all(inputs.map((input) => input.setValue(loginArgs[input.element.name])))
    await wrapper.find('form').trigger('submit')

    expect(mockMutateFn).toHaveBeenCalledWith(loginArgs)
  })
})
