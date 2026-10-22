import type { z } from 'zod'

import { stationInputSchema, stationSchema, stationStatsSchema } from '@/schemas/station'

export type Station = z.infer<typeof stationSchema>
export type StationInput = z.infer<typeof stationInputSchema>
export type StationStats = z.infer<typeof stationStatsSchema>
