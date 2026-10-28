import type { z } from 'zod'

import type {
  completeRegistrationArgsSchema,
  createUserArgsSchema,
  createUserResponseSchema,
  passwordResetArgsSchema,
  passwordResetInfoSchema,
  passwordResetLinkResponseSchema,
  registrationInfoSchema,
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
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>
export type UpdateUserReq = z.infer<typeof updateUserArgsSchema>
export type UpdateProfileReq = z.infer<typeof updateProfileArgsSchema>
export type RegistrationInfo = z.infer<typeof registrationInfoSchema>
export type CompleteRegistrationReq = z.infer<typeof completeRegistrationArgsSchema>
export type PasswordResetReq = z.infer<typeof passwordResetArgsSchema>
export type PasswordResetInfo = z.infer<typeof passwordResetInfoSchema>
export type PasswordResetLinkResponse = z.infer<typeof passwordResetLinkResponseSchema>
