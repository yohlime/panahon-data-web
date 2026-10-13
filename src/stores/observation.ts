import { atom } from 'nanostores'

import axios from '@/utils/axios'

import {
  latestObservationSchema,
  paginatedStationObservationSchema,
  stationObservationSchema,
} from '@/schemas/observation'

const baseUrl = '/observations'

export const $page = atom(1)
export const $perPage = atom(100)

export const listObservations = async () => {
  const { data } = await axios.get(`${baseUrl}?page=${$page.get()}&per_page=${$perPage.get()}`)
  return paginatedStationObservationSchema.parse(data)
}

// Reads a single station's records via the public /observations?station_ids= list
// (the /stations/:id/observations routes require an API token, not cookie auth).
export const listStationRecords = async (stationID: number, page = 1, perPage = 10) => {
  const { data } = await axios.get(`${baseUrl}?station_ids=${stationID}&page=${page}&per_page=${perPage}`)
  return paginatedStationObservationSchema.parse(data)
}

export const listLatestObservations = async () => {
  const { data } = await axios.get(`${baseUrl}/latest`)
  return latestObservationSchema.array().parse(data)
}

export const listStationObservations = async (stationID: number) => {
  const { data } = await axios.get(`/stations/${stationID}/observations`)
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
