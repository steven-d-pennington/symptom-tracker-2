'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { needsOnboarding } from '@/lib/onboarding/completeOnboarding'
import { FlareCreationFlow } from '@/components/Flares'

export default function Home() {
  const router = useRouter()
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)
  const [flareModalOpen, setFlareModalOpen] = useState(false)

  useEffect(() => {
    async function checkOnboarding() {
      const needs = await needsOnboarding()
      if (needs) {
        router.push('/onboarding')
      } else {
        setIsCheckingOnboarding(false)
      }
    }

    checkOnboarding()
  }, [router])

  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Starting Pocket Symptom Tracker</p>
        </div>
      </div>
    )
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Your data stays on your device
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>All health data is stored locally. No cloud storage, no tracking, no data sharing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setFlareModalOpen(true)}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
          >
            <div className="text-4xl mb-3">📍</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Track Flare
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Log a new flare on the body map
            </p>
          </button>
          <ActionCard
            title="Log Symptoms"
            description="Record symptom occurrence and severity"
            icon="🩺"
            href="/symptoms"
          />
          <ActionCard
            title="Food Journal"
            description="Track meals and food intake"
            icon="🍽️"
            href="/food"
          />
          <ActionCard
            title="Triggers"
            description="Log trigger exposures"
            icon="⚡"
            href="/triggers"
          />
          <ActionCard
            title="Daily Reflection"
            description="End-of-day health check-in"
            icon="📅"
            href="/daily"
          />
          <ActionCard
            title="Medications"
            description="Manage medications and adherence"
            icon="💊"
            href="/medications"
          />
          <ActionCard
            title="Analytics"
            description="View insights and correlations"
            icon="📊"
            href="/analytics"
          />
          <ActionCard
            title="Settings"
            description="Configure app preferences"
            icon="⚙️"
            href="/settings"
          />
        </div>

        {/* Active Flares Summary */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Flares
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No active flares. Tap &ldquo;Track Flare&rdquo; to log a new one.
          </p>
        </div>
      </main>

      {/* Flare Creation Flow with Body Map */}
      <FlareCreationFlow
        isOpen={flareModalOpen}
        onClose={() => setFlareModalOpen(false)}
        onSuccess={() => {
          setFlareModalOpen(false)
          // Could refresh active flares here
        }}
      />
    </div>
  )
}

function ActionCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  )
}
