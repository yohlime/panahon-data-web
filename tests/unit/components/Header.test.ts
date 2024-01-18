import { VueWrapper, mount } from '@vue/test-utils'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import Header from '@/components/Header.vue'
import * as userStore from '@/stores/user'
import { atom } from 'nanostores'

const vuetify = createVuetify({ components })

global.ResizeObserver = require('resize-observer-polyfill')

type LocalTestCtx = {
  wrapper: VueWrapper
}

vi.mock('@tanstack/vue-query')

const mountComponent = () =>
  mount(
    {
      template: '<v-layout><Header v-model:drawer="drawer" /></v-layout>',
      data() {
        return {
          drawer: false,
        }
      },
    },
    {
      global: {
        components: {
          Header,
        },
        plugins: [vuetify],
        stubs: {
          VDialog: {
            name: 'VDialog',
            template: '<div class="v-dialog" v-if="modelValue"><slot /></div>',
            props: ['modelValue'],
          },
          Login: {
            name: 'Login',
            template: '<div class="login">Login<slot /></div>',
          },
          Register: {
            name: 'Register',
            template: '<div class="register">Register<slot /></div>',
          },
        },
      },
    }
  )

describe('Header', () => {
  beforeEach<LocalTestCtx>((ctx) => {
    ctx.wrapper = mountComponent()
  })

  afterEach<LocalTestCtx>(({ wrapper }) => {
    wrapper.unmount()
  })

  describe('mount', () => {
    test<LocalTestCtx>('default', ({ wrapper, expect }) => {
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
    })

    test<LocalTestCtx>('authenticated', ({ wrapper, expect }) => {
      wrapper.unmount()

      vi.spyOn(userStore, '$isLoggedIn', 'get').mockReturnValueOnce(atom(true))
      const _wrapper = mountComponent()
      const button = _wrapper.find('[data-testid=logout-btn]')
      expect(button.exists()).toBe(true)
    })
  })
  describe('drawer toggle', () => {
    test<LocalTestCtx>('default', ({ wrapper, expect }) => {
      expect(wrapper.find('[data-testid=toggle-nav-btn]').exists()).toBe(true)
    })

    test<LocalTestCtx>('toggle', async ({ wrapper, expect }) => {
      const header = wrapper.findComponent(Header)
      const btn = wrapper.find('[data-testid=toggle-nav-btn]')
      const initStatus = header.props('drawer')

      await btn.trigger('click')
      expect(header.props('drawer')).toBe(!initStatus)
      await btn.trigger('click')
      expect(header.props('drawer')).toBe(initStatus)
    })
  })

  describe('login modal', () => {
    test<LocalTestCtx>('default', async ({ wrapper, expect }) => {
      expect(wrapper.findComponent('.login').exists()).toBe(false)
    })

    test<LocalTestCtx>('active', async ({ wrapper, expect }) => {
      await wrapper.find('[data-testid=open-login-btn]').trigger('click')
      const login = wrapper.findComponent('.login')
      expect(login.exists()).toBe(true)
    })

    test<LocalTestCtx>('toggle', async ({ wrapper, expect }) => {
      await wrapper.find('[data-testid=open-login-btn]').trigger('click')
      const login = wrapper.findComponent('.login')
      await login.find('button').trigger('click')
      expect(login.exists()).toBe(false)
      expect(wrapper.findComponent('.register').exists()).toBe(true)
    })
  })

  describe('register modal', async () => {
    test<LocalTestCtx>('default', async ({ wrapper, expect }) => {
      expect(wrapper.findComponent('.register').exists()).toBe(false)
    })

    test<LocalTestCtx>('active', async ({ wrapper, expect }) => {
      await wrapper.find('[data-testid=open-register-btn]').trigger('click')
      const register = wrapper.findComponent('.register')
      expect(register.exists()).toBe(true)
    })

    test<LocalTestCtx>('toggle', async ({ wrapper, expect }) => {
      await wrapper.find('[data-testid=open-register-btn]').trigger('click')
      const register = wrapper.findComponent('.register')
      expect(register.exists()).toBe(true)
      await register.find('button').trigger('click')
      expect(register.exists()).toBe(false)
      expect(wrapper.findComponent('.login').exists()).toBe(true)
    })
  })
})
