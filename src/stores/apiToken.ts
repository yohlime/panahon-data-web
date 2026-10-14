import axios from '@/utils/axios'

import { apiTokenSchema, apiTokenWithSecretSchema, createAPITokenArgsSchema } from '@/schemas/apiToken'
import type { CreateAPITokenReq } from '@/types/apiToken'

const baseURL = '/users'

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
