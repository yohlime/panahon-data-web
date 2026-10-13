import type { z } from 'zod'

import type { latestObservationSchema, stationObservationSchema } from '@/schemas/observation'

export type StationObservation = z.infer<typeof stationObservationSchema>
export type LatestObservation = z.infer<typeof latestObservationSchema>
