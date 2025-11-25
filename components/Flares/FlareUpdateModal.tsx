'use client'

import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { SeveritySlider } from './SeveritySlider'
import { Flare } from '@/lib/db'
import { updateFlareSeverity, logFlareIntervention } from '@/lib/flares/updateFlare'

interface FlareUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  flare: Flare
  onSuccess?: () => void
}

export function FlareUpdateModal({ isOpen, onClose, flare, onSuccess }: FlareUpdateModalProps) {
  const [severity, setSeverity] = useState(flare.currentSeverity)
  const [trend, setTrend] = useState<'improving' | 'stable' | 'worsening' | undefined>(undefined)
  const [selectedInterventions, setSelectedInterventions] = useState<
    Array<'ice' | 'heat' | 'medication' | 'rest' | 'drainage' | 'other'>
  >([])
  const [interventionDetails, setInterventionDetails] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const interventionOptions = [
    { value: 'ice', label: '❄️ Ice', description: 'Applied ice/cold compress' },
    { value: 'heat', label: '🔥 Heat', description: 'Applied heat/warm compress' },
    { value: 'medication', label: '💊 Medication', description: 'Took medication' },
    { value: 'rest', label: '😴 Rest', description: 'Rested area' },
    { value: 'drainage', label: '💧 Drainage', description: 'Drainage performed' },
    { value: 'other', label: '📝 Other', description: 'Other intervention' },
  ] as const

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Update severity if changed
      if (severity !== flare.currentSeverity || trend) {
        await updateFlareSeverity({
          flareId: flare.guid,
          newSeverity: severity,
          trend: trend,
          notes: notes || undefined,
        })
      }

      // Log interventions
      for (const intervention of selectedInterventions) {
        await logFlareIntervention({
          flareId: flare.guid,
          interventionType: intervention,
          interventionDetails: interventionDetails || undefined,
          notes: notes || undefined,
        })
      }

      onClose()
      if (onSuccess) {
        onSuccess()
      }

      // Reset form
      setSeverity(flare.currentSeverity)
      setTrend(undefined)
      setSelectedInterventions([])
      setInterventionDetails('')
      setNotes('')
    } catch (err) {
      console.error('Error updating flare:', err)
      setError(err instanceof Error ? err.message : 'Failed to update flare')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleIntervention = (intervention: typeof selectedInterventions[number]) => {
    setSelectedInterventions((prev) =>
      prev.includes(intervention)
        ? prev.filter((i) => i !== intervention)
        : [...prev, intervention]
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Flare" size="lg">
      {/* Flare Info */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {flare.bodyRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Started {new Date(flare.startDate).toLocaleDateString()}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Severity */}
      <SeveritySlider
        value={severity}
        onChange={setSeverity}
        label="Current Severity"
        disabled={isSubmitting}
      />

      {/* Trend */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Trend
        </label>
        <div className="flex gap-2">
          {(['improving', 'stable', 'worsening'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTrend(trend === t ? undefined : t)}
              disabled={isSubmitting}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                trend === t
                  ? t === 'improving'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : t === 'worsening'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="font-medium capitalize">{t}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interventions */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Interventions (optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {interventionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleIntervention(option.value)}
              disabled={isSubmitting}
              className={`text-left px-4 py-3 rounded-lg border-2 transition-all ${
                selectedInterventions.includes(option.value)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{option.description}</div>
            </button>
          ))}
        </div>

        {selectedInterventions.length > 0 && (
          <div className="mt-3">
            <input
              type="text"
              value={interventionDetails}
              onChange={(e) => setInterventionDetails(e.target.value)}
              disabled={isSubmitting}
              placeholder="Additional details about interventions..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}
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
          placeholder="Any additional observations..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Update Flare'}
        </button>
      </div>
    </Modal>
  )
}
