import type { z } from 'zod'

import { stationSchema } from '@/schemas/station'

export type Station = z.infer<typeof stationSchema>
