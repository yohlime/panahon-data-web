import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { VueQueryPlugin } from '@tanstack/vue-query'

vi.mock('@/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(() =>
      Promise.resolve({
        data: {
          id: 1,
          name: 'Test Station',
          lat: null,
          lon: null,
          elevation: null,
          date_installed: null,
          station_type: 'MO',
          station_type2: 'Default',
          mobile_number: null,
          station_url: null,
          address: '',
          province: '',
          region: '',
          status: 'OFFLINE',
        },
      }),
    ),
    put: vi.fn(),
  },
}))

import axios from '@/utils/axios'
import Form from '@/components/stations/Form.vue'

describe('StationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits a new station with only the required fields', async () => {
    const wrapper = mount(Form, { global: { plugins: [VueQueryPlugin] } })

    await wrapper.find('input[name="name"]').setValue('Test Station')

    const add = wrapper.findAll('button').find((b) => b.text() === 'Add')
    expect(add).toBeTruthy()
    expect(add!.attributes('disabled')).toBeUndefined()

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => expect(axios.post).toHaveBeenCalled())
    expect(vi.mocked(axios.post).mock.calls[0][0]).toBe('/stations')
    expect(wrapper.emitted('success')).toBeTruthy()

    wrapper.unmount()
  })

  test('updates an existing station', async () => {
    const station = {
      id: 5,
      name: 'Existing Station',
      lat: null,
      lon: null,
      elevation: null,
      date_installed: null,
      station_type: 'MO',
      station_type2: 'Default',
      mobile_number: null,
      station_url: null,
      address: '',
      province: '',
      region: '',
      status: 'OFFLINE',
    }
    vi.mocked(axios.get).mockResolvedValue({ data: station })
    vi.mocked(axios.put).mockResolvedValue({ data: station })

    const wrapper = mount(Form, { props: { itemID: 5 }, global: { plugins: [VueQueryPlugin] } })

    await vi.waitFor(() => expect(axios.get).toHaveBeenCalledWith('/stations/5'))

    const save = wrapper.findAll('button').find((b) => b.text() === 'Save')
    expect(save).toBeTruthy()
    await vi.waitFor(() => expect(save!.attributes('disabled')).toBeUndefined())

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(vi.mocked(axios.put).mock.calls[0][0]).toBe('/stations/5')
    expect(wrapper.emitted('success')).toBeTruthy()

    wrapper.unmount()
  })
})
