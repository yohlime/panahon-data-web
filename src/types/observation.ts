import type { z } from 'zod'

import type {
  createStationObsArgsSchema,
  latestObservationSchema,
  stationObservationSchema,
  updateStationObsArgsSchema,
} from '@/schemas/observation'

export type StationObservation = z.infer<typeof stationObservationSchema>
export type LatestObservation = z.infer<typeof latestObservationSchema>
export type CreateStationObsReq = z.infer<typeof createStationObsArgsSchema>
export type UpdateStationObsReq = z.infer<typeof updateStationObsArgsSchema>
