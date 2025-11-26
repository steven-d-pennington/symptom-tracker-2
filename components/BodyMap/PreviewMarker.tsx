'use client'

import { useEffect } from 'react'
import { LESION_COLORS } from './HSLesionMarker'

interface PreviewMarkerProps {
  coordinates: { x: number; y: number }
  viewBox: { width: number; height: number }
}

// Match the base size used in HSLesionMarker
const MARKER_SIZE = 12

/**
 * Ghost marker SVG element for preview-before-confirm placement.
 * The confirm/cancel controls are rendered separately as an HTML overlay.
 */
export function PreviewMarkerSVG({
  coordinates,
  viewBox,
}: PreviewMarkerProps) {
  // Convert normalized 0-1 coordinates to SVG viewBox coordinates
  const cx = coordinates.x * viewBox.width
  const cy = coordinates.y * viewBox.height

  return (
    <g className="preview-marker">
      {/* Ghost marker - semi-transparent with dashed border */}
      <circle
        cx={cx}
        cy={cy}
        r={MARKER_SIZE}
        fill={LESION_COLORS.nodule.fill}
        fillOpacity={0.5}
        stroke={LESION_COLORS.nodule.stroke}
        strokeWidth={1.5}
        strokeDasharray="3,2"
        className="motion-safe:animate-pulse"
      />

      {/* Pulsing selection ring */}
      <circle
        cx={cx}
        cy={cy}
        r={MARKER_SIZE + 3}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={1.5}
        strokeOpacity={0.7}
        className="motion-safe:animate-pulse"
      />
    </g>
  )
}

interface PreviewControlsProps {
  onConfirm: () => void
  onCancel: () => void
}

/**
 * HTML overlay controls for confirming/canceling marker placement.
 * Rendered outside SVG to maintain consistent button size regardless of zoom.
 */
export function PreviewControls({
  onConfirm,
  onCancel,
}: PreviewControlsProps) {
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
    <div className="flex items-center justify-center gap-2 mt-3">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onConfirm()
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        aria-label="Confirm marker placement"
        type="button"
        autoFocus
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Confirm
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onCancel()
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        aria-label="Cancel marker placement"
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancel
      </button>
    </div>
  )
}

// Keep backward compatibility - export combined component name
export { PreviewMarkerSVG as PreviewMarker }
