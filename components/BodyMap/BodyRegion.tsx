import { JSX } from 'react'
import { LESION_COLORS } from './HSLesionMarker'

/**
 * Lesion breakdown by type for a region
 */
export interface RegionLesionData {
  nodules: number
  abscesses: number
  drainingTunnels: number
  severity: 'none' | 'mild' | 'moderate' | 'severe'
}

interface BodyRegionProps {
  id: string
  name: string
  path: string
  isSelected: boolean
  isHovered: boolean
  hasFlares: boolean
  hasLesions?: boolean          // For HS lesion tracking
  isHSPriority?: boolean        // Highlight HS-prone areas
  lesionCount?: number          // Number of active lesions
  lesionData?: RegionLesionData // Detailed lesion breakdown
  regionCenter?: { x: number; y: number } // Center point for dots/tooltip
  hasBackgroundImage?: boolean  // Reduce opacity when body image is shown
  onClick: (regionId: string) => void
  onMouseEnter: (regionId: string) => void
  onMouseLeave: () => void
}

/**
 * Severity-based glow colors (inner glow effect)
 */
const SEVERITY_GLOW: Record<RegionLesionData['severity'], { color: string; opacity: number }> = {
  none: { color: 'transparent', opacity: 0 },
  mild: { color: '#fcd34d', opacity: 0.3 },      // Yellow
  moderate: { color: '#fb923c', opacity: 0.4 },   // Orange
  severe: { color: '#ef4444', opacity: 0.5 },     // Red
}

