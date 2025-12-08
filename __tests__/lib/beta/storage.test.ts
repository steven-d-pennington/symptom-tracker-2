/**
 * Unit tests for storage helpers
 */

import {
  saveBetaCode,
  getBetaData,
  markVerified,
  isBetaVerified,
  clearBetaData
} from '@/lib/beta/storage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('storage helpers', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('saveBetaCode', () => {
    it('saves email and code to localStorage', () => {
      saveBetaCode('user@example.com', 'ABC123')
      const data = getBetaData()
      expect(data).not.toBeNull()
      expect(data?.email).toBe('user@example.com')
      expect(data?.code).toBe('ABC123')
    })

    it('normalizes email to lowercase', () => {
      saveBetaCode('User@Example.COM', 'ABC123')
      const data = getBetaData()
      expect(data?.email).toBe('user@example.com')
    })

    it('normalizes code to uppercase', () => {
      saveBetaCode('user@example.com', 'abc123')
      const data = getBetaData()
      expect(data?.code).toBe('ABC123')
    })

    it('trims whitespace from email', () => {
      saveBetaCode('  user@example.com  ', 'ABC123')
      const data = getBetaData()
      expect(data?.email).toBe('user@example.com')
    })

    it('sets verified to false initially', () => {
      saveBetaCode('user@example.com', 'ABC123')
      const data = getBetaData()
      expect(data?.verified).toBe(false)
    })

    it('sets createdAt timestamp', () => {
      const before = Date.now()
      saveBetaCode('user@example.com', 'ABC123')
      const after = Date.now()
      const data = getBetaData()
      expect(data?.createdAt).toBeGreaterThanOrEqual(before)
      expect(data?.createdAt).toBeLessThanOrEqual(after)
    })

    it('overwrites previous data on re-submission', () => {
      saveBetaCode('first@example.com', 'FIRST1')
      saveBetaCode('second@example.com', 'SECOND')
      const data = getBetaData()
      expect(data?.email).toBe('second@example.com')
      expect(data?.code).toBe('SECOND')
    })
  })

  describe('getBetaData', () => {
    it('returns null when no data stored', () => {
      expect(getBetaData()).toBeNull()
    })

    it('returns stored data', () => {
      saveBetaCode('user@example.com', 'ABC123')
      const data = getBetaData()
      expect(data).not.toBeNull()
      expect(data?.email).toBe('user@example.com')
    })

    it('returns null for corrupted data', () => {
      localStorage.setItem('pst_beta_data', 'not-valid-json')
      expect(getBetaData()).toBeNull()
    })
  })

  describe('markVerified', () => {
    it('sets verified to true', () => {
      saveBetaCode('user@example.com', 'ABC123')
      expect(getBetaData()?.verified).toBe(false)
      markVerified()
      expect(getBetaData()?.verified).toBe(true)
    })

    it('does nothing if no data exists', () => {
      markVerified() // Should not throw
      expect(getBetaData()).toBeNull()
    })

    it('preserves other fields when marking verified', () => {
      saveBetaCode('user@example.com', 'ABC123')
      const originalData = getBetaData()
      markVerified()
      const updatedData = getBetaData()
      expect(updatedData?.email).toBe(originalData?.email)
      expect(updatedData?.code).toBe(originalData?.code)
      expect(updatedData?.createdAt).toBe(originalData?.createdAt)
    })
  })

  describe('isBetaVerified', () => {
    it('returns false when no data exists', () => {
      expect(isBetaVerified()).toBe(false)
    })

    it('returns false when not verified', () => {
      saveBetaCode('user@example.com', 'ABC123')
      expect(isBetaVerified()).toBe(false)
    })

    it('returns true when verified', () => {
      saveBetaCode('user@example.com', 'ABC123')
      markVerified()
      expect(isBetaVerified()).toBe(true)
    })
  })

  describe('clearBetaData', () => {
    it('removes beta data from localStorage', () => {
      saveBetaCode('user@example.com', 'ABC123')
      expect(getBetaData()).not.toBeNull()
      clearBetaData()
      expect(getBetaData()).toBeNull()
    })

    it('does nothing if no data exists', () => {
      clearBetaData() // Should not throw
      expect(getBetaData()).toBeNull()
    })
  })
})
