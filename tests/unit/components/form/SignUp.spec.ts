import { test as baseTest } from 'vitest'
import { VueWrapper, mount } from '@vue/test-utils'

// @ts-expect-error not exported member
import { mockMutateFn } from '@tanstack/vue-query'

import SignUp from '@/components/form/SignUp.vue'

const test = baseTest.extend<{
  wrapper: VueWrapper
}>({
  wrapper: async ({}, use) => {
    const w = mount(SignUp)
    await use(w)
    w.unmount()
  },
})

vi.mock('@tanstack/vue-query')

describe('SignUp', () => {
  test('mount', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')

    expect(inputs).toHaveLength(5)

    for (const input of inputs) {
      expect(input.element.value).toEqual('')
    }

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
  })

  test('set value', async ({ wrapper, expect }) => {
    const inputs = wrapper.findAll('input')

    const registerArgs: Record<string, string> = {
      full_name: 'John Doe',
      email: 'jdoe@email.com',
      username: 'jdoe123',
      password: 'secretPaSS',
      confirm_password: 'secretPaSS',
    }

    for (const input of inputs) {
      await input.setValue(registerArgs[input.element.name])
      expect(input.element.value).toEqual(registerArgs[input.element.name])
    }
  })

  test('submit', async ({ wrapper, expect }) => {
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

    expect(mockMutateFn).toHaveBeenCalledWith(registerArgs)
  })
})
