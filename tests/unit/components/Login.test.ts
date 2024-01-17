import { VueWrapper, mount } from '@vue/test-utils'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import Login from '@/components/Login.vue'

type LocalTestCtx = {
  wrapper: VueWrapper
}

const vuetify = createVuetify({ components })

global.ResizeObserver = require('resize-observer-polyfill')

const mHandleSubmit = vi.fn()

vi.mock('@tanstack/vue-query', () => ({
  useMutation: () => ({
    isLoading: false,
    isError: false,
    mutate: mHandleSubmit,
  }),
}))

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

    expect(inputs[0].element.value).toEqual('') // username
    expect(inputs[1].element.value).toEqual('') // password

    const button = wrapper.find('button')

    await vi.waitUntil(() => button.element.disabled, { timeout: 4500 })

    // login button
    expect(button.element.innerHTML).toMatch(/[lL]og [iI]n/)
    expect(button.element.disabled).toBe(true)
  })

  it<LocalTestCtx>('validation', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')
    const buttons = wrapper.findAll('button')

    expect(inputs[0].element.value).toEqual('') // username
    expect(inputs[1].element.value).toEqual('') // password

    await vi.waitUntil(() => buttons[0].element.disabled, { timeout: 4500 })

    expect(buttons[0].element.disabled).toBe(true)

    await inputs[0].setValue('validusername')
    await inputs[1].setValue('validpassword')

    expect(inputs[0].element.value).toEqual('validusername') // username
    expect(inputs[1].element.value).toEqual('validpassword') // password

    await vi.waitUntil(() => !buttons[0].element.disabled, { timeout: 4500 })
    expect(buttons[0].element.disabled).toBe(false)

    await inputs[1].setValue('short')
    expect(inputs[1].element.value).toEqual('short') // password

    await vi.waitUntil(() => buttons[0].element.disabled, { timeout: 4500 })
    expect(buttons[0].element.disabled).toBe(true)
  })

  it<LocalTestCtx>('submit', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')

    const loginArgs = {
      username: 'validusername',
      password: 'validpassword',
    }

    await inputs[0].setValue(loginArgs.username)
    await inputs[1].setValue(loginArgs.password)

    await wrapper.find('form').trigger('submit')

    expect(mHandleSubmit).toHaveBeenCalledWith(loginArgs)
  })
})
