import { action, atom } from 'nanostores'

import { $isSuperAdmin } from '@/stores/user'

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

export const route = (pathName?: string) => `${basePath}/${pathName ?? ''}`

export interface Route {
  name: string
  description?: string
  title: string
  to: string
  visible: boolean
  icon: string
}

export const $routes = atom<Route[]>([
  {
    name: 'index',
    title: 'Dashboard',
    to: route(),
    visible: true,
    icon: 'mdi-view-dashboard',
  },
  { name: 'stations', title: 'Weather Stations', to: route('stations'), visible: true, icon: 'mdi-weather-pouring' },
  { name: 'simcard', title: 'SIM Card', to: route('simcard'), visible: true, icon: 'mdi-sim' },
  { name: 'users', title: 'Users', to: route('users'), visible: $isSuperAdmin.get(), icon: 'mdi-account' },
  { name: 'roles', title: 'Roles', to: route('roles'), visible: $isSuperAdmin.get(), icon: 'mdi-account-badge' },
])

export const $activeRoute = atom($routes.get()[0])

export const setActiveRoute = action($activeRoute, 'setActiveRoute', (activeRoute, newRoute) => {
  activeRoute.set(newRoute)
})
