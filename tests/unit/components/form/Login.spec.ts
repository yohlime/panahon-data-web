import { test as baseTest } from 'vitest'
import { VueWrapper, mount } from '@vue/test-utils'

import Login from '@/components/form/Login.vue'

// @ts-expect-error not exported member
import { mockMutateFn } from '@tanstack/vue-query'

const test = baseTest.extend<{
  wrapper: VueWrapper
}>({
  wrapper: async ({}, use) => {
    const w = mount(Login)
    await use(w)
    w.unmount()
  },
})

vi.mock('@tanstack/vue-query')

describe('Login', () => {
  test('mount', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')

    expect(inputs).toHaveLength(2)

    for (const input of inputs) {
      expect(input.element.value).toEqual('')
    }

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
  })

  test('set value', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')

    const loginArgs: Record<string, string> = {
      username: 'jdoe123',
      password: 'secretPaSS',
    }
    await Promise.all(inputs.map((input) => input.setValue(loginArgs[input.element.name])))
    for (const input of inputs) {
      expect(input.element.value).toEqual(loginArgs[input.element.name])
    }
  })

  test('submit', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')

    const loginArgs: Record<string, string> = {
      username: 'jdoe123',
      password: 'secretPaSS',
    }

    await Promise.all(inputs.map((input) => input.setValue(loginArgs[input.element.name])))
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted()).toHaveProperty('submit')
    expect(mockMutateFn).toHaveBeenCalledWith(loginArgs)
  })
})
