import type { z } from 'zod'

import type { apiTokenSchema, apiTokenWithSecretSchema, createAPITokenArgsSchema } from '@/schemas/apiToken'

export type APIToken = z.infer<typeof apiTokenSchema>
export type APITokenWithSecret = z.infer<typeof apiTokenWithSecretSchema>
export type CreateAPITokenReq = z.infer<typeof createAPITokenArgsSchema>
