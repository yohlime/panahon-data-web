import { atom } from 'nanostores'

import axios from '@/utils/axios'

import { createRoleArgsSchema, paginatedRoleSchema, roleSchema } from '@/schemas/role'
import type { CreateRoleReq, Role } from '@/types/role'

const baseUrl = '/roles'

export const $page = atom(1)
export const $perPage = atom(10)

export const listRoles = async () => {
  const { data } = await axios.get(`${baseUrl}?page=${$page.get()}&per_page=${$perPage.get()}`)
  return paginatedRoleSchema.parse(data)
}

export const getRole = async (roleID?: number) => {
  if (!roleID) return
  const { data } = await axios.get(`${baseUrl}/${roleID}`)
  return roleSchema.parse(data)
}

export const createRole = async (args: CreateRoleReq) => {
  const parsed = createRoleArgsSchema.parse(args)
  const { data } = await axios.post(baseUrl, parsed)
  return roleSchema.parse(data)
}

export const updateRole = async (role: Pick<Role, 'id' | 'name' | 'description'>) => {
  const { data } = await axios.put(`${baseUrl}/${role.id}`, { name: role.name, description: role.description })
  return roleSchema.parse(data)
}

export const deleteRole = async (roleID: number) => {
  await axios.delete(`${baseUrl}/${roleID}`)
}
