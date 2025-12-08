/**
 * Beta Signup Storage
 * localStorage helpers for managing beta signup data
 */

import type { BetaStorageData } from './types'

/** Storage key prefix for beta data */
const STORAGE_KEY = 'pst_beta_data'

/**
 * Saves beta signup data to localStorage
 * @param email - User's email address
 * @param code - Generated unlock code
 */
export function saveBetaCode(email: string, code: string): void {
  const data: BetaStorageData = {
    code: code.toUpperCase(),
    email: email.trim().toLowerCase(),
    verified: false,
    createdAt: Date.now()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Retrieves beta signup data from localStorage
 * @returns BetaStorageData or null if not found
 */
export function getBetaData(): BetaStorageData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return null
    }
    return JSON.parse(data) as BetaStorageData
  } catch {
    return null
  }
}

/**
 * Marks the beta signup as verified
 * Sets the verified flag to true in localStorage
 */
export function markVerified(): void {
  const data = getBetaData()
  if (data) {
    data.verified = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

/**
 * Checks if the user has completed beta verification
 * @returns true if beta code has been verified
 */
export function isBetaVerified(): boolean {
  const data = getBetaData()
  return data?.verified === true
}

/**
 * Clears all beta signup data from localStorage
 * Used for testing or reset scenarios
 */
export function clearBetaData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
