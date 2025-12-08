'use client'

import { useState, FormEvent } from 'react'
import { isValidEmail } from '@/lib/beta/validation'
import { generateUnlockCode } from '@/lib/beta/generateCode'
import { saveBetaCode } from '@/lib/beta/storage'

interface BetaSignupFormProps {
  onSuccess: () => void
}

export function BetaSignupForm({ onSuccess }: BetaSignupFormProps): React.ReactElement {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()

    // Client-side validation
    if (!trimmedEmail) {
      setError('Please enter your email address')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Generate unlock code
      const code = generateUnlockCode()

      // Save to localStorage first
      saveBetaCode(trimmedEmail, code)

      // Send emails via API
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, code })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to send email. Please try again.')
        return
      }

      // Success - navigate to verification
      onSuccess()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md" noValidate>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="beta-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email Address
          </label>
          <input
            id="beta-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
            autoComplete="email"
            autoFocus
            aria-describedby={error ? 'email-error' : undefined}
            aria-invalid={error ? 'true' : 'false'}
            className={`
              w-full px-4 py-3 text-base
              border rounded-lg
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              min-h-[44px]
              ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
          {error && (
            <p
              id="email-error"
              role="alert"
              className="mt-2 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
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
              <span>Sending...</span>
            </>
          ) : (
            'Request Beta Access'
          )}
        </button>
      </div>

      <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
        We&apos;ll send you an unlock code to verify your email.
      </p>
    </form>
  )
}
