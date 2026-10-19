import type { z } from 'zod'

import type {
  createUserArgsSchema,
  updateProfileArgsSchema,
  updateUserArgsSchema,
  userLoginArgsSchema,
  userRegisterArgsSchema,
  userSchema,
} from '@/schemas/user'

export type UserLoginArgs = z.infer<typeof userLoginArgsSchema>
export type UserRegisterArgs = z.infer<typeof userRegisterArgsSchema>
export type User = z.infer<typeof userSchema>
export type CreateUserReq = z.infer<typeof createUserArgsSchema>
export type UpdateUserReq = z.infer<typeof updateUserArgsSchema>
export type UpdateProfileReq = z.infer<typeof updateProfileArgsSchema>
