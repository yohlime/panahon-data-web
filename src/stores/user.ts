import { atom, computed } from 'nanostores'

import axios from '@/utils/axios'

import { userSchema } from '@/schemas/user'
import type { User, UserLoginArgs, UserRegisterArgs } from '@/types/user'

const baseUrl = '/users'

export const $authUser = atom<User | undefined>(undefined)

export const getUser = async () => {
  try {
    const { data } = await axios.get(`${baseUrl}/auth`)
    const user = userSchema.parse(data)
    $authUser.set(user)
    return user
  } catch (err) {
    $authUser.set(undefined)
    return undefined
  }
}

export const login = async (loginArgs: UserLoginArgs) => {
  try {
    await axios.post(`${baseUrl}/login`, loginArgs)
    return await getUser()
  } catch {
    $authUser.set(undefined)
    return undefined
  }
}

export const logout = async () => {
  try {
    await axios.post(`${baseUrl}/logout`)
    $authUser.set(undefined)
  } catch (err) {
    $authUser.set(undefined)
  }
}

export const register = async (registerArgs: UserRegisterArgs) => {
  try {
    const { status } = await axios.post(`${baseUrl}/register`, registerArgs)
    return status >= 200 && status < 300
  } catch (err) {
    return false
  }
}

export const $isLoggedIn = computed($authUser, (user) => user !== undefined && user.username?.length > 0)

export const $isAdmin = computed(
  [$isLoggedIn, $authUser],
  (isLoggedIn, user) =>
    isLoggedIn && user !== undefined && ['ADMIN', 'SUPERADMIN'].some((r) => user.roles?.includes(r)),
)

export const $isSuperAdmin = computed(
  [$isLoggedIn, $authUser],
  (isLoggedIn, user) => isLoggedIn && user?.roles !== undefined && user.roles?.includes('SUPERADMIN'),
)