export function BodyRegion({
  id,
  name,
  path,
  isSelected,
  isHovered,
  hasFlares,
  hasLesions = false,
  isHSPriority = false,
  lesionCount = 0,
  lesionData,
  regionCenter,
  hasBackgroundImage = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: BodyRegionProps) {
  const severity = lesionData?.severity || 'none'
  const glowConfig = SEVERITY_GLOW[severity]

  // Determine fill and stroke based on state
  // When background image is shown, regions become more transparent overlays
  const getFill = () => {
    // Severity glow takes precedence when region has lesions
    if (hasLesions && severity !== 'none') {
      return glowConfig.color
    }
    if (isSelected) return 'rgba(59, 130, 246, 0.3)' // blue with opacity
    if (isHovered) {
      return isHSPriority ? 'rgba(255, 152, 0, 0.25)' : 'rgba(59, 130, 246, 0.2)'
    }
    // When background image is shown, use transparent fill by default
    if (hasBackgroundImage) return 'transparent'
    // Subtle highlight for HS-priority regions
    if (isHSPriority) return 'rgba(255, 152, 0, 0.05)'
    return 'transparent'
  }

  const getFillOpacity = () => {
    if (hasLesions && severity !== 'none') {
      return glowConfig.opacity
    }
    return 1
  }

  const getStroke = () => {
    if (hasLesions || hasFlares) return '#ef4444' // red for regions with lesions/flares
    if (isSelected) return '#2563eb' // darker blue
    if (isHovered) return isHSPriority ? '#FF9800' : '#3b82f6'
    if (isHSPriority) return '#FFB74D' // orange tint for HS priority
    // More subtle stroke when background image is shown
    if (hasBackgroundImage) return 'rgba(156, 163, 175, 0.4)'
    return '#cbd5e0' // gray
  }

  const getStrokeWidth = () => {
    if (isSelected) return 3
    if (hasLesions || hasFlares) return 2
    if (isHovered) return 2
    if (isHSPriority) return 1.5
    // Thinner stroke when background image is shown
    if (hasBackgroundImage) return 0.5
    return 1
  }

  const getStrokeDasharray = () => {
    // Dashed outline for HS-priority regions when not selected/hovered
    if (isHSPriority && !isSelected && !isHovered && !hasLesions) return '4,2'
    return 'none'
  }

  // Build lesion indicator dots
  const renderLesionDots = () => {
    if (!lesionData || !regionCenter || lesionCount === 0) return null

    const dots: JSX.Element[] = []
    const dotSize = 2.5
    const spacing = 6
    const totalDots = (lesionData.nodules > 0 ? 1 : 0) +
                      (lesionData.abscesses > 0 ? 1 : 0) +
                      (lesionData.drainingTunnels > 0 ? 1 : 0)

    if (totalDots === 0) return null

    // Center the dots horizontally
    const startX = regionCenter.x - ((totalDots - 1) * spacing) / 2
    let dotIndex = 0

    // Nodule dot (circle)
    if (lesionData.nodules > 0) {
      dots.push(
        <circle
          key="nodule-dot"
          cx={startX + dotIndex * spacing}
          cy={regionCenter.y}
          r={dotSize}
          fill={LESION_COLORS.nodule.fill}
          stroke={LESION_COLORS.nodule.stroke}
          strokeWidth={0.5}
        />
      )
      dotIndex++
    }

    // Abscess dot (diamond)
    if (lesionData.abscesses > 0) {
      const cx = startX + dotIndex * spacing
      const cy = regionCenter.y
      dots.push(
        <polygon
          key="abscess-dot"
          points={`${cx},${cy - dotSize} ${cx + dotSize},${cy} ${cx},${cy + dotSize} ${cx - dotSize},${cy}`}
          fill={LESION_COLORS.abscess.fill}
          stroke={LESION_COLORS.abscess.stroke}
          strokeWidth={0.5}
        />
      )
      dotIndex++
    }

    // Tunnel dot (triangle)
    if (lesionData.drainingTunnels > 0) {
      const cx = startX + dotIndex * spacing
      const cy = regionCenter.y
      dots.push(
        <polygon
          key="tunnel-dot"
          points={`${cx},${cy - dotSize} ${cx + dotSize},${cy + dotSize} ${cx - dotSize},${cy + dotSize}`}
          fill={LESION_COLORS.draining_tunnel.fill}
          stroke={LESION_COLORS.draining_tunnel.stroke}
          strokeWidth={0.5}
        />
      )
    }

    return dots
  }

  // Build tooltip content for hover
  const renderTooltip = () => {
    if (!isHovered || !regionCenter || lesionCount === 0) return null

    const tooltipY = regionCenter.y - 15
    const parts: string[] = []
    if (lesionData?.nodules) parts.push(`${lesionData.nodules}N`)
    if (lesionData?.abscesses) parts.push(`${lesionData.abscesses}A`)
    if (lesionData?.drainingTunnels) parts.push(`${lesionData.drainingTunnels}T`)
    const text = parts.length > 0 ? parts.join(' ') : `${lesionCount}`

    return (
      <g className="pointer-events-none">
        {/* Background pill */}
        <rect
          x={regionCenter.x - 18}
          y={tooltipY - 8}
          width={36}
          height={16}
          rx={4}
          fill="rgba(0, 0, 0, 0.75)"
        />
        {/* Text */}
        <text
          x={regionCenter.x}
          y={tooltipY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={8}
          fontWeight="bold"
        >
          {text}
        </text>
      </g>
    )
  }

  return (
    <g>
      {/* Region path with glow fill */}
      <path
        id={id}
        d={path}
        fill={getFill()}
        fillOpacity={getFillOpacity()}
        stroke={getStroke()}
        strokeWidth={getStrokeWidth()}
        strokeDasharray={getStrokeDasharray()}
        className="transition-all duration-200 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onClick(id)
        }}
        onMouseEnter={() => onMouseEnter(id)}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`${name} region${hasLesions ? ` (${lesionCount} lesion${lesionCount !== 1 ? 's' : ''})` : ''}${hasFlares ? ' (has active flares)' : ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick(id)
          }
        }}
      />

      {/* Lesion type indicator dots */}
      {renderLesionDots()}

      {/* Hover tooltip with count */}
      {renderTooltip()}
    </g>
  )
}
