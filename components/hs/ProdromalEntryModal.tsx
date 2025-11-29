'use client'

import { useState } from 'react'
import {
  createProdromalMarker,
  createEmptySymptoms,
  hasAnySymptoms,
  PRODROMAL_SYMPTOM_LABELS,
  type ProdromalSymptoms,
} from '@/lib/hs'
import { getRegionById } from '@/lib/bodyMap/regions'

interface ProdromalEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  regionId: string
  coordinates: { x: number; y: number }
}

/**
 * Modal for creating a prodromal (pre-lesion) warning marker
 */
export function ProdromalEntryModal({
  isOpen,
  onClose,
  onSubmit,
  regionId,
  coordinates,
}: ProdromalEntryModalProps) {
  const [symptoms, setSymptoms] = useState<ProdromalSymptoms>(createEmptySymptoms())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const region = getRegionById(regionId)
  const regionName = region?.name || regionId.replace(/-/g, ' ')

  const handleSymptomToggle = (symptom: keyof ProdromalSymptoms) => {
    setSymptoms((prev) => ({
      ...prev,
      [symptom]: !prev[symptom],
    }))
  }

  const handleSubmit = async () => {
    if (!hasAnySymptoms(symptoms)) return

    setIsSubmitting(true)
    try {
      await createProdromalMarker({
        regionId,
        coordinates,
        symptoms,
      })
      onSubmit()
      handleClose()
    } catch (error) {
      console.error('Error creating prodromal marker:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSymptoms(createEmptySymptoms())
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
        role="dialog"
        aria-labelledby="prodromal-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: '#44AA99' }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#44AA99' }}
              />
            </div>
            <div>
              <h2
                id="prodromal-modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Prodromal Warning
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {regionName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            What symptoms are you feeling? (Select all that apply)
          </p>

          <div className="space-y-2">
            {(Object.entries(PRODROMAL_SYMPTOM_LABELS) as [keyof ProdromalSymptoms, string][]).map(
              ([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    symptoms[key]
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={symptoms[key]}
                    onChange={() => handleSymptomToggle(key)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-900 dark:text-white">{label}</span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This will be tracked separately from lesions. You can convert it to a lesion if one develops.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!hasAnySymptoms(symptoms) || isSubmitting}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Prodromal Marker'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact prodromal symptom selector for inline use
 */
export function ProdromalSymptomSelector({
  symptoms,
  onChange,
}: {
  symptoms: ProdromalSymptoms
  onChange: (symptoms: ProdromalSymptoms) => void
}) {
  const handleToggle = (symptom: keyof ProdromalSymptoms) => {
    onChange({
      ...symptoms,
      [symptom]: !symptoms[symptom],
    })
  }

  return (
    <div className="space-y-2">
      {(Object.entries(PRODROMAL_SYMPTOM_LABELS) as [keyof ProdromalSymptoms, string][]).map(
        ([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={symptoms[key]}
              onChange={() => handleToggle(key)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
          </label>
        )
      )}
    </div>
  )
}
