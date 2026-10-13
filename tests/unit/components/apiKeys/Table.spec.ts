import { describe, test, expect, vi } from 'vitest'
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
import Table from '@/components/apiKeys/Table.vue'

describe('ApiKeysTable', () => {
  test('fetches tokens on mount', async () => {
    const wrapper = mount(Table, { global: { plugins: [VueQueryPlugin] } })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(axios.get).toHaveBeenCalledWith('/users/me/api-tokens')
    wrapper.unmount()
  })
})
