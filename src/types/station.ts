import type { z } from 'zod'

import { stationSchema, stationStatsSchema } from '@/schemas/station'

export type Station = z.infer<typeof stationSchema>
export type StationStats = z.infer<typeof stationStatsSchema>
