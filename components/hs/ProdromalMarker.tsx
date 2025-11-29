'use client'

import { useMemo } from 'react'
import { PRODROMAL_DISPLAY_CONFIG, type ProdromalMarker as ProdromalMarkerType } from '@/lib/hs/types'
import { getActiveSymptomLabels } from '@/lib/hs'
import { getRegionById } from '@/lib/bodyMap/regions'

interface ProdromalMarkerProps {
  marker: ProdromalMarkerType
  onClick?: (marker: ProdromalMarkerType) => void
  size?: 'small' | 'medium' | 'large'
  showTooltip?: boolean
}

/**
 * SVG marker for prodromal (pre-lesion) warnings on body map
 * Displays as a dashed teal circle to distinguish from solid lesion markers
 */
export function ProdromalMarkerSVG({
  marker,
  onClick,
  size = 'medium',
  showTooltip = true,
}: ProdromalMarkerProps) {
  const { color } = PRODROMAL_DISPLAY_CONFIG

  const sizeConfig = {
    small: { r: 6, strokeWidth: 1.5, dashArray: '2,2' },
    medium: { r: 10, strokeWidth: 2, dashArray: '3,3' },
    large: { r: 14, strokeWidth: 2.5, dashArray: '4,4' },
  }

  const config = sizeConfig[size]
  const symptoms = getActiveSymptomLabels(marker.symptoms)
  const region = getRegionById(marker.regionId)

  const tooltipText = useMemo(() => {
    const lines = [
      `Prodromal Warning - ${region?.name || marker.regionId}`,
      `Created: ${new Date(marker.date).toLocaleDateString()}`,
      '',
      'Symptoms:',
      ...symptoms.map((s) => `  - ${s}`),
    ]
    return lines.join('\n')
  }, [marker, symptoms, region])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(marker)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(marker)
    }
  }

  // Calculate position (coordinates are 0-1 percentages)
  const cx = marker.coordinates.x * 400 // Assuming 400px viewbox width
  const cy = marker.coordinates.y * 700 // Assuming 700px viewbox height

  return (
    <g
      className="prodromal-marker cursor-pointer transition-transform hover:scale-110"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Prodromal marker at ${region?.name || marker.regionId}`}
    >
      {showTooltip && <title>{tooltipText}</title>}

      {/* Outer dashed circle */}
      <circle
        cx={cx}
        cy={cy}
        r={config.r}
        fill="none"
        stroke={color}
        strokeWidth={config.strokeWidth}
        strokeDasharray={config.dashArray}
        className="transition-all"
      />

      {/* Inner dot */}
      <circle
        cx={cx}
        cy={cy}
        r={config.r * 0.3}
        fill={color}
        className="transition-all"
      />

      {/* Pulse animation for active markers */}
      <circle
        cx={cx}
        cy={cy}
        r={config.r}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
        className="animate-ping"
        style={{ animationDuration: '2s' }}
      />
    </g>
  )
}

/**
 * List view of prodromal marker for sidebars/lists
 */
export function ProdromalMarkerCard({
  marker,
  onClick,
  onConvert,
  onResolve,
}: {
  marker: ProdromalMarkerType
  onClick?: (marker: ProdromalMarkerType) => void
  onConvert?: (marker: ProdromalMarkerType) => void
  onResolve?: (marker: ProdromalMarkerType) => void
}) {
  const region = getRegionById(marker.regionId)
  const symptoms = getActiveSymptomLabels(marker.symptoms)
  const { color } = PRODROMAL_DISPLAY_CONFIG

  const daysAgo = Math.ceil(
    (Date.now() - new Date(marker.date).getTime()) / (1000 * 60 * 60 * 24)
  )

  const isConverted = !!marker.convertedToLesionId
  const isResolved = !!marker.resolvedWithoutLesion

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        isConverted || isResolved
          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
          : 'bg-white dark:bg-gray-800 border-teal-200 dark:border-teal-700 hover:border-teal-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(marker)}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon */}
        <div
          className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center flex-shrink-0"
          style={{ borderColor: color }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white capitalize truncate">
              {region?.name || marker.regionId.replace(/-/g, ' ')}
            </h4>
            {isConverted && (
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded">
                Converted
              </span>
            )}
            {isResolved && (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                Resolved
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
          </p>

          {/* Symptoms */}
          <div className="flex flex-wrap gap-1 mt-2">
            {symptoms.slice(0, 3).map((symptom) => (
              <span
                key={symptom}
                className="text-xs px-1.5 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded"
              >
                {symptom}
              </span>
            ))}
            {symptoms.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{symptoms.length - 3} more
              </span>
            )}
          </div>

          {/* Actions for active markers */}
          {!isConverted && !isResolved && (onConvert || onResolve) && (
            <div className="flex gap-2 mt-3">
              {onConvert && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onConvert(marker)
                  }}
                  className="text-xs px-2 py-1 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded transition-colors"
                >
                  Convert to Lesion
                </button>
              )}
              {onResolve && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onResolve(marker)
                  }}
                  className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded transition-colors"
                >
                  Resolved
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Legend entry for prodromal markers
 */
export function ProdromalLegend() {
  const { color, name, description } = PRODROMAL_DISPLAY_CONFIG

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
      <div
        className="w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center"
        style={{ borderColor: color }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}
