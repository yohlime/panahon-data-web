import { vi } from 'vitest'
import { ref } from 'vue'

export const mockMutateFn = vi.fn()

export const useMutation = vi.fn(() => ({
  isLoading: ref(false),
  isError: ref(false),
  mutate: mockMutateFn,
}))
