import { atom, computed } from 'nanostores'

import axios from '@/utils/axios'

import {
  createUserArgsSchema,
  paginatedUserSchema,
  updateUserArgsSchema,
  userSchema,
} from '@/schemas/user'
import type { CreateUserReq, UpdateUserReq, User, UserLoginArgs, UserRegisterArgs } from '@/types/user'

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

// Shared query fn for the ['auth','user'] Vue Query cache.
export const fetchAuthUser = async () => (await getUser()) ?? null

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
    if (status < 200 || status >= 300) return false
    // Registration does not open a session, so log in to gain authentication.
    await login({ username: registerArgs.username, password: registerArgs.password })
    return true
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
  (isLoggedIn, user) =>
    isLoggedIn && user?.roles !== undefined && user.roles?.includes('SUPERADMIN'),
)

export const $page = atom(1)
export const $perPage = atom(10)

export const listUsers = async () => {
  const { data } = await axios.get(`${baseUrl}?page=${$page.get()}&per_page=${$perPage.get()}`)
  return paginatedUserSchema.parse(data)
}

export const getUserByID = async (userID?: number) => {
  if (!userID) return
  const { data } = await axios.get(`${baseUrl}/${userID}`)
  return userSchema.parse(data)
}

export const createUser = async (args: CreateUserReq) => {
  const parsed = createUserArgsSchema.parse(args)
  const { data } = await axios.post(baseUrl, parsed)
  return userSchema.parse(data)
}

export const updateUser = async (args: UpdateUserReq) => {
  const parsed = updateUserArgsSchema.parse(args)
  const { data } = await axios.put(`${baseUrl}/${parsed.id}`, parsed)
  return userSchema.parse(data)
}

export const deleteUser = async (userID: number) => {
  await axios.delete(`${baseUrl}/${userID}`)
}
