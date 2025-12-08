/**
 * Unit tests for validation functions
 */

import { isValidEmail, isValidCode } from '@/lib/beta/validation'

describe('isValidEmail', () => {
  it('returns true for valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('user.name@example.com')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
    expect(isValidEmail('user@subdomain.example.com')).toBe(true)
  })

  it('returns false for invalid email formats', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
    expect(isValidEmail('user@.com')).toBe(false)
    expect(isValidEmail('user @example.com')).toBe(false)
  })

  it('returns false for empty or null values', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('   ')).toBe(false)
    expect(isValidEmail(null as unknown as string)).toBe(false)
    expect(isValidEmail(undefined as unknown as string)).toBe(false)
  })

  it('returns false for emails exceeding max length', () => {
    const longEmail = 'a'.repeat(250) + '@example.com'
    expect(isValidEmail(longEmail)).toBe(false)
  })

  it('trims whitespace before validation', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true)
  })
})

describe('isValidCode', () => {
  it('returns true for valid 6-character codes', () => {
    expect(isValidCode('ABC123')).toBe(true)
    expect(isValidCode('ABCDEF')).toBe(true)
    expect(isValidCode('123456')).toBe(true)
    expect(isValidCode('A1B2C3')).toBe(true)
  })

  it('returns true for lowercase codes (case insensitive)', () => {
    expect(isValidCode('abc123')).toBe(true)
    expect(isValidCode('AbCdEf')).toBe(true)
  })

  it('returns false for codes with wrong length', () => {
    expect(isValidCode('ABC12')).toBe(false)
    expect(isValidCode('ABC1234')).toBe(false)
    expect(isValidCode('')).toBe(false)
  })

  it('returns false for codes with invalid characters', () => {
    expect(isValidCode('ABC-12')).toBe(false)
    expect(isValidCode('ABC 12')).toBe(false)
    expect(isValidCode('ABC!23')).toBe(false)
  })

  it('returns false for null or undefined', () => {
    expect(isValidCode(null as unknown as string)).toBe(false)
    expect(isValidCode(undefined as unknown as string)).toBe(false)
  })
})
