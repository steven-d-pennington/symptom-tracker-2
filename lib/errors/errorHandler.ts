/**
 * Error handling utility for the Pocket Symptom Tracker
 * Provides centralized error handling, logging, and user-friendly messages
 */

export type ErrorType =
  | 'database'
  | 'network'
  | 'validation'
  | 'permission'
  | 'storage'
  | 'encryption'
  | 'unknown'

export interface AppError {
  type: ErrorType
  message: string
  userMessage: string
  action?: string
  retryable: boolean
  originalError?: unknown
  timestamp: number
}

// Error messages for different error types
const ERROR_MESSAGES: Record<ErrorType, { message: string; action?: string }> = {
  database: {
    message: 'Unable to access your data. This may be a temporary issue.',
    action: 'Try refreshing the page or wait a moment and try again.',
  },
  network: {
    message: 'No internet connection detected.',
    action: 'Check your connection and try again. The app works offline, but some features may be limited.',
  },
  validation: {
    message: 'The information provided is invalid.',
    action: 'Please check your input and try again.',
  },
  permission: {
    message: 'Permission denied for this action.',
    action: 'Please check your browser settings and permissions.',
  },
  storage: {
    message: 'Storage space is running low.',
    action: 'Consider clearing old data or freeing up device storage.',
  },
  encryption: {
    message: 'Unable to secure your data.',
    action: 'Please try again. If the issue persists, contact support.',
  },
  unknown: {
    message: 'Something went wrong.',
    action: 'Please try again or refresh the page.',
  },
}

/**
 * Creates a standardized AppError from any error
 */
export function createAppError(
  error: unknown,
  type: ErrorType = 'unknown',
  customMessage?: string
): AppError {
  const errorInfo = ERROR_MESSAGES[type]
  const originalMessage = error instanceof Error ? error.message : String(error)

  return {
    type,
    message: originalMessage,
    userMessage: customMessage || errorInfo.message,
    action: errorInfo.action,
    retryable: type === 'database' || type === 'network' || type === 'storage',
    originalError: error,
    timestamp: Date.now(),
  }
}

/**
 * Detects error type from error object
 */
export function detectErrorType(error: unknown): ErrorType {
  if (!error) return 'unknown'

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  const errorName = error instanceof Error ? error.name.toLowerCase() : ''

  // Database errors
  if (
    errorMessage.includes('indexeddb') ||
    errorMessage.includes('database') ||
    errorMessage.includes('dexie') ||
    errorName.includes('dexie')
  ) {
    return 'database'
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('offline') ||
    errorName === 'typeerror' && errorMessage.includes('failed to fetch')
  ) {
    return 'network'
  }

  // Storage errors
  if (
    errorMessage.includes('quota') ||
    errorMessage.includes('storage') ||
    errorMessage.includes('disk')
  ) {
    return 'storage'
  }

  // Permission errors
  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('denied') ||
    errorMessage.includes('not allowed')
  ) {
    return 'permission'
  }

  // Encryption errors
  if (
    errorMessage.includes('encrypt') ||
    errorMessage.includes('decrypt') ||
    errorMessage.includes('crypto')
  ) {
    return 'encryption'
  }

  // Validation errors
  if (
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorMessage.includes('validation')
  ) {
    return 'validation'
  }

  return 'unknown'
}

/**
 * Logs error to console with structured format
 */
export function logError(error: AppError): void {
  console.error(
    `[${new Date(error.timestamp).toISOString()}] [${error.type.toUpperCase()}]`,
    {
      userMessage: error.userMessage,
      message: error.message,
      action: error.action,
      retryable: error.retryable,
      originalError: error.originalError,
    }
  )
}

/**
 * Handles an error: creates AppError, logs it, and returns it
 */
export function handleError(
  error: unknown,
  type?: ErrorType,
  customMessage?: string
): AppError {
  const detectedType = type || detectErrorType(error)
  const appError = createAppError(error, detectedType, customMessage)
  logError(appError)
  return appError
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorType?: ErrorType,
  customMessage?: string
): Promise<{ data: T; error: null } | { data: null; error: AppError }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (error) {
    const appError = handleError(error, errorType, customMessage)
    return { data: null, error: appError }
  }
}

/**
 * Retry wrapper for failed operations
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }

  throw lastError
}
