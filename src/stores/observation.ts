import { atom } from 'nanostores'

import axios from '@/utils/axios'

import {
  createStationObsArgsSchema,
  latestObservationSchema,
  paginatedStationObservationSchema,
  stationObservationSchema,
  updateStationObsArgsSchema,
} from '@/schemas/observation'
import type { CreateStationObsReq, UpdateStationObsReq } from '@/types/observation'

const baseUrl = '/observations'

export const $page = atom(1)
export const $perPage = atom(100)

export const listObservations = async () => {
  const { data } = await axios.get(`${baseUrl}?page=${$page.get()}&per_page=${$perPage.get()}`)
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

export const createStationObservation = async (stationID: number, args: CreateStationObsReq) => {
  const parsed = createStationObsArgsSchema.parse(args)
  const { data } = await axios.post(`/stations/${stationID}/observations`, parsed)
  return stationObservationSchema.parse(data)
}

export const updateStationObservation = async (stationID: number, args: UpdateStationObsReq) => {
  const parsed = updateStationObsArgsSchema.parse(args)
  const { data } = await axios.put(`/stations/${stationID}/observations/${parsed.id}`, parsed)
  return stationObservationSchema.parse(data)
}

export const deleteStationObservation = async (stationID: number, id: number) => {
  await axios.delete(`/stations/${stationID}/observations/${id}`)
}
