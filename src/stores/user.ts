import { atom, computed } from 'nanostores'

import axios from '@/utils/axios'

import {
  createUserArgsSchema,
  paginatedUserSchema,
  updateProfileArgsSchema,
  updateUserArgsSchema,
  userSchema,
} from '@/schemas/user'
import type {
  CreateUserReq,
  UpdateProfileReq,
  UpdateUserReq,
  User,
  UserLoginArgs,
  UserRegisterArgs,
} from '@/types/user'

const baseUrl = '/users'

export const $authUser = atom<User | undefined>(undefined)

export const $authUserID = computed($authUser, (user) => user?.id)

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
  await axios.post(`${baseUrl}/login`, loginArgs)
  return await getUser()
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
    // Registration is pending admin approval; no session is opened here.
    return status >= 200 && status < 300
  } catch {
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

export const listUsers = async (params?: { status?: string; page?: number; perPage?: number }) => {
  const page = params?.page ?? $page.get()
  const perPage = params?.perPage ?? $perPage.get()
  const status = params?.status ? `&status=${params.status}` : ''
  const { data } = await axios.get(`${baseUrl}?page=${page}&per_page=${perPage}${status}`)
  return paginatedUserSchema.parse(data)
}

export const approveUser = async (userID: number, note?: string) => {
  const { data } = await axios.post(`${baseUrl}/${userID}/approve`, { note })
  return userSchema.parse(data)
}

export const rejectUser = async (userID: number, note: string) => {
  const { data } = await axios.post(`${baseUrl}/${userID}/reject`, { note })
  return userSchema.parse(data)
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

export const updateProfile = async (userID: number, args: UpdateProfileReq) => {
  const parsed = updateProfileArgsSchema.parse(args)
  const { data } = await axios.put(`${baseUrl}/${userID}/profile`, parsed)
  return userSchema.parse(data)
}

export const deleteUser = async (userID: number) => {
  await axios.delete(`${baseUrl}/${userID}`)
}
