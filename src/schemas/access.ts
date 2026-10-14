import { z } from 'zod'

import { makePaginatedSchema } from './common'

export const ACCESS_VARIABLES = ['pres', 'rain', 'rh', 'temp', 'td', 'wind', 'windx', 'srad', 'hi', 'wchill'] as const

export const userAccessSchema = z.object({
  user_id: z.number(),
  station_ids: z.number().array().nullable(),
  variables: z.string().array().nullable(),
  max_days_history: z.number(),
  updated_at: z.coerce.date(),
})

export const accessRequestStatusSchema = z.enum(['pending', 'approved', 'denied'])

export const accessRequestSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  station_ids: z.number().array().nullable(),
  all_stations: z.boolean(),
  variables: z.string().array().nullable(),
  all_variables: z.boolean(),
  max_days_history: z.number().nullable(),
  reason: z.string(),
  status: accessRequestStatusSchema,
  reviewed_by: z.number().nullable(),
  review_note: z.string(),
  reviewed_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
})

export const paginatedAccessRequestSchema = makePaginatedSchema(accessRequestSchema)

// -1 means unlimited; otherwise at least one day (values above 365 are allowed).
const maxDaysHistorySchema = z
  .number()
  .int()
  .refine((v) => v === -1 || v >= 1, { message: 'History must be -1 (unlimited) or at least 1 day' })

export const createAccessRequestArgsSchema = z.object({
  station_ids: z.number().array().optional(),
  all_stations: z.boolean().optional(),
  variables: z.string().array().optional(),
  all_variables: z.boolean().optional(),
  max_days_history: maxDaysHistorySchema.optional(),
  reason: z.string().optional(),
})

export const updateUserAccessArgsSchema = z.object({
  station_ids: z.number().array().optional(),
  all_stations: z.boolean().optional(),
  variables: z.string().array().optional(),
  all_variables: z.boolean().optional(),
  max_days_history: maxDaysHistorySchema,
})
