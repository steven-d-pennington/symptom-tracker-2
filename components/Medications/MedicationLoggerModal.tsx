'use client'

import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Medication } from '@/lib/db'
import { logMedicationEvent, getTimingWarning, TimingWarning } from '@/lib/medications/logMedication'

interface MedicationLoggerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  medication: Medication | null
  action: 'taken' | 'skipped'
}

const TIMING_COLORS: Record<TimingWarning, string> = {
  'on-time': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  early: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  late: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}

export function MedicationLoggerModal({
  isOpen,
  onClose,
  onSuccess,
  medication,
  action,
}: MedicationLoggerModalProps) {
  const [timestamp, setTimestamp] = useState(new Date())
  const [dosageOverride, setDosageOverride] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timingWarning, setTimingWarning] = useState<TimingWarning | null>(null)

  useEffect(() => {
    if (isOpen && medication) {
      setTimestamp(new Date())
      setDosageOverride('')
      setNotes('')
      setError(null)

      // Calculate timing warning based on schedule
      if (medication.schedule.times.length > 0) {
        // Find the closest scheduled time
        const now = new Date()
        let closestTime = medication.schedule.times[0]
        let minDiff = Infinity

        medication.schedule.times.forEach((time) => {
          const [hours, minutes] = time.split(':').map(Number)
          const scheduledDate = new Date(now)
          scheduledDate.setHours(hours, minutes, 0, 0)
          const diff = Math.abs(now.getTime() - scheduledDate.getTime())
          if (diff < minDiff) {
            minDiff = diff
            closestTime = time
          }
        })

        setTimingWarning(getTimingWarning(closestTime, now))
      }
    }
  }, [isOpen, medication])

  const handleSubmit = async () => {
    if (!medication) return

    setIsSubmitting(true)
    setError(null)

    try {
      await logMedicationEvent({
        medicationId: medication.guid,
        taken: action === 'taken',
        timestamp: timestamp.getTime(),
        dosageOverride: dosageOverride || undefined,
        notes: notes || undefined,
        timingWarning: timingWarning || undefined,
      })

      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error logging medication:', err)
      setError(err instanceof Error ? err.message : 'Failed to log medication')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!medication) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={action === 'taken' ? 'Log Medication Taken' : 'Log Medication Skipped'}
      size="md"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Medication Info */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💊</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {medication.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {medication.dosage} • {medication.frequency}
            </p>
          </div>
        </div>
      </div>

      {/* Action Status */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
            action === 'taken'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          <span>{action === 'taken' ? '✓' : '✗'}</span>
          <span className="font-medium">
            {action === 'taken' ? 'Marking as Taken' : 'Marking as Skipped'}
          </span>
        </div>
      </div>

      {/* Timing Warning */}
      {timingWarning && action === 'taken' && (
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${TIMING_COLORS[timingWarning]}`}
          >
            {timingWarning === 'on-time' && '⏰ On time'}
            {timingWarning === 'early' && '⏰ Early'}
            {timingWarning === 'late' && '⏰ Late'}
          </span>
        </div>
      )}

      {/* Timestamp */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time
        </label>
        <input
          type="datetime-local"
          value={timestamp.toISOString().slice(0, 16)}
          onChange={(e) => setTimestamp(new Date(e.target.value))}
          disabled={isSubmitting}
          max={new Date().toISOString().slice(0, 16)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Dosage Override (for taken) */}
      {action === 'taken' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dosage Override (if different from {medication.dosage})
          </label>
          <input
            type="text"
            value={dosageOverride}
            onChange={(e) => setDosageOverride(e.target.value)}
            disabled={isSubmitting}
            placeholder="Leave empty if using standard dosage"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
        </div>
      )}

      {/* Notes (especially for skipped) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes {action === 'skipped' && '(Why was it skipped?)'}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          placeholder={
            action === 'skipped'
              ? 'e.g., Forgot, ran out, side effects...'
              : 'Any additional notes...'
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-6 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
            action === 'taken'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : action === 'taken' ? (
            'Confirm Taken'
          ) : (
            'Confirm Skipped'
          )}
        </button>
      </div>
    </Modal>
  )
}
