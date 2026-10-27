import { mount } from '@vue/test-utils'

import AccessScopeBadges from '@/components/access/AccessScopeBadges.vue'

const stationNames = new Map([
  [1, 'Manila Observatory'],
  [2, 'Diliman'],
  [3, 'Tagaytay'],
  [4, 'Baguio'],
])

describe('AccessScopeBadges', () => {
  test('renders wrapping chips and expands long station lists', async () => {
    const wrapper = mount(AccessScopeBadges, {
      props: {
        stationIds: [1, 2, 3, 4],
        variables: ['temp', 'rh'],
        maxDays: -1,
        stationNames,
      },
    })

    expect(wrapper.text()).toContain('Manila Observatory')
    expect(wrapper.text()).toContain('Diliman')
    expect(wrapper.text()).toContain('Tagaytay')
    expect(wrapper.text()).toContain('+1 more')
    expect(wrapper.text()).toContain('Unlimited')

    await wrapper.get('button').trigger('click')

    expect(wrapper.text()).toContain('Baguio')
    expect(wrapper.text()).toContain('Show less')
  })

  test('renders all and none states explicitly', () => {
    const all = mount(AccessScopeBadges, {
      props: { stationIds: null, variables: null, maxDays: 365 },
    })
    expect(all.text()).toContain('All stations')
    expect(all.text()).toContain('All variables')
    expect(all.text()).toContain('1 year')

    const none = mount(AccessScopeBadges, {
      props: { stationIds: [], variables: [], maxDays: -1 },
    })
    expect(none.text()).toContain('No stations')
    expect(none.text()).toContain('No variables')
  })
})
