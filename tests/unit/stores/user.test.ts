import axios from '@/utils/axios'
import { cleanStores, keepMount } from 'nanostores'

import { userSchema } from '@/schemas/user'
import { $authUser, $isAdmin, $isLoggedIn, $isSuperAdmin, login, logout, register, getUser } from '@/stores/user'

vi.mock('@/utils/axios')
vi.mock('@/schemas/user')

const user = {
  full_name: 'John Doe',
  username: 'jdoe2345',
  email: 'jdoe@email.com',
  password_changed_at: new Date(),
  created_at: new Date(),
}

const loginArgs = {
  username: user.username,
  password: 'secret',
}

const registerArgs = {
  username: user.username,
  password: loginArgs.password,
  confirm_password: loginArgs.password,
  email: user.email,
  full_name: user.full_name,
}

describe('$authUser', () => {
  beforeEach(() => {
    keepMount($authUser)
    keepMount($isLoggedIn)
    keepMount($isAdmin)
    keepMount($isSuperAdmin)
  })

  afterEach(() => {
    cleanStores($authUser, $isLoggedIn, $isAdmin, $isSuperAdmin)
  })

  describe('getUser', () => {
    test('default', async ({ expect }) => {
      vi.mocked(axios.get).mockResolvedValueOnce({ data: user })
      vi.mocked(userSchema.parse).mockReturnValueOnce(user)
      await expect(getUser()).resolves.toEqual(user)
      expect($authUser.get()).toEqual(user)
    })

    test('api error', async ({ expect }) => {
      vi.mocked(axios.get).mockRejectedValue({ response: { status: 404 } })
      await expect(getUser()).resolves.toBeUndefined()
      expect($authUser.get()).toBeUndefined()
    })

    test('parse error', async ({ expect }) => {
      vi.mocked(axios.get).mockResolvedValueOnce({ data: user })
      vi.mocked(userSchema.parse).mockImplementation(() => {
        throw new Error('parse error')
      })
      await expect(getUser()).resolves.toBeUndefined()
      expect($authUser.get()).toBeUndefined()
    })
  })

  describe('login', () => {
    test('success', async ({ expect }) => {
      vi.mocked(axios.post).mockResolvedValueOnce({ status: 204 })
      vi.mocked(axios.get).mockResolvedValueOnce({ data: user })
      vi.mocked(userSchema.parse).mockReturnValueOnce(user)

      await expect(login(loginArgs)).resolves.toEqual(user)
      expect($authUser.get()).toEqual(user)
    })

    test('api server error', async ({ expect }) => {
      vi.mocked(axios.post).mockRejectedValueOnce({ response: { status: 404 } })
      // login no longer swallows the error, so the form can show the reason
      await expect(login(loginArgs)).rejects.toBeDefined()
    })

    test('parse error', async ({ expect }) => {
      vi.mocked(axios.post).mockResolvedValueOnce({ status: 204 })
      vi.mocked(axios.get).mockResolvedValueOnce({ data: {} })
      vi.mocked(userSchema.parse).mockImplementation(() => {
        throw new Error('parse error')
      })
      await expect(login(loginArgs)).resolves.toBeUndefined()
      expect($authUser.get()).toBeUndefined()
    })
  })

  describe('logout', () => {
    test('success', async ({ expect }) => {
      $authUser.set(user)
      expect($authUser.get()).toEqual(user)
      await logout()
      expect($authUser.get()).toBeUndefined()
    })
  })

  describe('register', () => {
    test('success', async ({ expect }) => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        status: 204,
      })
      const success = await register(registerArgs)
      expect(success).toBeTruthy()
    })

    test('error', async ({ expect }) => {
      vi.mocked(axios.post).mockRejectedValueOnce({ response: { status: 404 } })
      const success = await register(registerArgs)
      expect(success).toBeFalsy()
    })
  })

  describe('$isLoggedIn', () => {
    test('true', ({ expect }) => {
      $authUser.set(user)
      expect($isLoggedIn.get()).toEqual(true)
    })

    test('false', async ({ expect }) => {
      $authUser.set(undefined)
      expect($isLoggedIn.get()).toEqual(false)
      $authUser.set({ ...user, username: '' })
      expect($isLoggedIn.get()).toEqual(false)
    })
  })

  describe('$isAdmin', () => {
    test('true', ({ expect }) => {
      $authUser.set({ ...user, roles: ['ADMIN'] })
      expect($isAdmin.get(), 'only `ADMIN`').toEqual(true)
      $authUser.set({ ...user, roles: ['ADMIN', 'TOMATO'] })
      expect($isAdmin.get(), 'has `ADMIN`').toEqual(true)
      $authUser.set({ ...user, roles: ['SUPERADMIN', 'USER'] })
      expect($isAdmin.get(), 'has `SUPERADMIN`').toEqual(true)
    })

    test('false', ({ expect }) => {
      $authUser.set(user)
      expect($isAdmin.get(), 'no `roles`').toEqual(false)
      $authUser.set({ ...user, roles: [] })
      expect($isAdmin.get(), 'empty `roles`').toEqual(false)
      $authUser.set({ ...user, roles: ['USER', 'POTATO'] })
      expect($isAdmin.get(), 'not admin or superadmin').toEqual(false)
      $authUser.set(undefined)
      expect($isAdmin.get(), 'undefined `user`').toEqual(false)
      $authUser.set({ ...user, username: '', roles: ['ADMIN'] })
      expect($isAdmin.get(), 'empty `username`').toEqual(false)
    })
  })

  describe('$isSuperAdmin', () => {
    test('true', ({ expect }) => {
      $authUser.set({ ...user, roles: ['SUPERADMIN'] })
      expect($isSuperAdmin.get(), 'only `SUPERADMIN`').toEqual(true)
      $authUser.set({ ...user, roles: ['SUPERADMIN', 'USER'] })
      expect($isSuperAdmin.get(), 'has `SUPERADMIN`').toEqual(true)
    })

    test('false', ({ expect }) => {
      $authUser.set(user)
      expect($isSuperAdmin.get(), 'no `roles`').toEqual(false)
      $authUser.set({ ...user, roles: [] as string[] })
      expect($isSuperAdmin.get(), 'empty `roles`').toEqual(false)
      $authUser.set({ ...user, roles: ['USER', 'POTATO'] })
      expect($isSuperAdmin.get(), 'no `SUPERADMIN`').toEqual(false)
      $authUser.set({ ...user, roles: ['ADMIN'] })
      expect($isSuperAdmin.get(), 'only `ADMIN`').toEqual(false)
      $authUser.set({ ...user, roles: ['ADMIN', 'TOMATO'] })
      expect($isSuperAdmin.get(), 'has `ADMIN`').toEqual(false)
      $authUser.set(undefined)
      expect($isSuperAdmin.get(), 'undefined `user`').toEqual(false)
      $authUser.set({ ...user, username: '', roles: ['SUPERADMIN'] })
      expect($isSuperAdmin.get(), 'empty `username`').toEqual(false)
    })
  })
})
