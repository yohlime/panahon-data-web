import type { z } from 'zod'

import type { userLoginArgsSchema, userRegisterArgsSchema, userSchema } from '@/schemas/user'

export type UserLoginArgs = z.infer<typeof userLoginArgsSchema>
export type UserRegisterArgs = z.infer<typeof userRegisterArgsSchema>
export type User = z.infer<typeof userSchema>
