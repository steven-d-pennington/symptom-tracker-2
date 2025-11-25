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
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{
    bodyRegion: string
    coordinates: { x: number; y: number }
  } | null>(null)

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId)
  }

  const handleLocationSelect = (x: number, y: number, regionId: string) => {
    setSelectedLocation({
      bodyRegion: regionId,
      coordinates: { x, y },
    })
    setStep('details')
  }

  const handleConfirmLocation = () => {
    if (!selectedRegion) return

    // Use center coordinates (0.5, 0.5) as default when region is selected but no specific point clicked
    setSelectedLocation({
      bodyRegion: selectedRegion,
      coordinates: { x: 0.5, y: 0.5 },
    })
    setStep('details')
  }

  const handleClose = () => {
    setStep('map')
    setSelectedRegion(null)
    setSelectedLocation(null)
    onClose()
  }

  const handleSuccess = () => {
    setStep('map')
    setSelectedRegion(null)
    setSelectedLocation(null)
    if (onSuccess) {
      onSuccess()
    }
  }

  const handleBackToMap = () => {
    setStep('map')
    setSelectedRegion(null)
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
            Click on a body region to select where the flare is located.
          </p>
          {selectedRegion && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              ✓ Selected: {selectedRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          )}
        </div>

        <BodyMap
          selectedRegion={selectedRegion}
          onRegionClick={handleRegionClick}
          onCoordinateCapture={handleLocationSelect}
        />

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLocation}
            disabled={!selectedRegion}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
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
