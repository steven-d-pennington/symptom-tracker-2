'use client'

import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { BodyMap } from '../BodyMap'
import { FlareCreationModal } from './FlareCreationModal'

interface FlareCreationFlowProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function FlareCreationFlow({ isOpen, onClose, onSuccess }: FlareCreationFlowProps) {
  const [step, setStep] = useState<'map' | 'details'>('map')
  const [selectedLocation, setSelectedLocation] = useState<{
    bodyRegion: string
    coordinates: { x: number; y: number }
  } | null>(null)

  const handleLocationSelect = (x: number, y: number, regionId: string) => {
    setSelectedLocation({
      bodyRegion: regionId,
      coordinates: { x, y },
    })
    setStep('details')
  }

  const handleClose = () => {
    setStep('map')
    setSelectedLocation(null)
    onClose()
  }

  const handleSuccess = () => {
    setStep('map')
    setSelectedLocation(null)
    if (onSuccess) {
      onSuccess()
    }
  }

  const handleBackToMap = () => {
    setStep('map')
    setSelectedLocation(null)
  }

  // Show body map selection modal
  if (step === 'map') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Select Flare Location"
        size="xl"
      >
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click on the body map to select where the flare is located.
          </p>
        </div>

        <BodyMap onCoordinateCapture={handleLocationSelect} />

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    )
  }

  // Show flare details modal
  if (step === 'details' && selectedLocation) {
    return (
      <FlareCreationModal
        isOpen={isOpen}
        onClose={handleClose}
        bodyRegion={selectedLocation.bodyRegion}
        coordinates={selectedLocation.coordinates}
        onSuccess={handleSuccess}
      />
    )
  }

  return null
}
