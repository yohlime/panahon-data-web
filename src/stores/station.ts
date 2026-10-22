import { atom } from 'nanostores'

import axios from '@/utils/axios'

import { paginatedStationSchema, stationSchema, stationStatsSchema } from '@/schemas/station'
import type { Station } from '@/types/station'

const baseURL = '/stations'

export const stationTypes = [
  { name: 'MO', opts: ['Default', 'Data:Globe', 'Data:Smart'] },
  { name: 'SMS', opts: ['Globe', 'Smart'] },
  { name: 'Others', opts: ['WIFI', 'Test'] },
]

export const statusOptions = [
  {
    value: 'ONLINE',
    text: 'ONLINE',
  },
  {
    value: 'OFFLINE',
    text: 'OFFLINE',
    disabled: true,
  },
  {
    value: 'ERROR',
    text: 'ERROR',
    disabled: true,
  },
  {
    value: 'INACTIVE',
    text: 'INACTIVE',
  },
]

export const $page = atom(1)
export const $perPage = atom(10)

export const listStations = async () => {
  const url = `${baseURL}?page=${$page.get()}&per_page=${$perPage.get()}&accessible=true`
  const { data } = await axios.get(url)
  const s = paginatedStationSchema.parse(data)
  return s
}

// Aggregate counts for the dashboard. The list endpoint is paginated, so the
// cards must not be computed from a single page.
export const getStationStats = async (accessible = true) => {
  const { data } = await axios.get(`${baseURL}/stats${accessible ? '?accessible=true' : ''}`)
  return stationStatsSchema.parse(data)
}

// All stations (the list endpoint is public) for pickers.
export const listAllStations = async () => {
  const { data } = await axios.get(`${baseURL}?page=1&per_page=1000`)
  return paginatedStationSchema.parse(data)
}

export const getStation = async (stnID?: number) => {
  if (stnID) {
    const url = `${baseURL}/${stnID}`
    const { data } = await axios.get(url)
    return stationSchema.parse(data)
  }
}

export const createOrUpdateStation = async (station: Station) => {
  const { date_installed } = station
  const stn = { ...station, date_installed: date_installed !== '' ? date_installed : '0001-01-01' }
  const { data } = stn.id ? await axios.put(`${baseURL}/${stn.id}`, stn) : await axios.post(baseURL, stn)
  return stationSchema.parse(data)
}

export const deleteStation = async (stnID: number) => {
  await axios.delete(`${baseURL}/${stnID}`)
}
