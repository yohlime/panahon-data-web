import type { z } from 'zod'

import type {
  accessRequestSchema,
  createAccessRequestArgsSchema,
  updateUserAccessArgsSchema,
  userAccessSchema,
} from '@/schemas/access'

export type UserAccess = z.infer<typeof userAccessSchema>
export type AccessRequest = z.infer<typeof accessRequestSchema>
export type AccessRequestStatus = AccessRequest['status']
export type CreateAccessRequestReq = z.infer<typeof createAccessRequestArgsSchema>
export type UpdateUserAccessReq = z.infer<typeof updateUserAccessArgsSchema>
