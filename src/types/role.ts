import type { z } from 'zod'

import type { createRoleArgsSchema, roleSchema } from '@/schemas/role'

export type Role = z.infer<typeof roleSchema>
export type CreateRoleReq = z.infer<typeof createRoleArgsSchema>
