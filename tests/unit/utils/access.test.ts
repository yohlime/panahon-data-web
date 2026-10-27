import { ACCESS_SUMMARY_LABELS, accessSummary, historyLabel, normalizeMaxDays } from '@/utils/access'

describe('historyLabel', () => {
  test('renders unlimited history', () => {
    expect(historyLabel(-1)).toBe('Unlimited')
  })

  test('reuses the configured labels', () => {
    expect(historyLabel(365)).toBe('1 year')
    expect(historyLabel(1825)).toBe('5 years')
  })

  test('falls back to days and handles missing values', () => {
    expect(historyLabel(42)).toBe('42 days')
    expect(historyLabel(null)).toBe('—')
  })
})

describe('accessSummary', () => {
  test('full access', () => {
    expect(accessSummary(null, null, -1)).toBe('full')
  })

  test('partial access', () => {
    expect(accessSummary([1], null, 365)).toBe('partial')
    expect(accessSummary(null, ['temp'], -1)).toBe('partial')
  })

  test('no access', () => {
    expect(accessSummary([], null, -1)).toBe('none')
    expect(accessSummary(null, [], 365)).toBe('none')
  })

  test('has labels for every state', () => {
    expect(ACCESS_SUMMARY_LABELS).toEqual({
      full: 'Full access',
      partial: 'Partial access',
      none: 'No access',
    })
  })
})

describe('normalizeMaxDays', () => {
  test('keeps supported values', () => {
    expect(normalizeMaxDays(-1)).toBe(-1)
    expect(normalizeMaxDays(730)).toBe(730)
  })

  test('falls back to one year', () => {
    expect(normalizeMaxDays(42)).toBe(365)
    expect(normalizeMaxDays(undefined)).toBe(365)
  })
})
