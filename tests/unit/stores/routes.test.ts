import { cleanStores, keepMount } from 'nanostores'

import { $activeRoute, $routes, setActiveRoute } from '@/stores/routes'

const routes = [
  {
    name: 'index',
    to: '/',
  },
  {
    name: 'user',
    to: '/user',
  },
  {
    name: 'login',
    to: '/login',
  },
]

describe('$routes', () => {
  beforeEach(() => {
    keepMount($activeRoute)
  })

  afterEach(() => {
    cleanStores($activeRoute)
  })

  describe('$activeRoute', () => {
    test('default', ({ expect }) => {
      const defaultRoute = $routes.get().find(({ name }) => name === 'index')
      expect($activeRoute.get()).toEqual(defaultRoute)
    })

    test('set', ({ expect }) => {
      for (const route of routes) {
        setActiveRoute(route)
        expect($activeRoute.get()).toEqual(route)
      }
    })
  })
})
