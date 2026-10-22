import axios from '@/utils/axios'

import { apiTokenSchema, apiTokenWithSecretSchema, createAPITokenArgsSchema } from '@/schemas/apiToken'
import type { APIToken, CreateAPITokenReq } from '@/types/apiToken'

const baseURL = '/users'

// Tokens created before station access was required may have an empty
// station scope. They are harmless (the API caps them to no data) but unusable.
export const tokenHasNoStations = (token: APIToken) =>
  token.permissions.station_ids !== null && token.permissions.station_ids.length === 0

export const listApiTokens = async (userID: number) => {
  const { data } = await axios.get(`${baseURL}/${userID}/api-tokens`)
  return apiTokenSchema.array().parse(data)
}

export const createApiToken = async (userID: number, args: CreateAPITokenReq) => {
  const parsedArgs = createAPITokenArgsSchema.parse(args)
  const { data } = await axios.post(`${baseURL}/${userID}/api-tokens`, parsedArgs)
  return apiTokenWithSecretSchema.parse(data)
}

export const deleteApiToken = async (userID: number, tokenId: number) => {
  await axios.delete(`${baseURL}/${userID}/api-tokens/${tokenId}`)
}
