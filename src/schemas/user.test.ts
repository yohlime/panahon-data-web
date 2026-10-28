import { describe, expect, it } from 'vitest'

import {
  completeRegistrationArgsSchema,
  passwordResetArgsSchema,
  updateProfileArgsSchema,
  updateUserArgsSchema,
  userLoginArgsSchema,
  userRegisterArgsSchema,
} from '@/schemas/user'

describe('password minimum length', () => {
  it('rejects passwords shorter than 8 characters for new accounts and resets', () => {
    expect(
      userRegisterArgsSchema.safeParse({
        full_name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'short12',
        confirm_password: 'short12',
      }).success,
    ).toBe(false)

    expect(
      completeRegistrationArgsSchema.safeParse({
        token: 'token',
        password: 'short12',
        confirm_password: 'short12',
      }).success,
    ).toBe(false)

    expect(
      passwordResetArgsSchema.safeParse({
        token: 'token',
        password: 'short12',
        confirm_password: 'short12',
      }).success,
    ).toBe(false)

    expect(updateUserArgsSchema.safeParse({ id: 1, password: 'short12' }).success).toBe(false)
    expect(
      updateProfileArgsSchema.safeParse({
        current_password: 'oldpass',
        username: 'testuser',
        email: '',
        password: 'short12',
      }).success,
    ).toBe(false)
  })

  it('accepts 8-character passwords', () => {
    expect(
      passwordResetArgsSchema.safeParse({
        token: 'token',
        password: 'longpass',
        confirm_password: 'longpass',
      }).success,
    ).toBe(true)
  })

  it('requires matching passwords', () => {
    expect(
      passwordResetArgsSchema.safeParse({
        token: 'token',
        password: 'longpass',
        confirm_password: 'longpas2',
      }).success,
    ).toBe(false)
  })

  it('keeps login compatible with legacy 6-character passwords', () => {
    expect(userLoginArgsSchema.safeParse({ username: 'testuser', password: 'short6' }).success).toBe(true)
  })
})
