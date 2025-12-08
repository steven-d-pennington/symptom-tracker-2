'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CodeVerificationForm } from '@/components/Beta/CodeVerificationForm'
import { getBetaData, isBetaVerified } from '@/lib/beta/storage'

type PageState = 'loading' | 'no-code' | 'already-verified' | 'verify'

export default function VerifyPage(): React.ReactElement {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // Check current state
    const betaData = getBetaData()

    if (!betaData) {
      // No signup data - need to sign up first
      setPageState('no-code')
      return
    }

    if (betaData.verified || isBetaVerified()) {
      // Already verified - redirect to onboarding/dashboard
      setPageState('already-verified')
      router.push('/onboarding')
      return
    }

    // Has code, not verified - show verification form
    setUserEmail(betaData.email)
    setPageState('verify')
  }, [router])

  function handleVerificationSuccess(): void {
    router.push('/onboarding')
  }

  function handleNeedSignup(): void {
    router.push('/')
  }

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Already verified - show brief message before redirect
  if (pageState === 'already-verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Already Verified
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to the app...
          </p>
        </div>
      </div>
    )
  }

  // No code stored - need to sign up first
  if (pageState === 'no-code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pocket Symptom Tracker
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-8 text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                No Unlock Code Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to request beta access first. Enter your email to receive an unlock code.
              </p>
              <Link
                href="/"
                className="inline-block w-full px-6 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
              >
                Request Beta Access
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show verification form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pocket Symptom Tracker
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Beta Access Verification
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center">
          {/* Instructions Card */}
          <div className="w-full max-w-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Check your email
                </h3>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  We sent an unlock code to <strong>{userEmail}</strong>. Enter it below to access the app.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Form Card */}
          <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Enter Your Unlock Code
            </h2>
            <CodeVerificationForm
              onSuccess={handleVerificationSuccess}
              onNeedSignup={handleNeedSignup}
            />
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn&apos;t receive the email?{' '}
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Request a new code
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
