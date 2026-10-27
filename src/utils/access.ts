export const MAX_DAYS_OPTIONS = [
  { value: 365, text: '1 year' },
  { value: 730, text: '2 years' },
  { value: 1095, text: '3 years' },
  { value: 1825, text: '5 years' },
  { value: 3650, text: '10 years' },
  { value: -1, text: 'Unlimited' },
]

export const normalizeMaxDays = (m?: number) =>
  m !== undefined && MAX_DAYS_OPTIONS.some((o) => o.value === m) ? m : 365

export const historyLabel = (days?: number | null) => {
  if (days == null) return '—'
  if (days === -1) return 'Unlimited'
  return MAX_DAYS_OPTIONS.find((o) => o.value === days)?.text ?? `${days} days`
}

export type AccessSummary = 'full' | 'partial' | 'none'

export const ACCESS_SUMMARY_LABELS: Record<AccessSummary, string> = {
  full: 'Full access',
  partial: 'Partial access',
  none: 'No access',
}

// null means "all"; an empty array means "none".
export const accessSummary = (
  stationIds: number[] | null | undefined,
  variables: string[] | null | undefined,
  maxDays?: number | null,
): AccessSummary => {
  if (stationIds?.length === 0 || variables?.length === 0) return 'none'
  if (stationIds == null && variables == null && maxDays === -1) return 'full'
  return 'partial'
}
