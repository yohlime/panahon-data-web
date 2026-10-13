import { atom, computed } from 'nanostores'

import { $isAdmin, $isSuperAdmin } from '@/stores/user'

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

export const route = (pathName?: string) => `${basePath}/${pathName ?? ''}`

export type RouteGroup = 'main' | 'settings'

export type Route = {
  name: string
  description?: string
  title: string
  to: string
  visible?: boolean
  icon: string
  group: RouteGroup
}

const routes: Route[] = [
  {
    name: 'index',
    title: 'Dashboard',
    to: route(),
    visible: true,
    icon: 'mdi-view-dashboard',
    group: 'main',
  },
  {
    name: 'stations',
    title: 'Weather Stations',
    to: route('stations'),
    visible: true,
    icon: 'mdi-weather-pouring',
    group: 'main',
  },
  {
    name: 'observations',
    title: 'Observations',
    to: route('observations'),
    visible: true,
    icon: 'mdi-weather-partly-rainy',
    group: 'main',
  },
  { name: 'simcard', title: 'SIM Card', to: route('simcard'), visible: false, icon: 'mdi-sim', group: 'main' },
  { name: 'profile', title: 'Profile', to: route('settings'), visible: true, icon: 'mdi-account-cog', group: 'settings' },
  {
    name: 'access',
    title: 'API Access',
    to: route('settings/access'),
    visible: true,
    icon: 'mdi-key-chain',
    group: 'settings',
  },
  { name: 'requests', title: 'API Requests', to: route('settings/requests'), icon: 'mdi-clipboard-check', group: 'settings' },
  { name: 'users', title: 'Users', to: route('users'), icon: 'mdi-account', group: 'settings' },
  { name: 'roles', title: 'Roles', to: route('roles'), icon: 'mdi-account-badge', group: 'settings' },
]

export const $routes = computed([$isAdmin, $isSuperAdmin], (isAdmin, isSuperAdmin) => {
  const needsSuperAdmin = ['users', 'roles']
  const needsAdmin = ['requests']
  return routes.map((r) => {
    if (needsSuperAdmin.includes(r.name)) {
      return { ...r, visible: isSuperAdmin }
    } else if (needsAdmin.includes(r.name)) {
      return { ...r, visible: isAdmin }
    }
    return r
  })
})

export const $mainRoutes = computed($routes, (routes) => routes.filter((r) => r.group === 'main' && r.visible))
export const $settingRoutes = computed($routes, (routes) => routes.filter((r) => r.group === 'settings' && r.visible))

export const $activeRoute = atom($routes.get()[0])

export const setActiveRoute = (newRoute: Route) => {
  $activeRoute.set(newRoute)
}
