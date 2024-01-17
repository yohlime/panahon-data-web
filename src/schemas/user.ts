import { z } from 'zod'

export const userLoginArgsSchema = z.object({
  username: z.string().regex(/^[a-z0-9]+$/, 'Must be alphanumeric'),
  password: z.string().min(6, 'Must contain at least 6 characters'),
})

export const userRegisterArgsSchema = z
  .object({
    full_name: z.string(),
    email: z.string().email(),
    username: z.string().regex(/^[a-z0-9]+$/, 'Must be alphanumeric'),
    password: z.string().min(6, 'Must contain at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

export const userSchema = z.object({
  username: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  roles: z.string().array().optional(),
  password_changed_at: z.coerce.date(),
  created_at: z.coerce.date(),
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
  .merge(accessTokenSchema)
  .merge(refreshTokenSchema)
