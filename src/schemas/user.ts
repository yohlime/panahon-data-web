import { z } from 'zod'

import { makePaginatedSchema } from './common'

export const userLoginArgsSchema = z.object({
  username: z.string().regex(/^[a-z0-9]+$/, { error: 'Must be alphanumeric' }),
  password: z.string().min(6, { error: 'Must contain at least 6 characters' }),
})

export const userRegisterArgsSchema = z
  .object({
    full_name: z.string().min(1, { error: 'Required' }),
    email: z.email(),
    username: z.string().regex(/^[a-z0-9]+$/, { error: 'Must be alphanumeric' }),
    password: z.string().min(6, { error: 'Must contain at least 6 characters' }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'],
    error: "Passwords don't match",
  })

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  full_name: z.string(),
  email: z.email(),
  status: z.string(),
  roles: z.string().array().nullish(),
  password_changed_at: z.coerce.date(),
  created_at: z.coerce.date(),
  reviewed_by: z.number().nullish(),
  reviewed_at: z.coerce.date().nullish(),
  review_note: z.string().nullish(),
})

export const paginatedUserSchema = makePaginatedSchema(userSchema)

export const createUserArgsSchema = z.object({
  username: z.string().regex(/^[a-z0-9]+$/, { error: 'Must be alphanumeric' }),
  full_name: z.string().min(1, { error: 'Required' }),
  email: z.email(),
  password: z.string().min(6, { error: 'Must contain at least 6 characters' }),
  roles: z.string().array().optional(),
})

export const updateUserArgsSchema = z.object({
  id: z.number(),
  full_name: z.string().min(1, { error: 'Required' }).optional(),
  email: z.email().optional(),
  password: z.union([z.string().min(6, { error: 'Must contain at least 6 characters' }), z.literal('')]).optional(),
  roles: z.string().array().optional(),
})

export const accessTokenSchema = z.object({
  access_token: z.string(),
  access_token_expires_at: z.coerce.date(),
})

export const refreshTokenSchema = z.object({
  refresh_token: z.string(),
  refresh_token_expires_at: z.coerce.date(),
})

export const userSessionSchema = z
  .object({
    session_id: z.string(),
    user: userSchema,
  })
  .extend(accessTokenSchema.shape)
  .extend(refreshTokenSchema.shape)
