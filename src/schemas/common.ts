import { z } from 'zod'

export const makePaginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    page: z.number(),
    per_page: z.number(),
    total_pages: z.number(),
    next_page: z.number(),
    prev_page: z.number(),
    count: z.number(),
    items: z.array(item),
  })
