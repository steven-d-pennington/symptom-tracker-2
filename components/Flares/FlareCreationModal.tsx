'use client'

import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { SeveritySlider } from './SeveritySlider'
import { createFlare } from '@/lib/flares/createFlare'

interface FlareCreationModalProps {
  isOpen: boolean
  onClose: () => void
  bodyRegion: string
  coordinates: { x: number; y: number }
  onSuccess?: () => void
}

export function FlareCreationModal({
  isOpen,
  onClose,
  bodyRegion,
  coordinates,
  onSuccess,
}: FlareCreationModalProps) {
  const [severity, setSeverity] = useState(5)
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await createFlare({
        bodyRegion,
        coordinateX: coordinates.x,
        coordinateY: coordinates.y,
        initialSeverity: severity,
        notes: notes || undefined,
        timestamp: timestamp.getTime(),
      })

      // Success - close modal and notify parent
      onClose()
      if (onSuccess) {
        onSuccess()
      }

      // Reset form
      setSeverity(5)
      setNotes('')
      setTimestamp(new Date())
    } catch (err) {
      console.error('Error creating flare:', err)
      setError(err instanceof Error ? err.message : 'Failed to create flare')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Reset form
    setSeverity(5)
    setNotes('')
    setTimestamp(new Date())
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="New Flare" size="md">
      {/* Location Info */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {bodyRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Coordinates</p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
              ({coordinates.x.toFixed(3)}, {coordinates.y.toFixed(3)})
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Severity Slider */}
      <SeveritySlider
        value={severity}
        onChange={setSeverity}
        label="Initial Severity"
        required
        disabled={isSubmitting}
      />

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          placeholder="Describe the flare, what you were doing when you noticed it, etc..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {notes.length}/1000 characters
        </p>
      </div>

      {/* Timestamp */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          When did you notice this flare?
        </label>
        <input
          type="datetime-local"
          value={timestamp.toISOString().slice(0, 16)}
          onChange={(e) => setTimestamp(new Date(e.target.value))}
          disabled={isSubmitting}
          max={new Date().toISOString().slice(0, 16)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Cannot be in the future
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </>
          ) : (
            'Create Flare'
          )}
        </button>
      </div>
    </Modal>
  )
}
