import { Flare } from '@/lib/db'
import { getSeverityColor, denormalizeCoordinates } from '@/lib/bodyMap/coordinateUtils'
import { VIEW_BOX } from '@/lib/bodyMap/bodyMapSVGs'

interface FlareMarkerProps {
  flare: Flare
  onClick: (flare: Flare) => void
  viewBoxWidth?: number
  viewBoxHeight?: number
}

export function FlareMarker({
  flare,
  onClick,
  viewBoxWidth = VIEW_BOX.width,
  viewBoxHeight = VIEW_BOX.height,
}: FlareMarkerProps) {
  // Denormalize coordinates to SVG space
  const { x, y } = denormalizeCoordinates(
    flare.coordinateX,
    flare.coordinateY,
    viewBoxWidth,
    viewBoxHeight
  )

  const color = getSeverityColor(flare.currentSeverity)
  const radius = 8
  const isResolved = flare.status === 'resolved'

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={(e) => {
        e.stopPropagation()
        onClick(flare)
      }}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      role="button"
      aria-label={`Flare in ${flare.bodyRegion}, severity ${flare.currentSeverity}`}
    >
      {/* Main marker circle */}
      <circle
        cx={0}
        cy={0}
        r={radius}
        fill={isResolved ? '#e5e7eb' : color}
        stroke="white"
        strokeWidth={2}
        className="drop-shadow-lg"
      />

      {/* Status indicator arrows */}
      {!isResolved && flare.status === 'worsening' && (
        <path
          d="M 0,-12 L 4,-8 L -4,-8 Z"
          fill="#ef4444"
          className="animate-pulse"
          aria-label="Worsening"
        />
      )}
      {!isResolved && flare.status === 'improving' && (
        <path
          d="M 0,12 L 4,8 L -4,8 Z"
          fill="#10b981"
          className="animate-pulse"
          aria-label="Improving"
        />
      )}

      {/* Pulse ring for active flares */}
      {!isResolved && flare.currentSeverity >= 7 && (
        <circle
          cx={0}
          cy={0}
          r={radius + 4}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.5}
          className="animate-ping"
        />
      )}
    </g>
  )
}
