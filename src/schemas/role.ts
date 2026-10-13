import { z } from 'zod'

import { makePaginatedSchema } from './common'

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullish().prefault(''),
  updated_at: z.coerce.date(),
  created_at: z.coerce.date(),
})

export const paginatedRoleSchema = makePaginatedSchema(roleSchema)

export const createRoleArgsSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+$/i, { error: 'Must be alphanumeric' }),
  description: z.string().min(1, { error: 'Required' }),
})
