/**
 * Beta Signup Module
 * Re-exports all beta signup functionality
 */

// Types
export type { BetaStorageData, BetaSignupRequest, BetaSignupResponse } from './types'

// Code generation
export { generateUnlockCode } from './generateCode'

// Validation
export { isValidEmail, isValidCode } from './validation'

// Storage
export { saveBetaCode, getBetaData, markVerified, isBetaVerified, clearBetaData } from './storage'
