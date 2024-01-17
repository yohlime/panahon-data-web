import axios from '@/utils/axios'
import { cleanStores, keepMount } from 'nanostores'

import { userSchema } from '@/schemas/user'
import {
  $authUser,
  $isAdmin,
  $isLoggedIn,
  $isSuperAdmin,
  getUser,
  login,
  logout,
  register,
  setUser,
} from '@/stores/user'
import type { User, UserRegisterArgs } from '@/types/user'
import { ZodError } from 'zod'

vi.mock('_axios')
vi.mock('@/utils/axios')
vi.mock('@/schemas/user')

describe('$authUser', () => {
  beforeEach(() => {
    keepMount($authUser)
  })

  afterEach(() => {
    cleanStores($authUser)
  })

  describe('getUser', () => {
    it('should initialize user', async () => {
      const user: User = {
        full_name: 'John Doe',
        username: 'jdoe2345',
        email: 'jdoe@email.com',
        password_changed_at: new Date(),
        created_at: new Date(),
      }
      vi.mocked(axios.get).mockResolvedValueOnce({ data: user })
      const newUser = await getUser()

      expect($authUser.get()).toEqual(newUser)
    })
  })

  describe('setUser', () => {
    it('should set authUser', () => {
      const user: User = {
        full_name: 'John Doe',
        username: 'jdoe2345',
        email: 'jdoe@email.com',
        password_changed_at: new Date(),
        created_at: new Date(),
      }
      setUser(user)
      expect($authUser.get()).toEqual(user)
    })

    it('should set authUser to `{}` if no data is passed', () => {
      setUser()
      expect($authUser.get()).toEqual({})
    })
  })

  describe('login', () => {
    const loginArgs = {
      username: 'jdoe2345',
      password: 'secret',
    }

    const user: User = {
      full_name: 'John Doe',
      username: loginArgs.username,
      email: 'jdoe@email.com',
      password_changed_at: new Date(),
      created_at: new Date(),
    }

    it('should set authUser on successful login', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({ status: 204 })
      vi.mocked(axios.get).mockResolvedValueOnce({ data: user })
      vi.mocked(userSchema.parse).mockReturnValueOnce(user)

      await login(loginArgs)
      expect($authUser.get()).toEqual(user)
    })

    it('should throw on api server error', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce({ response: { status: 404 } })
      await expect(login(loginArgs)).rejects.toThrowError()
    })

    it('should throw on parse error', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({ status: 204 })
      vi.mocked(axios.get).mockResolvedValueOnce({ data: {} })
      vi.mocked(userSchema.parse).mockImplementation(() => {
        throw new ZodError([])
      })

      await expect(login(loginArgs)).rejects.toThrowError()
    })
  })

  describe('logout', () => {
    const user: User = {
      full_name: 'John Doe',
      username: 'jdoe2345',
      email: 'jdoe@email.com',
      password_changed_at: new Date(),
      created_at: new Date(),
    }

    it('should unset authUser', async () => {
      $authUser.set(user)
      expect($authUser.get()).toEqual(user)
      await logout()
      expect($authUser.get()).toEqual({})
    })
  })

  describe('register', () => {
    const regArgs: UserRegisterArgs = {
      username: 'jdoe2345',
      password: 'secret',
      confirm_password: 'secret',
      email: 'jdoe@email.com',
      full_name: 'John Doe',
    }

    const user: User = {
      full_name: regArgs.full_name,
      username: regArgs.username,
      email: regArgs.email,
      password_changed_at: new Date(),
      created_at: new Date(),
    }

    it('should return `true` on success', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        status: 204,
      })
      const success = await register(regArgs)
      expect(success).toBeTruthy()
    })

    it('should return `false` on error', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce({ response: { status: 404 } })
      const success = await register(regArgs)
      expect(success).toBeFalsy()
    })
  })

  describe('$isLoggedIn', () => {
    beforeEach(() => {
      keepMount($isLoggedIn)
    })

    afterEach(() => {
      cleanStores($isLoggedIn)
    })

    it('should be `true` when $authuser.username is set', () => {
      $authUser.set({ username: 'testuser' } as User)
      expect($isLoggedIn.get()).toEqual(true)
    })

    it('should be `false` when $authuser is empty', async () => {
      $authUser.set({} as User)
      expect($isLoggedIn.get()).toEqual(false)
    })
  })

  describe('$isAdmin', () => {
    beforeEach(() => {
      keepMount($isAdmin)
    })

    afterEach(() => {
      cleanStores($isAdmin)
    })

    it('should be true when $authuser.roles includes `ADMIN` or `SUPERADMIN`', () => {
      $authUser.set({ username: 'testuser' } as User)
      expect($isAdmin.get()).toEqual(false)
      $authUser.set({ username: 'testuser', roles: [] as string[] } as User)
      expect($isAdmin.get()).toEqual(false)
      $authUser.set({ username: 'testuser', roles: ['USER', 'POTATO'] } as User)
      expect($isAdmin.get()).toEqual(false)
      $authUser.set({ username: 'testuser', roles: ['ADMIN'] } as User)
      expect($isAdmin.get()).toEqual(true)
      $authUser.set({ username: 'testuser', roles: ['ADMIN', 'TOMATO'] } as User)
      expect($isAdmin.get()).toEqual(true)
      $authUser.set({ username: 'testuser', roles: ['SUPERADMIN', 'USER'] } as User)
      expect($isAdmin.get()).toEqual(true)
    })
  })

  describe('$isSuperAdmin', () => {
    beforeEach(() => {
      keepMount($isSuperAdmin)
    })

    afterEach(() => {
      cleanStores($isSuperAdmin)
    })

    it('should be true when $authuser.roles includes `SUPERADMIN`', () => {
      $authUser.set({ username: 'testuser' } as User)
      expect($isSuperAdmin.get()).toEqual(false)
      $authUser.set({ username: 'testuser', roles: [] as string[] } as User)
      expect($isSuperAdmin.get()).toEqual(false)
      $authUser.set({ username: 'testuser', roles: ['USER', 'POTATO'] } as User)
      expect($isSuperAdmin.get()).toEqual(false)
      $authUser.set({ username: 'testuser', roles: ['ADMIN'] } as User)
      expect($isSuperAdmin.get()).toEqual(false)
      $authUser.set({ username: 'testuser', roles: ['ADMIN', 'TOMATO'] } as User)
      expect($isSuperAdmin.get()).toEqual(false)
      $authUser.set({ username: 'testuser', roles: ['SUPERADMIN', 'USER'] } as User)
      expect($isSuperAdmin.get()).toEqual(true)
    })
  })
})
