import { z } from 'zod'

import { makePaginatedSchema } from './common'

export const stationSchema = z.object({
  id: z.number(),
  name: z.string().min(2),
  lat: z.coerce.number().nullish(),
  lon: z.coerce.number().nullish(),
  elevation: z.coerce.number().nullish(),
  date_installed: z.string().nullish(),
  station_type: z.string().nullish().prefault('MO'),
  station_type2: z.string().nullish().prefault('Defaults'),
  mobile_number: z.string().nullish(),
  station_url: z.string().nullish(),
  address: z.string(),
  province: z.string(),
  region: z.string(),
  status: z.string().nullish().prefault('OFFLINE'),
})

export const paginatedStationSchema = makePaginatedSchema(stationSchema)
