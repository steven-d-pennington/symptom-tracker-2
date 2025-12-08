/**
 * Unit tests for generateUnlockCode
 */

import { generateUnlockCode } from '@/lib/beta/generateCode'

describe('generateUnlockCode', () => {
  it('generates a 6-character code', () => {
    const code = generateUnlockCode()
    expect(code).toHaveLength(6)
  })

  it('generates only uppercase alphanumeric characters', () => {
    const code = generateUnlockCode()
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('excludes confusing characters (0, O, 1, I)', () => {
    // Generate many codes to ensure confusing chars are excluded
    for (let i = 0; i < 100; i++) {
      const code = generateUnlockCode()
      expect(code).not.toMatch(/[0O1I]/)
    }
  })

  it('generates unique codes', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 100; i++) {
      codes.add(generateUnlockCode())
    }
    // Should have 100 unique codes (collision extremely unlikely)
    expect(codes.size).toBe(100)
  })

  it('uses the expected character set', () => {
    const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    for (let i = 0; i < 50; i++) {
      const code = generateUnlockCode()
      for (const char of code) {
        expect(validChars).toContain(char)
      }
    }
  })
})
