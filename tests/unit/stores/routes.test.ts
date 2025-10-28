import { cleanStores, keepMount } from 'nanostores'

import { $activeRoute, $routes, setActiveRoute, type Route } from '@/stores/routes'

const routes: Route[] = [
  {
    title: 'Route 1',
    name: 'index',
    to: '/',
    icon: 'test-icon',
  },
  {
    title: 'Route 2',
    name: 'user',
    to: '/user',
    icon: 'test-icon',
  },
  {
    title: 'Route 3',
    name: 'login',
    to: '/login',
    icon: 'test-icon',
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
