import { z } from 'zod'

export const userLoginArgsSchema = z.object({
  username: z.string().regex(/^[a-z0-9]+$/, { error: 'Must be alphanumeric' }),
  password: z.string().min(6, { error: 'Must contain at least 6 characters' }),
})

export const userRegisterArgsSchema = z
  .object({
    full_name: z.string(),
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
  username: z.string(),
  full_name: z.string(),
  email: z.email(),
  roles: z.string().array().nullish(),
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
  .extend(accessTokenSchema.shape)
  .extend(refreshTokenSchema.shape)
