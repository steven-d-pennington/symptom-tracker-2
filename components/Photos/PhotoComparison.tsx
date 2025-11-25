'use client'

import { useState, useEffect, useRef } from 'react'
import { PhotoAttachment, PhotoComparison as PhotoComparisonType } from '@/lib/db'
import { getFullImageUrl } from '@/lib/photos/uploadPhoto'

interface PhotoComparisonViewProps {
  comparison: PhotoComparisonType
  beforePhoto: PhotoAttachment
  afterPhoto: PhotoAttachment
  onClose?: () => void
}

export function PhotoComparisonView({
  comparison,
  beforePhoto,
  afterPhoto,
  onClose,
}: PhotoComparisonViewProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side')
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null)
  const [afterUrl, setAfterUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sliderPosition, setSliderPosition] = useState(50)
  const sliderRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true)
      const [before, after] = await Promise.all([
        getFullImageUrl(beforePhoto),
        getFullImageUrl(afterPhoto),
      ])
      setBeforeUrl(before)
      setAfterUrl(after)
      setIsLoading(false)
    }

    loadImages()

    return () => {
      if (beforeUrl) URL.revokeObjectURL(beforeUrl)
      if (afterUrl) URL.revokeObjectURL(afterUrl)
    }
  }, [beforePhoto, afterPhoto])

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    let clientX: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
    } else {
      clientX = e.clientX
    }

    const position = ((clientX - rect.left) / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, position)))
  }

  const handleSliderStart = () => {
    isDragging.current = true
  }

  const handleSliderEnd = () => {
    isDragging.current = false
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleSliderEnd)
    window.addEventListener('touchend', handleSliderEnd)

    return () => {
      window.removeEventListener('mouseup', handleSliderEnd)
      window.removeEventListener('touchend', handleSliderEnd)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {comparison.title}
          </h3>
          {comparison.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{comparison.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'side-by-side'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              } transition-colors`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'slider'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              } transition-colors`}
            >
              Slider
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Comparison View */}
      {viewMode === 'side-by-side' ? (
        <div className="flex flex-col md:flex-row">
          {/* Before */}
          <div className="flex-1 p-2">
            <div className="text-center mb-2">
              <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                Before
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(beforePhoto.captureTimestamp).toLocaleDateString()}
              </p>
            </div>
            {beforeUrl ? (
              <img
                src={beforeUrl}
                alt="Before"
                className="w-full h-auto max-h-96 object-contain rounded"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
                <span className="text-gray-500">Failed to load</span>
              </div>
            )}
          </div>

          {/* After */}
          <div className="flex-1 p-2">
            <div className="text-center mb-2">
              <span className="inline-block px-2 py-1 bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">
                After
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(afterPhoto.captureTimestamp).toLocaleDateString()}
              </p>
            </div>
            {afterUrl ? (
              <img
                src={afterUrl}
                alt="After"
                className="w-full h-auto max-h-96 object-contain rounded"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
                <span className="text-gray-500">Failed to load</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          ref={sliderRef}
          className="relative h-96 overflow-hidden cursor-ew-resize select-none"
          onMouseMove={handleSliderMove}
          onTouchMove={handleSliderMove}
        >
          {/* After Image (full width, underneath) */}
          {afterUrl && (
            <img
              src={afterUrl}
              alt="After"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          {/* Before Image (clipped by slider position) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            {beforeUrl && (
              <img
                src={beforeUrl}
                alt="Before"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }}
              />
            )}
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleSliderStart}
            onTouchStart={handleSliderStart}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900/70 text-white rounded text-sm">
            Before
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600/70 text-white rounded text-sm">
            After
          </div>
        </div>
      )}

      {/* Time Difference */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Time between photos:{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {formatTimeDifference(beforePhoto.captureTimestamp, afterPhoto.captureTimestamp)}
          </span>
        </p>
      </div>
    </div>
  )
}

function formatTimeDifference(start: number, end: number): string {
  const diffMs = Math.abs(end - start)
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
  }

  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks !== 1 ? 's' : ''}`
  }

  const months = Math.floor(diffDays / 30)
  return `${months} month${months !== 1 ? 's' : ''}`
}
