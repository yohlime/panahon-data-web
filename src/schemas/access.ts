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

export const createAccessRequestArgsSchema = z.object({
  station_ids: z.number().array().optional(),
  all_stations: z.boolean().optional(),
  variables: z.string().array().optional(),
  all_variables: z.boolean().optional(),
  max_days_history: z.number().min(1).max(365).optional(),
  reason: z.string().optional(),
})

export const updateUserAccessArgsSchema = z.object({
  station_ids: z.number().array().optional(),
  all_stations: z.boolean().optional(),
  variables: z.string().array().optional(),
  all_variables: z.boolean().optional(),
  max_days_history: z.number().min(1).max(365),
})
