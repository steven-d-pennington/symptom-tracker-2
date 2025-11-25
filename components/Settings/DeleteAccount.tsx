'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SettingsSection } from './SettingsSection'
import { deleteAllUserData, getDataCounts } from '@/lib/settings/deleteAllData'

type DeletionStep = 'warning' | 'confirm' | 'type' | 'deleting' | 'complete'

export function DeleteAccount() {
  const router = useRouter()
  const [step, setStep] = useState<DeletionStep>('warning')
  const [confirmText, setConfirmText] = useState('')
  const [dataCounts, setDataCounts] = useState<{
    total: number
    breakdown: { name: string; count: number }[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDataCounts = useCallback(async () => {
    try {
      const counts = await getDataCounts()
      setDataCounts(counts)
    } catch (err) {
      console.error('Error loading data counts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDataCounts()
  }, [loadDataCounts])

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setStep('deleting')
    setError(null)

    try {
      await deleteAllUserData()
      setStep('complete')

      // Redirect to onboarding after short delay
      setTimeout(() => {
        router.push('/onboarding')
      }, 2000)
    } catch (err) {
      console.error('Error deleting data:', err)
      setError('Failed to delete data. Please try again.')
      setStep('type')
    }
  }

  const resetFlow = () => {
    setStep('warning')
    setConfirmText('')
    setError(null)
  }

  if (isLoading) {
    return (
      <SettingsSection title="Delete Account" icon="🗑️" description="Permanently delete all your data">
        <div className="animate-pulse h-20 bg-gray-100 dark:bg-gray-700 rounded"></div>
      </SettingsSection>
    )
  }

  return (
    <SettingsSection title="Delete Account" icon="🗑️" description="Permanently delete all your data">
      {/* Step 1: Warning */}
      {step === 'warning' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-bold text-red-800 dark:text-red-200 mb-2">
              ⚠️ Warning: This action cannot be undone
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              Deleting your account will permanently remove all of your data including:
            </p>
            {dataCounts && dataCounts.breakdown.length > 0 && (
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 mb-3">
                {dataCounts.breakdown.map((item) => (
                  <li key={item.name}>• {item.count} {item.name}</li>
                ))}
              </ul>
            )}
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Total: {dataCounts?.total || 0} records will be deleted
            </p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Consider exporting your data before deleting your account.
            </p>
            <Link
              href="/settings/export"
              className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
            >
              Export my data first →
            </Link>
          </div>

          <button
            onClick={() => setStep('confirm')}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            I understand, proceed to delete
          </button>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              Are you absolutely sure?
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This will permanently delete all your health tracking data. You will not be able
              to recover any of your symptoms, medications, triggers, foods, flares, daily entries,
              photos, or any other data stored in the app.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetFlow}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep('type')}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Yes, delete everything
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Type DELETE to confirm */}
      {step === 'type' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-bold text-red-800 dark:text-red-200 mb-2">
              Final confirmation required
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              To confirm deletion, please type <strong>DELETE</strong> in the box below:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE to confirm"
              className="w-full px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              autoComplete="off"
              spellCheck="false"
            />

            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetFlow}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE'}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Delete All Data
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Deleting */}
      {step === 'deleting' && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
          <p className="text-gray-900 dark:text-gray-100 font-medium">
            Deleting all data...
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Please do not close this page
          </p>
        </div>
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✅</div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            All data has been deleted
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Redirecting to setup...
          </p>
        </div>
      )}
    </SettingsSection>
  )
}
