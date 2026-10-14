import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { VueQueryPlugin } from '@tanstack/vue-query'

vi.mock('@/utils/axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import axios from '@/utils/axios'
import { $authUser } from '@/stores/user'
import Table from '@/components/apiKeys/Table.vue'

describe('ApiKeysTable', () => {
  beforeEach(() => {
    $authUser.set({ id: 7, username: 'user1' } as never)
  })

  afterEach(() => {
    $authUser.set(undefined)
  })

  test('fetches tokens on mount', async () => {
    const wrapper = mount(Table, { global: { plugins: [VueQueryPlugin] } })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(axios.get).toHaveBeenCalledWith('/users/7/api-tokens')
    wrapper.unmount()
  })
})
