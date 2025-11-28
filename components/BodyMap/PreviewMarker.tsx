'use client'

import { useEffect } from 'react'
import { LESION_COLORS } from './HSLesionMarker'

interface PreviewMarkerProps {
  coordinates: { x: number; y: number }
  viewBox: { width: number; height: number }
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
}

/**
 * Ghost marker SVG element for preview-before-confirm placement.
 * The confirm/cancel controls are rendered separately as an HTML overlay.
 * Marker size scales with zoom level to maintain consistent visual appearance.
 */
export function PreviewMarkerSVG({
  coordinates,
  viewBox,
  bounds,
}: PreviewMarkerProps) {
  // Convert normalized 0-1 coordinates to SVG viewBox coordinates
  const cx = coordinates.x * viewBox.width
  const cy = coordinates.y * viewBox.height

  // Calculate marker size relative to current viewBox (about 0.5% of smallest dimension)
  // Much smaller than before to match actual lesion marker sizes
  const viewBoxWidth = bounds.maxX - bounds.minX
  const viewBoxHeight = bounds.maxY - bounds.minY
  const markerSize = Math.min(viewBoxWidth, viewBoxHeight) * 0.008
  const ringSize = markerSize * 1.5
  const strokeWidth = Math.max(0.3, markerSize * 0.15)

  return (
    <g className="preview-marker">
      {/* Ghost marker - semi-transparent with dashed border */}
      <circle
        cx={cx}
        cy={cy}
        r={markerSize}
        fill={LESION_COLORS.nodule.fill}
        fillOpacity={0.6}
        stroke={LESION_COLORS.nodule.stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={`${markerSize * 0.3},${markerSize * 0.2}`}
      />

      {/* Selection ring - static, no animation */}
      <circle
        cx={cx}
        cy={cy}
        r={ringSize}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={strokeWidth}
        strokeOpacity={0.8}
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
