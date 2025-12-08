'use client'

import { useState, FormEvent } from 'react'
import { isValidCode } from '@/lib/beta/validation'
import { getBetaData, markVerified } from '@/lib/beta/storage'

interface CodeVerificationFormProps {
  onSuccess: () => void
  onNeedSignup: () => void
}

export function CodeVerificationForm({ onSuccess, onNeedSignup }: CodeVerificationFormProps): React.ReactElement {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setError(null)

    const trimmedCode = code.trim().toUpperCase()

    // Client-side validation
    if (!trimmedCode) {
      setError('Please enter your unlock code')
      return
    }

    if (!isValidCode(trimmedCode)) {
      setError('Please enter a valid 6-character code')
      return
    }

    setIsLoading(true)

    try {
      // Get stored beta data
      const betaData = getBetaData()

      if (!betaData) {
        // No stored code - need to sign up first
        onNeedSignup()
        return
      }

      // Compare codes (case insensitive)
      if (trimmedCode !== betaData.code.toUpperCase()) {
        setError('Invalid code. Please check your email and try again.')
        setIsLoading(false)
        return
      }

      // Code matches - mark as verified
      markVerified()

      // Success - navigate to onboarding
      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  // Format code input - uppercase and limit to 6 chars
  function handleCodeChange(value: string): void {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setCode(formatted)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md" noValidate>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="unlock-code"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Unlock Code
          </label>
          <input
            id="unlock-code"
            type="text"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="ABC123"
            disabled={isLoading}
            autoComplete="off"
            autoFocus
            maxLength={6}
            aria-describedby={error ? 'code-error' : 'code-hint'}
            aria-invalid={error ? 'true' : 'false'}
            className={`
              w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em]
              border rounded-lg
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              min-h-[56px]
              ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
          {error ? (
            <p
              id="code-error"
              role="alert"
              className="mt-2 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          ) : (
            <p
              id="code-hint"
              className="mt-2 text-sm text-gray-500 dark:text-gray-400"
            >
              Enter the 6-character code from your email
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className={`
            w-full px-6 py-3 text-base font-semibold
            bg-blue-600 hover:bg-blue-700
            text-white rounded-lg
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            min-h-[44px]
            flex items-center justify-center
          `}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Verifying...</span>
            </>
          ) : (
            'Verify Code'
          )}
        </button>
      </div>
    </form>
  )
}
