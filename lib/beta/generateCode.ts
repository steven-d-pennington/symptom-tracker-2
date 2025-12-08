/**
 * Unlock Code Generator
 * Generates cryptographically secure 6-character alphanumeric codes
 */

// Character set excluding confusing characters (0, O, 1, I)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/**
 * Generates a unique 6-character alphanumeric unlock code
 * Uses crypto.getRandomValues for cryptographic security
 * @returns 6-character uppercase alphanumeric code
 */
export function generateUnlockCode(): string {
  const array = new Uint8Array(6)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map(byte => CHARS[byte % CHARS.length])
    .join('')
}
