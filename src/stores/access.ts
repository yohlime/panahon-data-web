import axios from '@/utils/axios'

import {
  accessRequestSchema,
  createAccessRequestArgsSchema,
  paginatedAccessRequestSchema,
  updateUserAccessArgsSchema,
  userAccessSchema,
} from '@/schemas/access'
import type { AccessRequestStatus, CreateAccessRequestReq, UpdateUserAccessReq } from '@/types/access'

export const getMyAccess = async () => {
  const { data } = await axios.get('/users/me/access')
  return userAccessSchema.parse(data)
}

export const createAccessRequest = async (args: CreateAccessRequestReq) => {
  const parsed = createAccessRequestArgsSchema.parse(args)
  const { data } = await axios.post('/users/me/access-requests', parsed)
  return accessRequestSchema.parse(data)
}

export const listMyAccessRequests = async () => {
  const { data } = await axios.get('/users/me/access-requests')
  return accessRequestSchema.array().parse(data)
}

export const cancelAccessRequest = async (id: number) => {
  await axios.delete(`/users/me/access-requests/${id}`)
}

export const listAccessRequests = async (status?: AccessRequestStatus) => {
  const query = status ? `?status=${status}` : ''
  const { data } = await axios.get(`/access-requests${query}`)
  return paginatedAccessRequestSchema.parse(data)
}

export const approveAccessRequest = async (id: number, note?: string) => {
  const { data } = await axios.post(`/access-requests/${id}/approve`, { note })
  return userAccessSchema.parse(data)
}

export const denyAccessRequest = async (id: number, note: string) => {
  const { data } = await axios.post(`/access-requests/${id}/deny`, { note })
  return accessRequestSchema.parse(data)
}

export const getUserAccess = async (userID: number) => {
  const { data } = await axios.get(`/users/${userID}/access`)
  return userAccessSchema.parse(data)
}

export const updateUserAccess = async (userID: number, args: UpdateUserAccessReq) => {
  const parsed = updateUserAccessArgsSchema.parse(args)
  const { data } = await axios.put(`/users/${userID}/access`, parsed)
  return userAccessSchema.parse(data)
}
