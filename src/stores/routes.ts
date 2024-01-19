import { persistentAtom } from '@nanostores/persistent'
import { action, computed } from 'nanostores'

import { $isAdmin, $isSuperAdmin } from '@/stores/user'

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

export const route = (pathName?: string) => `${basePath}/${pathName ?? ''}`

export interface Route {
  name: string
  description?: string
  title: string
  to: string
  visible?: boolean
  icon: string
}

const routes = [
  {
    name: 'index',
    title: 'Dashboard',
    to: route(),
    visible: true,
    icon: 'mdi-view-dashboard',
  },
  { name: 'stations', title: 'Weather Stations', to: route('stations'), visible: true, icon: 'mdi-weather-pouring' },
  { name: 'simcard', title: 'SIM Card', to: route('simcard'), visible: true, icon: 'mdi-sim' },
  { name: 'users', title: 'Users', to: route('users'), icon: 'mdi-account' },
  { name: 'roles', title: 'Roles', to: route('roles'), icon: 'mdi-account-badge' },
]

export const $routes = computed([$isAdmin, $isSuperAdmin], (isAdmin, isSuperAdmin) => {
  const needsSuperAdmin = ['users', 'roles']
  const needsAdmin: string[] = []
  return routes.map((r) => {
    if (needsSuperAdmin.includes(r.name)) {
      return { ...r, visible: isSuperAdmin }
    } else if (needsAdmin.includes(r.name)) {
      return { ...r, visible: isAdmin }
    }
    return r
  })
})

export const $activeRoute = persistentAtom<Route>('activeRoute', $routes.get()[0], {
  encode: JSON.stringify,
  decode: JSON.parse,
})

export const setActiveRoute = action($activeRoute, 'setActiveRoute', (activeRoute, newRoute) => {
  activeRoute.set(newRoute)
})
