'use client'

import { useState } from 'react'
import {
  convertProdromalToLesion,
  resolveProdromalMarker,
  getActiveSymptomLabels,
  type ProdromalMarker,
  type LesionType,
  LESION_DISPLAY_CONFIG,
} from '@/lib/hs'
import { getRegionById } from '@/lib/bodyMap/regions'

interface ConvertProdromalModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  marker: ProdromalMarker | null
}

/**
 * Modal for converting a prodromal marker to a lesion or resolving it
 */
export function ConvertProdromalModal({
  isOpen,
  onClose,
  onComplete,
  marker,
}: ConvertProdromalModalProps) {
  const [selectedType, setSelectedType] = useState<LesionType>('nodule')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<'choose' | 'convert'>('choose')

  if (!isOpen || !marker) return null

  const region = getRegionById(marker.regionId)
  const regionName = region?.name || marker.regionId.replace(/-/g, ' ')
  const symptoms = getActiveSymptomLabels(marker.symptoms)

  const daysAgo = Math.ceil(
    (Date.now() - new Date(marker.date).getTime()) / (1000 * 60 * 60 * 24)
  )

  const handleConvert = async () => {
    setIsSubmitting(true)
    try {
      await convertProdromalToLesion(marker.guid, { lesionType: selectedType })
      onComplete()
      handleClose()
    } catch (error) {
      console.error('Error converting prodromal marker:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async () => {
    setIsSubmitting(true)
    try {
      await resolveProdromalMarker(marker.guid)
      onComplete()
      handleClose()
    } catch (error) {
      console.error('Error resolving prodromal marker:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setMode('choose')
    setSelectedType('nodule')
    onClose()
  }

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
        aria-labelledby="convert-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="convert-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {mode === 'choose' ? 'Update Prodromal Marker' : 'Convert to Lesion'}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {mode === 'choose' ? (
            <>
              {/* Marker Info */}
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: '#44AA99' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#44AA99' }}
                    />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {regionName}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Created{' '}
                  {daysAgo === 0
                    ? 'today'
                    : daysAgo === 1
                      ? 'yesterday'
                      : `${daysAgo} days ago`}
                </p>
                <div className="flex flex-wrap gap-1">
                  {symptoms.map((symptom) => (
                    <span
                      key={symptom}
                      className="text-xs px-2 py-0.5 bg-teal-100 dark:bg-teal-800/50 text-teal-700 dark:text-teal-300 rounded"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Question */}
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Did a lesion develop from this warning?
              </p>

              {/* Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setMode('convert')}
                  disabled={isSubmitting}
                  className="w-full flex items-center gap-3 p-4 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Yes - Create Lesion
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Convert this marker to a tracked lesion
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleResolve}
                  disabled={isSubmitting}
                  className="w-full flex items-center gap-3 p-4 border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      No - Symptoms Resolved
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Warning passed without developing into a lesion
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Keep Monitoring
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Not sure yet - check back later
                    </div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Lesion Type Selection */}
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                What type of lesion developed?
              </p>

              <div className="space-y-3">
                {(['nodule', 'abscess', 'draining_tunnel'] as LesionType[]).map((type) => {
                  const config = LESION_DISPLAY_CONFIG[type]
                  return (
                    <label
                      key={type}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedType === type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lesionType"
                        value={type}
                        checked={selectedType === type}
                        onChange={(e) => setSelectedType(e.target.value as LesionType)}
                        className="sr-only"
                      />
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <span style={{ color: config.color }}>{config.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {config.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {config.description}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          IHS4 weight: {config.ihs4Weight}
                        </div>
                      </div>
                      {selectedType === type && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="flex justify-between gap-3 mt-6">
                <button
                  onClick={() => setMode('choose')}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConvert}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Converting...' : 'Create Lesion'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
