import { formatCents, formatDate, dollarsToCents, centsToDollars } from '@/lib/format'

describe('formatCents', () => {
  it('formats zero cents', () => {
    expect(formatCents(0)).toBe('$0.00')
  })

  it('formats integer dollar amounts', () => {
    expect(formatCents(100)).toBe('$1.00')
    expect(formatCents(1000)).toBe('$10.00')
    expect(formatCents(150000)).toBe('$1,500.00')
  })

  it('formats amounts with cents', () => {
    expect(formatCents(199)).toBe('$1.99')
    expect(formatCents(1050)).toBe('$10.50')
  })

  it('formats large amounts with comma separator', () => {
    expect(formatCents(1000000)).toBe('$10,000.00')
  })
})

describe('dollarsToCents', () => {
  it('converts whole dollars', () => {
    expect(dollarsToCents(1)).toBe(100)
    expect(dollarsToCents(10)).toBe(1000)
    expect(dollarsToCents(1500)).toBe(150000)
  })

  it('rounds floating point correctly', () => {
    expect(dollarsToCents(9.99)).toBe(999)
    expect(dollarsToCents(19.95)).toBe(1995)
  })

  it('converts zero', () => {
    expect(dollarsToCents(0)).toBe(0)
  })
})

describe('centsToDollars', () => {
  it('converts cents to dollars', () => {
    expect(centsToDollars(100)).toBe(1)
    expect(centsToDollars(150000)).toBe(1500)
    expect(centsToDollars(199)).toBe(1.99)
  })

  it('converts zero', () => {
    expect(centsToDollars(0)).toBe(0)
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const date = new Date('2026-01-15T12:00:00.000Z')
    const formatted = formatDate(date)
    expect(formatted).toMatch(/Jan/)
    expect(formatted).toMatch(/2026/)
  })

  it('formats a date string', () => {
    const formatted = formatDate('2026-06-27T00:00:00.000Z')
    expect(formatted).toMatch(/2026/)
  })
})
