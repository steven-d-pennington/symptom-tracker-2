'use client'

import { useState, useEffect, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Trigger } from '@/lib/db'
import { logTrigger, getActiveTriggers, Intensity } from '@/lib/triggers/logTrigger'

interface TriggerLoggerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  preselectedTriggerId?: string
}

const INTENSITY_OPTIONS: { value: Intensity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
]

const CATEGORY_ICONS: Record<string, string> = {
  environmental: '🌍',
  lifestyle: '🏃',
  dietary: '🍽️',
}

const CATEGORY_LABELS: Record<string, string> = {
  environmental: 'Environmental',
  lifestyle: 'Lifestyle',
  dietary: 'Dietary',
}

export function TriggerLoggerModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedTriggerId,
}: TriggerLoggerModalProps) {
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [selectedTriggerId, setSelectedTriggerId] = useState<string | null>(preselectedTriggerId || null)
  const [intensity, setIntensity] = useState<Intensity>('medium')
  const [timestamp, setTimestamp] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quickMode, setQuickMode] = useState(true)

  // Load triggers
  useEffect(() => {
    async function loadTriggers() {
      try {
        const activeTriggers = await getActiveTriggers()
        setTriggers(activeTriggers)
      } catch (err) {
        console.error('Error loading triggers:', err)
      }
    }

    if (isOpen) {
      loadTriggers()
      if (preselectedTriggerId) {
        setSelectedTriggerId(preselectedTriggerId)
      }
    }
  }, [isOpen, preselectedTriggerId])

  // Group triggers by category
  const triggersByCategory = useMemo(() => {
    const filtered = searchQuery
      ? triggers.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : triggers

    return filtered.reduce(
      (acc, trigger) => {
        if (!acc[trigger.category]) {
          acc[trigger.category] = []
        }
        acc[trigger.category].push(trigger)
        return acc
      },
      {} as Record<string, Trigger[]>
    )
  }, [triggers, searchQuery])

  const selectedTrigger = triggers.find((t) => t.guid === selectedTriggerId)

  const handleSubmit = async () => {
    if (!selectedTriggerId) {
      setError('Please select a trigger')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await logTrigger({
        triggerId: selectedTriggerId,
        intensity,
        timestamp: timestamp.getTime(),
        notes: notes || undefined,
      })

      onClose()
      if (onSuccess) {
        onSuccess()
      }
      resetForm()
    } catch (err) {
      console.error('Error logging trigger:', err)
      setError(err instanceof Error ? err.message : 'Failed to log trigger')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedTriggerId(preselectedTriggerId || null)
    setIntensity('medium')
    setTimestamp(new Date())
    setNotes('')
    setSearchQuery('')
    setError(null)
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Log Trigger" size="lg">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Quick Mode Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Quick mode</label>
        <button
          onClick={() => setQuickMode(!quickMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            quickMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              quickMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Selected Trigger Display */}
      {selectedTrigger && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{CATEGORY_ICONS[selectedTrigger.category]}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {selectedTrigger.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedTriggerId(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {selectedTrigger.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {selectedTrigger.description}
            </p>
          )}
        </div>
      )}

      {/* Trigger Search & Selection */}
      {!selectedTriggerId && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Trigger <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search triggers..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div className="mb-6 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {Object.entries(triggersByCategory).map(([category, categoryTriggers]) => (
              <div key={category} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="sticky top-0 bg-gray-100 dark:bg-gray-800 px-3 py-2 font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[category]}</span>
                  <span>{CATEGORY_LABELS[category] || category}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                  {categoryTriggers.map((trigger) => (
                    <button
                      key={trigger.guid}
                      onClick={() => setSelectedTriggerId(trigger.guid)}
                      disabled={isSubmitting}
                      className="text-left px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm disabled:opacity-50"
                    >
                      {trigger.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Intensity Selector */}
      {selectedTriggerId && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Intensity <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {INTENSITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setIntensity(option.value)}
                disabled={isSubmitting}
                className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                  intensity === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } disabled:opacity-50`}
              >
                <div className={`w-4 h-4 rounded-full ${option.color} mb-2`} />
                <span className="font-medium text-gray-900 dark:text-gray-100">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extended Options (when not in quick mode) */}
      {selectedTriggerId && !quickMode && (
        <>
          {/* Timestamp */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              When did this happen?
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

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder="Any additional details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              maxLength={500}
            />
          </div>
        </>
      )}

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
          disabled={isSubmitting || !selectedTriggerId}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Logging...
            </>
          ) : (
            'Log Trigger'
          )}
        </button>
      </div>
    </Modal>
  )
}
