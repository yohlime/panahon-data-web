import { z } from 'zod'

export const apiTokenPermissionsSchema = z.object({
  station_ids: z.number().array().nullable(),
  variables: z.string().array().nullable(),
  max_days_history: z.number(),
})

export const apiTokenSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  token_prefix: z.string(),
  permissions: apiTokenPermissionsSchema,
  created_at: z.iso.datetime({ offset: true }),
  last_used_at: z.iso.datetime({ offset: true }).optional(),
})

export const apiTokenWithSecretSchema = apiTokenSchema.extend({
  token: z.string(),
})

export const createAPITokenArgsSchema = z.object({
  name: z.string().min(1),
  expires_at: z.string().optional(),
  permissions: apiTokenPermissionsSchema.optional(),
})
