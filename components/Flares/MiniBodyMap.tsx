'use client'

import { Flare } from '@/lib/db'
import { getSeverityColor } from '@/lib/bodyMap/coordinateUtils'
import { getRegionsForView, VIEW_BOX, FRONT_VIEW_REGIONS, BACK_VIEW_REGIONS } from '@/lib/bodyMap/bodyMapSVGs'

interface MiniBodyMapProps {
  flare: Flare
  className?: string
}

export function MiniBodyMap({ flare, className = '' }: MiniBodyMapProps) {
  // Determine which view to show based on region
  const frontRegionIds = new Set(FRONT_VIEW_REGIONS.map((r) => r.id))
  const backRegionIds = new Set(BACK_VIEW_REGIONS.map((r) => r.id))

  const view = backRegionIds.has(flare.bodyRegion) ? 'back' : 'front'
  const regions = getRegionsForView(view)

  // Calculate marker position
  const markerX = flare.coordinateX * VIEW_BOX.width
  const markerY = flare.coordinateY * VIEW_BOX.height
  const severityColor = getSeverityColor(flare.currentSeverity)

  return (
    <div className={`${className}`}>
      <svg
        viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
        className="w-full h-auto max-h-64"
        aria-label={`Body map showing flare location on ${flare.bodyRegion}`}
      >
        {/* Body regions - simplified display */}
        <g role="group" aria-label="Body regions">
          {regions.map((region) => (
            <path
              key={region.id}
              id={region.id}
              d={region.path}
              fill={region.id === flare.bodyRegion ? `${severityColor}20` : '#e5e7eb'}
              stroke={region.id === flare.bodyRegion ? severityColor : '#d1d5db'}
              strokeWidth={region.id === flare.bodyRegion ? 2 : 1}
              className="dark:fill-gray-700 dark:stroke-gray-600"
            />
          ))}
        </g>

        {/* Flare marker */}
        <g>
          {/* Outer pulse ring */}
          <circle
            cx={markerX}
            cy={markerY}
            r={20}
            fill={severityColor}
            opacity={0.3}
            className="animate-ping"
          />
          {/* Outer ring */}
          <circle
            cx={markerX}
            cy={markerY}
            r={16}
            fill={severityColor}
            opacity={0.5}
          />
          {/* Inner dot */}
          <circle
            cx={markerX}
            cy={markerY}
            r={10}
            fill={severityColor}
            stroke="white"
            strokeWidth={3}
          />
          {/* Severity text */}
          <text
            x={markerX}
            y={markerY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={12}
            fontWeight="bold"
          >
            {flare.currentSeverity}
          </text>
        </g>
      </svg>

      {/* View label */}
      <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
        {view === 'front' ? 'Front View' : 'Back View'}
      </div>
    </div>
  )
}
