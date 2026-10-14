import { atom, computed } from 'nanostores'

import { $isAdmin, $isLoggedIn, $isSuperAdmin } from '@/stores/user'

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
    name: 'stations',
    title: 'Weather Stations',
    to: route('stations'),
    visible: true,
    icon: 'mdi-weather-pouring',
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

export const $routes = computed(
  [$isLoggedIn, $isAdmin, $isSuperAdmin],
  (isLoggedIn, isAdmin, isSuperAdmin) => {
    const needsSuperAdmin = ['users', 'roles']
    const needsAdmin = ['requests']
    // Admins have unrestricted access, so they never need to request it.
    const needsNonAdmin = ['access']
    return routes.map((r) => {
      if (needsSuperAdmin.includes(r.name)) {
        return { ...r, visible: isSuperAdmin }
      } else if (needsAdmin.includes(r.name)) {
        return { ...r, visible: isAdmin }
      } else if (needsNonAdmin.includes(r.name)) {
        return { ...r, visible: isLoggedIn && !isAdmin }
      }
      return r
    })
  },
)

export const $mainRoutes = computed($routes, (routes) => routes.filter((r) => r.group === 'main' && r.visible))
export const $settingRoutes = computed($routes, (routes) => routes.filter((r) => r.group === 'settings' && r.visible))

export const $activeRoute = atom($routes.get()[0])

export const setActiveRoute = (newRoute: Route) => {
  $activeRoute.set(newRoute)
}
