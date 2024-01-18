import { cleanStores, keepMount } from 'nanostores'

import { $activeRoute, $routes, setActiveRoute } from '@/stores/routes'

describe('$routes', () => {
  beforeEach(() => {
    keepMount($routes)
  })

  afterEach(() => {
    cleanStores($routes)
  })

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

  describe('$activeRoute', () => {
    test('default', () => {
      const defaultRoute = $routes.get().find(({ name }) => name === 'index')
      expect($activeRoute.get()).toEqual(defaultRoute)
    })

    test('set', () => {
      for (const route of routes) {
        setActiveRoute(route)
        expect($activeRoute.get()).toEqual(route)
      }
    })
  })
})
