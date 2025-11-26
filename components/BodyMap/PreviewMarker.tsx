'use client'

import { useEffect, useRef } from 'react'
import { LESION_COLORS } from './HSLesionMarker'

interface PreviewMarkerProps {
  coordinates: { x: number; y: number }
  viewBox: { width: number; height: number }
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Ghost marker with inline confirm/cancel controls for preview-before-confirm placement.
 * Allows users to reposition the marker before committing, helpful for users with shaky hands.
 */
export function PreviewMarker({
  coordinates,
  viewBox,
  bounds,
  onConfirm,
  onCancel,
}: PreviewMarkerProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Convert normalized 0-1 coordinates to SVG viewBox coordinates
  const cx = coordinates.x * viewBox.width
  const cy = coordinates.y * viewBox.height

  // Calculate position relative to the current viewBox for the controls
  const viewBoxWidth = bounds.maxX - bounds.minX
  const viewBoxHeight = bounds.maxY - bounds.minY

  // Control button size (in SVG units) - scaled relative to viewBox
  // We want ~44px touch targets, so scale based on viewBox size
  const buttonSize = Math.min(viewBoxWidth, viewBoxHeight) * 0.12
  const buttonSpacing = buttonSize * 0.3
  const markerSize = buttonSize * 0.6

  // Position controls to the right of marker, or left if near right edge
  const controlsOnLeft = cx > bounds.maxX - (buttonSize * 2.5 + markerSize)
  const controlsX = controlsOnLeft
    ? cx - markerSize - buttonSpacing - buttonSize * 2.2
    : cx + markerSize + buttonSpacing

  // Focus confirm button when preview appears
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      confirmButtonRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [coordinates])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <g className="preview-marker" aria-label="Marker preview. Press Enter to confirm or Escape to cancel.">
      {/* Ghost marker - semi-transparent with dashed border */}
      <circle
        cx={cx}
        cy={cy}
        r={markerSize}
        fill={LESION_COLORS.nodule.fill}
        fillOpacity={0.5}
        stroke={LESION_COLORS.nodule.stroke}
        strokeWidth={2}
        strokeDasharray="4,2"
        className="motion-safe:animate-pulse"
      />

      {/* Pulsing selection ring */}
      <circle
        cx={cx}
        cy={cy}
        r={markerSize + 4}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
        strokeOpacity={0.6}
        className="motion-safe:animate-pulse"
      />

      {/* Inline controls using foreignObject for HTML buttons */}
      <foreignObject
        x={controlsX}
        y={cy - buttonSize / 2}
        width={buttonSize * 2.2}
        height={buttonSize}
        style={{ overflow: 'visible' }}
      >
        <div
          className="flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg px-1 py-0.5 backdrop-blur-sm"
          style={{
            height: `${buttonSize}px`,
            minWidth: `${buttonSize * 2}px`,
          }}
        >
          {/* Confirm button */}
          <button
            ref={confirmButtonRef}
            onClick={(e) => {
              e.stopPropagation()
              onConfirm()
            }}
            className="flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
            style={{
              width: `${buttonSize * 0.9}px`,
              height: `${buttonSize * 0.9}px`,
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label="Confirm marker placement"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          {/* Cancel button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCancel()
            }}
            className="flex items-center justify-center rounded-full bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            style={{
              width: `${buttonSize * 0.9}px`,
              height: `${buttonSize * 0.9}px`,
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label="Cancel marker placement"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </foreignObject>

      {/* Screen reader announcement */}
      <text
        x={cx}
        y={cy}
        className="sr-only"
        aria-live="polite"
      >
        Marker preview placed. Click elsewhere to reposition, or use the confirm and cancel buttons.
      </text>
    </g>
  )
}
