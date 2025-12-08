/**
 * Beta Signup Validation
 * Email and unlock code validation functions
 */

/** Standard email format regex */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Maximum allowed email length per RFC 5321 */
const MAX_EMAIL_LENGTH = 254

/** Valid unlock code pattern: 6 uppercase alphanumeric characters */
const CODE_REGEX = /^[A-Z0-9]{6}$/

/**
 * Validates an email address format
 * @param email - Email address to validate
 * @returns true if email is valid format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  const trimmed = email.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) {
    return false
  }
  return EMAIL_REGEX.test(trimmed)
}

/**
 * Validates an unlock code format
 * @param code - Unlock code to validate
 * @returns true if code is valid 6-character alphanumeric
 */
export function isValidCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false
  }
  return CODE_REGEX.test(code.toUpperCase())
}
