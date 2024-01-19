import { persistentAtom } from '@nanostores/persistent'
import { action, computed } from 'nanostores'

import axios from '@/utils/axios'

import { API_URL } from '@/stores/common'

import { userSchema } from '@/schemas/user'
import type { User, UserLoginArgs, UserRegisterArgs } from '@/types/user'

const base_url = `${API_URL}/users`

export const $authUser = persistentAtom<User | undefined>('authUser', undefined, {
  encode: JSON.stringify,
  decode: JSON.parse,
})

export const getUser = action($authUser, 'getUser', async (_user) => {
  const { data } = await axios.get(`${base_url}/auth`)
  const user = userSchema.parse(data)
  _user.set(user)
  return user
})

export const setUser = action($authUser, 'setUser', (user, newUser?: User) => {
  user.set(newUser)
})

export const login = action($authUser, 'login', async (_user, loginArgs: UserLoginArgs) => {
  const { status } = await axios.post(`${base_url}/login`, loginArgs)
  if (status >= 200 && status < 300) {
    const { data } = await axios.get(`${base_url}/auth`)
    const user = userSchema.parse(data)
    _user.set(user)
    return
  }
})

export const logout = action($authUser, 'logout', async (_user) => {
  try {
    await axios.post(`${base_url}/logout`)
    _user.set(undefined)
  } catch (error) {
    _user.set(undefined)
  }
})

export const register = async (registerArgs: UserRegisterArgs) => {
  try {
    const { status } = await axios.post(`${base_url}/register`, registerArgs)
    return status >= 200 && status < 300
  } catch (err) {
    return false
  }
}

export const $isLoggedIn = computed($authUser, (user) => user !== undefined && user.username.length > 0)

export const $isAdmin = computed(
  [$isLoggedIn, $authUser],
  (isLoggedIn, user) => isLoggedIn && user !== undefined && ['ADMIN', 'SUPERADMIN'].some((r) => user.roles?.includes(r))
)

export const $isSuperAdmin = computed(
  [$isLoggedIn, $authUser],
  (isLoggedIn, user) => isLoggedIn && user?.roles !== undefined && user.roles.includes('SUPERADMIN')
)
