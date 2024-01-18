import { VueWrapper, mount } from '@vue/test-utils'
import { atom } from 'nanostores'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import NavDrawer from '@/components/NavDrawer.vue'

const vuetify = createVuetify({ components })

global.ResizeObserver = require('resize-observer-polyfill')

vi.mock('@/stores/routes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/stores/routes')>()
  return {
    ...actual,
    $routes: atom([
      {
        name: 'index',
        title: 'Home',
        to: '/',
        visible: true,
      },
      {
        name: 'user',
        title: 'User',
        to: '/user',
        visible: true,
      },
      {
        name: 'login',
        title: 'Login',
        to: '/login',
        visible: true,
      },
    ]),
  }
})

type LocalTestCtx = {
  wrapper: VueWrapper
}

const mountComponent = () =>
  mount(
    {
      template: '<v-layout><NavDrawer /></v-layout>',
    },
    {
      props: {},
      global: {
        components: {
          NavDrawer,
        },
        plugins: [vuetify],
      },
    }
  )

describe('NavDrawer', () => {
  beforeEach<LocalTestCtx>((ctx) => {
    ctx.wrapper = mountComponent()
  })

  afterEach<LocalTestCtx>(({ wrapper }) => {
    wrapper.unmount()
  })

  describe('mount', () => {
    test<LocalTestCtx>('default', ({ wrapper, expect }) => {
      const items = wrapper.findAllComponents('[data-testid=list-item]')
      expect(items).toHaveLength(3)
    })
  })
})
