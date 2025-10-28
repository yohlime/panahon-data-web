import { vi } from 'vitest'
import { ref } from 'vue'

export const mockMutateFn = vi.fn()

export const useQuery = vi.fn(() => ({
  isLoading: ref(false),
  isError: ref(false),
  data: ref({}),
}))

export const useMutation = vi.fn(() => ({
  isPending: ref(false),
  isError: ref(false),
  mutate: mockMutateFn,
}))

export const useQueryClient = vi.fn()
