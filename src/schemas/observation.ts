import { z } from 'zod'

import { makePaginatedSchema } from './common'

export const stationObservationSchema = z.object({
  id: z.number(),
  station_id: z.number(),
  qc_level: z.number(),
  pres: z.coerce.number().nullish(),
  rr: z.coerce.number().nullish(),
  rh: z.coerce.number().nullish(),
  temp: z.coerce.number().nullish(),
  td: z.coerce.number().nullish(),
  wdir: z.coerce.number().nullish(),
  wspd: z.coerce.number().nullish(),
  wspdx: z.coerce.number().nullish(),
  srad: z.coerce.number().nullish(),
  mslp: z.coerce.number().nullish(),
  hi: z.coerce.number().nullish(),
  wchill: z.coerce.number().nullish(),
  timestamp: z.coerce.date(),
})

export const paginatedStationObservationSchema = makePaginatedSchema(stationObservationSchema)

const latestObsSchema = z.object({
  rain: z.coerce.number().nullish(),
  temp: z.coerce.number().nullish(),
  rh: z.coerce.number().nullish(),
  wdir: z.coerce.number().nullish(),
  wspd: z.coerce.number().nullish(),
  srad: z.coerce.number().nullish(),
  mslp: z.coerce.number().nullish(),
  tn: z.coerce.number().nullish(),
  tx: z.coerce.number().nullish(),
  gust: z.coerce.number().nullish(),
  rain_accum: z.coerce.number().nullish(),
  tn_timestamp: z.coerce.date().nullish(),
  tx_timestamp: z.coerce.date().nullish(),
  gust_timestamp: z.coerce.date().nullish(),
  timestamp: z.coerce.date().nullish(),
})

export const latestObservationSchema = z.object({
  id: z.number(),
  name: z.string(),
  lat: z.coerce.number().nullish(),
  lon: z.coerce.number().nullish(),
  elevation: z.coerce.number().nullish(),
  address: z.string().nullish(),
  obs: latestObsSchema,
})
