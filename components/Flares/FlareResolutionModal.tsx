'use client'

import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Flare } from '@/lib/db'
import { resolveFlare, calculateDaysActive } from '@/lib/flares/resolveFlare'

interface FlareResolutionModalProps {
  isOpen: boolean
  onClose: () => void
  flare: Flare
  onSuccess?: () => void
}

export function FlareResolutionModal({
  isOpen,
  onClose,
  flare,
  onSuccess,
}: FlareResolutionModalProps) {
  const [resolutionDate, setResolutionDate] = useState(new Date())
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const daysActive = calculateDaysActive(flare.startDate, resolutionDate.getTime())

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await resolveFlare({
        flareId: flare.guid,
        resolutionDate: resolutionDate.getTime(),
        resolutionNotes: resolutionNotes || undefined,
      })

      onClose()
      if (onSuccess) {
        onSuccess()
      }

      // Reset form
      setResolutionDate(new Date())
      setResolutionNotes('')
    } catch (err) {
      console.error('Error resolving flare:', err)
      setError(err instanceof Error ? err.message : 'Failed to resolve flare')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resolve Flare" size="md">
      {/* Confirmation Message */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <div className="text-blue-500 flex-shrink-0">ℹ️</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-1">Mark this flare as resolved?</p>
            <p>
              This flare will be moved to your history and will no longer appear in the active
              flares list. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Flare Info */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {flare.bodyRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Started</p>
            <p className="text-gray-900 dark:text-gray-100">
              {new Date(flare.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Duration</p>
            <p className="text-gray-900 dark:text-gray-100">{daysActive} days</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Resolution Date */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Resolution Date
        </label>
        <input
          type="date"
          value={resolutionDate.toISOString().split('T')[0]}
          onChange={(e) => setResolutionDate(new Date(e.target.value))}
          disabled={isSubmitting}
          min={new Date(flare.startDate).toISOString().split('T')[0]}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Must be after start date and not in the future
        </p>
      </div>

      {/* Resolution Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Resolution Notes (optional)
        </label>
        <textarea
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          disabled={isSubmitting}
          placeholder="What helped resolve this flare? Any final observations..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={500}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resolving...' : 'Mark as Resolved'}
        </button>
      </div>
    </Modal>
  )
}
