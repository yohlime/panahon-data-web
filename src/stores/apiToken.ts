import axios from '@/utils/axios'

import { apiTokenSchema, apiTokenWithSecretSchema, createAPITokenArgsSchema } from '@/schemas/apiToken'
import type { CreateAPITokenReq } from '@/types/apiToken'

const baseUrl = '/users/me/api-tokens'

export const listApiTokens = async () => {
  const { data } = await axios.get(baseUrl)
  return apiTokenSchema.array().parse(data)
}

export const createApiToken = async (args: CreateAPITokenReq) => {
  const parsedArgs = createAPITokenArgsSchema.parse(args)
  const { data } = await axios.post(baseUrl, parsedArgs)
  return apiTokenWithSecretSchema.parse(data)
}

export const deleteApiToken = async (tokenId: number) => {
  await axios.delete(`${baseUrl}/${tokenId}`)
}

export const listUserApiTokens = async (userID: number) => {
  const { data } = await axios.get(`/users/${userID}/api-tokens`)
  return apiTokenSchema.array().parse(data)
}

export const createUserApiToken = async (userID: number, args: CreateAPITokenReq) => {
  const parsedArgs = createAPITokenArgsSchema.parse(args)
  const { data } = await axios.post(`/users/${userID}/api-tokens`, parsedArgs)
  return apiTokenWithSecretSchema.parse(data)
}

export const deleteUserApiToken = async (userID: number, tokenId: number) => {
  await axios.delete(`/users/${userID}/api-tokens/${tokenId}`)
}
