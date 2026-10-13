import axios from '@/utils/axios'

import {
  latestObservationSchema,
  paginatedStationObservationSchema,
  stationObservationSchema,
} from '@/schemas/observation'

export const listLatestObservations = async () => {
  const { data } = await axios.get('/observations/latest')
  return latestObservationSchema.array().parse(data)
}

export const listStationObservations = async (stationID: number, page = 1, perPage = 10) => {
  const { data } = await axios.get(`/stations/${stationID}/observations?page=${page}&per_page=${perPage}`)
  return paginatedStationObservationSchema.parse(data)
}

export const getStationObservation = async (stationID: number, id: number) => {
  const { data } = await axios.get(`/stations/${stationID}/observations/${id}`)
  return stationObservationSchema.parse(data)
}

export const getLatestStationObservation = async (stationID: number) => {
  const { data } = await axios.get(`/stations/${stationID}/observations/latest`)
  return latestObservationSchema.parse(data)
}
