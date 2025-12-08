'use client'

import { useRouter } from 'next/navigation'
import { BetaSignupForm } from './BetaSignupForm'

export function BetaLandingPage(): React.ReactElement {
  const router = useRouter()

  function handleSignupSuccess(): void {
    router.push('/verify')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pocket Symptom Tracker
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Privacy-first health tracking
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center">
          {/* Beta Badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
            Beta Program
          </div>

          {/* Hero Section */}
          <div className="text-center mb-8 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Track Your Health Journey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join our beta program to be among the first to use our privacy-focused symptom tracking app.
              All your health data stays on your device.
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="w-full max-w-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Your data stays on your device
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  All health data is stored locally. No cloud storage, no tracking, no data sharing.
                </p>
              </div>
            </div>
          </div>

          {/* Signup Form Card */}
          <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Request Beta Access
            </h3>
            <BetaSignupForm onSuccess={handleSignupSuccess} />
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
            <FeatureCard
              icon="📍"
              title="Track Flares"
              description="Log symptoms on an interactive body map"
            />
            <FeatureCard
              icon="📊"
              title="Find Patterns"
              description="Discover correlations between triggers and symptoms"
            />
            <FeatureCard
              icon="🔒"
              title="Stay Private"
              description="All data stored locally on your device"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps): React.ReactElement {
  return (
    <div className="text-center p-4">
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
