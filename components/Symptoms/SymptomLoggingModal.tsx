'use client'

import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { SeveritySlider } from '../Flares/SeveritySlider'
import { Symptom, Trigger } from '@/lib/db'
import { logSymptom, getActiveSymptoms } from '@/lib/symptoms/logSymptom'
import { db } from '@/lib/db'

interface SymptomLoggingModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedSymptomId?: string
  bodyRegion?: string
  coordinates?: { x: number; y: number }
  onSuccess?: () => void
}

export function SymptomLoggingModal({
  isOpen,
  onClose,
  preselectedSymptomId,
  bodyRegion,
  coordinates,
  onSuccess,
}: SymptomLoggingModalProps) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [selectedSymptomId, setSelectedSymptomId] = useState(preselectedSymptomId || '')
  const [severity, setSeverity] = useState(5)
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(undefined)
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load symptoms and triggers
  useEffect(() => {
    async function loadData() {
      try {
        const [activeSymptoms, activeTriggers] = await Promise.all([
          getActiveSymptoms(),
          db.triggers.filter(t => t.isActive === true).toArray(),
        ])
        setSymptoms(activeSymptoms)
        setTriggers(activeTriggers)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!selectedSymptomId) {
      setError('Please select a symptom')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await logSymptom({
        symptomId: selectedSymptomId,
        severity,
        timestamp: timestamp.getTime(),
        bodyRegion,
        coordinateX: coordinates?.x,
        coordinateY: coordinates?.y,
        durationMinutes: durationMinutes,
        associatedTriggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
        notes: notes || undefined,
      })

      // Success
      onClose()
      if (onSuccess) {
        onSuccess()
      }

      // Reset form
      resetForm()
    } catch (err) {
      console.error('Error logging symptom:', err)
      setError(err instanceof Error ? err.message : 'Failed to log symptom')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedSymptomId(preselectedSymptomId || '')
    setSeverity(5)
    setDurationMinutes(undefined)
    setSelectedTriggers([])
    setNotes('')
    setTimestamp(new Date())
    setError(null)
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  const toggleTrigger = (triggerId: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(triggerId) ? prev.filter((id) => id !== triggerId) : [...prev, triggerId]
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Log Symptom" size="lg">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Symptom Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Symptom <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedSymptomId}
          onChange={(e) => setSelectedSymptomId(e.target.value)}
          disabled={isSubmitting || !!preselectedSymptomId}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select a symptom...</option>
          {symptoms.map((symptom) => (
            <option key={symptom.guid} value={symptom.guid}>
              {symptom.name} ({symptom.category})
            </option>
          ))}
        </select>
      </div>

      {/* Location Info (if provided) */}
      {bodyRegion && coordinates && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</p>
          <p className="text-gray-900 dark:text-gray-100">
            {bodyRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Coordinates: ({coordinates.x.toFixed(3)}, {coordinates.y.toFixed(3)})
          </p>
        </div>
      )}

      {/* Severity */}
      <SeveritySlider
        value={severity}
        onChange={setSeverity}
        label="Severity"
        required
        disabled={isSubmitting}
      />

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Duration (optional)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={durationMinutes || ''}
            onChange={(e) =>
              setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)
            }
            disabled={isSubmitting}
            placeholder="0"
            min="0"
            className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
        </div>
      </div>

      {/* Triggers */}
      {triggers.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Associated Triggers (optional)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
            {triggers.map((trigger) => (
              <button
                key={trigger.guid}
                onClick={() => toggleTrigger(trigger.guid)}
                disabled={isSubmitting}
                className={`text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                  selectedTriggers.includes(trigger.guid)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } disabled:opacity-50`}
              >
                {trigger.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          placeholder="Any additional details about this symptom..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{notes.length}/500 characters</p>
      </div>

      {/* Timestamp */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          When did you experience this?
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

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedSymptomId}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
              Logging...
            </>
          ) : (
            'Log Symptom'
          )}
        </button>
      </div>
    </Modal>
  )
}
