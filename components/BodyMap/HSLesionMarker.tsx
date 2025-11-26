'use client'

import { HSLesion, LesionType, LesionStatus } from '@/lib/hs/types'

interface HSLesionMarkerProps {
  lesion: HSLesion
  viewBox: { width: number; height: number }
  onClick?: (lesion: HSLesion) => void
  isSelected?: boolean
  showLabel?: boolean
}

/**
 * Colorblind-safe color palette for lesion types
 * From the body map spec: Wong (2011) Nature Methods colorblind-safe palette
 */
const LESION_COLORS: Record<LesionType, { fill: string; stroke: string; label: string }> = {
  nodule: {
    fill: '#E69F00',      // Orange
    stroke: '#B37700',
    label: 'N',
  },
  abscess: {
    fill: '#CC79A7',      // Pink
    stroke: '#A35A88',
    label: 'A',
  },
  draining_tunnel: {
    fill: '#882255',      // Purple
    stroke: '#661144',
    label: 'T',
  },
}

/**
 * Status modifiers for visual appearance
 */
const STATUS_MODIFIERS: Record<LesionStatus, { opacity: number; strokeDasharray?: string }> = {
  active: { opacity: 1.0 },
  healing: { opacity: 0.7, strokeDasharray: '3,2' },
  healed: { opacity: 0.4, strokeDasharray: '2,2' },
  scarred: { opacity: 0.3, strokeDasharray: '1,3' },
}

/**
 * Base size for markers (will be scaled based on viewBox)
 */
const BASE_SIZE = 3

/**
 * Render different shapes based on lesion type
 */
function renderShape(
  type: LesionType,
  cx: number,
  cy: number,
  size: number,
  colors: { fill: string; stroke: string },
  statusMods: { opacity: number; strokeDasharray?: string }
) {
  const halfSize = size / 2
  const commonProps = {
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 0.5,
    opacity: statusMods.opacity,
    strokeDasharray: statusMods.strokeDasharray,
  }

  switch (type) {
    case 'nodule':
      // Circle for nodules
      return <circle cx={cx} cy={cy} r={halfSize} {...commonProps} />

    case 'abscess':
      // Diamond/rhombus for abscesses
      const diamondPoints = [
        `${cx},${cy - halfSize}`,      // top
        `${cx + halfSize},${cy}`,      // right
        `${cx},${cy + halfSize}`,      // bottom
        `${cx - halfSize},${cy}`,      // left
      ].join(' ')
      return <polygon points={diamondPoints} {...commonProps} />

    case 'draining_tunnel':
      // Triangle for draining tunnels
      const trianglePoints = [
        `${cx},${cy - halfSize}`,              // top
        `${cx + halfSize},${cy + halfSize}`,   // bottom right
        `${cx - halfSize},${cy + halfSize}`,   // bottom left
      ].join(' ')
      return <polygon points={trianglePoints} {...commonProps} />

    default:
      return <circle cx={cx} cy={cy} r={halfSize} {...commonProps} />
  }
}

export function HSLesionMarker({
  lesion,
  viewBox,
  onClick,
  isSelected = false,
  showLabel = false,
}: HSLesionMarkerProps) {
  // Convert normalized coordinates (0-1) to viewBox coordinates
  const cx = lesion.coordinates.x * viewBox.width
  const cy = lesion.coordinates.y * viewBox.height

  const colors = LESION_COLORS[lesion.lesionType]
  const statusMods = STATUS_MODIFIERS[lesion.status]

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(lesion)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(lesion)
    }
  }

  // Create description for accessibility
  const statusLabel = lesion.status.charAt(0).toUpperCase() + lesion.status.slice(1)
  const typeLabel = lesion.lesionType.replace('_', ' ')
  const ariaLabel = `${statusLabel} ${typeLabel} lesion in ${lesion.regionId}`

  return (
    <g
      className="cursor-pointer transition-transform hover:scale-110"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={BASE_SIZE + 1}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={0.5}
          className="animate-pulse"
        />
      )}

      {/* Main shape */}
      {renderShape(lesion.lesionType, cx, cy, BASE_SIZE, colors, statusMods)}

      {/* Label inside shape */}
      {showLabel && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={2}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {colors.label}
        </text>
      )}
    </g>
  )
}

/**
 * Legend component showing lesion type shapes and colors
 */
export function HSLesionLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle
            cx="10"
            cy="10"
            r="6"
            fill={LESION_COLORS.nodule.fill}
            stroke={LESION_COLORS.nodule.stroke}
            strokeWidth="2"
          />
        </svg>
        <span className="text-gray-700 dark:text-gray-300">Nodule</span>
      </div>

      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <polygon
            points="10,3 17,10 10,17 3,10"
            fill={LESION_COLORS.abscess.fill}
            stroke={LESION_COLORS.abscess.stroke}
            strokeWidth="2"
          />
        </svg>
        <span className="text-gray-700 dark:text-gray-300">Abscess</span>
      </div>

      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <polygon
            points="10,3 17,17 3,17"
            fill={LESION_COLORS.draining_tunnel.fill}
            stroke={LESION_COLORS.draining_tunnel.stroke}
            strokeWidth="2"
          />
        </svg>
        <span className="text-gray-700 dark:text-gray-300">Draining Tunnel</span>
      </div>
    </div>
  )
}

/**
 * Status legend for lesion markers
 */
export function HSLesionStatusLegend({ className = '' }: { className?: string }) {
  const statuses: { status: LesionStatus; label: string }[] = [
    { status: 'active', label: 'Active' },
    { status: 'healing', label: 'Healing' },
    { status: 'healed', label: 'Healed' },
    { status: 'scarred', label: 'Scarred' },
  ]

  return (
    <div className={`flex flex-wrap gap-4 text-sm ${className}`}>
      {statuses.map(({ status, label }) => {
        const mods = STATUS_MODIFIERS[status]
        return (
          <div key={status} className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="6"
                fill="#9ca3af"
                stroke="#6b7280"
                strokeWidth="2"
                opacity={mods.opacity}
                strokeDasharray={mods.strokeDasharray}
              />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// Export colors for use in other components
export { LESION_COLORS, STATUS_MODIFIERS }
