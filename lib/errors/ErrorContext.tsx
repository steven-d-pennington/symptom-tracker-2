'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useToast } from '@/components/ui/Toast'
import { handleError, AppError, ErrorType, withRetry } from './errorHandler'

interface ErrorContextType {
  /**
   * Shows an error toast to the user
   */
  showError: (error: unknown, type?: ErrorType, customMessage?: string) => AppError

  /**
   * Shows a success toast to the user
   */
  showSuccess: (title: string, message?: string) => void

  /**
   * Shows an info toast to the user
   */
  showInfo: (title: string, message?: string) => void

  /**
   * Shows a warning toast to the user
   */
  showWarning: (title: string, message?: string) => void

  /**
   * Wraps an async operation with error handling and optional retry
   */
  handleAsync: <T>(
    operation: () => Promise<T>,
    options?: {
      errorType?: ErrorType
      customMessage?: string
      showSuccessMessage?: string
      retryable?: boolean
      maxRetries?: number
    }
  ) => Promise<T | null>
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function useErrorHandler() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider')
  }
  return context
}

export function ErrorProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast()

  const showError = useCallback(
    (error: unknown, type?: ErrorType, customMessage?: string): AppError => {
      const appError = handleError(error, type, customMessage)

      showToast({
        type: 'error',
        title: 'Error',
        message: appError.userMessage,
        action: appError.action,
      })

      return appError
    },
    [showToast]
  )

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: 'success',
        title,
        message,
      })
    },
    [showToast]
  )

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: 'info',
        title,
        message,
      })
    },
    [showToast]
  )

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: 'warning',
        title,
        message,
      })
    },
    [showToast]
  )

  const handleAsync = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options: {
        errorType?: ErrorType
        customMessage?: string
        showSuccessMessage?: string
        retryable?: boolean
        maxRetries?: number
      } = {}
    ): Promise<T | null> => {
      try {
        const executeOperation = options.retryable
          ? () => withRetry(operation, options.maxRetries || 3)
          : operation

        const result = await executeOperation()

        if (options.showSuccessMessage) {
          showSuccess('Success', options.showSuccessMessage)
        }

        return result
      } catch (error) {
        const appError = showError(error, options.errorType, options.customMessage)

        // If retryable and we have a retry handler, show retry button
        if (appError.retryable) {
          showToast({
            type: 'error',
            title: 'Error',
            message: appError.userMessage,
            action: appError.action,
            onRetry: () => handleAsync(operation, options),
          })
        }

        return null
      }
    },
    [showError, showSuccess, showToast]
  )

  return (
    <ErrorContext.Provider
      value={{
        showError,
        showSuccess,
        showInfo,
        showWarning,
        handleAsync,
      }}
    >
      {children}
    </ErrorContext.Provider>
  )
}
