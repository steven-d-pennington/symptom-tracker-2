/**
 * Beta Signup Types
 * Interfaces for the beta signup and verification flow
 */

/**
 * Data stored in localStorage for beta signup tracking
 */
export interface BetaStorageData {
  /** 6-character alphanumeric unlock code */
  code: string
  /** User's email address */
  email: string
  /** Whether the code has been successfully verified */
  verified: boolean
  /** Unix timestamp when code was generated */
  createdAt: number
}

/**
 * Request body for POST /api/beta-signup
 */
export interface BetaSignupRequest {
  /** User's email address */
  email: string
  /** Generated unlock code to send */
  code: string
}

/**
 * Response from POST /api/beta-signup
 */
export interface BetaSignupResponse {
  /** Whether the operation succeeded */
  success: boolean
  /** Human-readable status message (on success) */
  message?: string
  /** Error message (on failure) */
  error?: string
}
