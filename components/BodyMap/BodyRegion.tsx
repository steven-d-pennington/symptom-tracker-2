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
  onClick: (regionId: string) => void
  onMouseEnter: (regionId: string) => void
  onMouseLeave: () => void
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
  onClick,
  onMouseEnter,
  onMouseLeave,
}: BodyRegionProps) {
  // Determine fill and stroke based on state
  const getFill = () => {
    if (isSelected) return 'rgba(59, 130, 246, 0.3)' // blue with opacity
    if (isHovered) {
      return isHSPriority ? 'rgba(255, 152, 0, 0.2)' : 'rgba(59, 130, 246, 0.1)'
    }
    // Subtle highlight for HS-priority regions
    if (isHSPriority) return 'rgba(255, 152, 0, 0.05)'
    return 'transparent'
  }

  const getStroke = () => {
    if (hasLesions || hasFlares) return '#ef4444' // red for regions with lesions/flares
    if (isSelected) return '#2563eb' // darker blue
    if (isHovered) return isHSPriority ? '#FF9800' : '#3b82f6'
    if (isHSPriority) return '#FFB74D' // orange tint for HS priority
    return '#cbd5e0' // gray
  }

  const getStrokeWidth = () => {
    if (isSelected) return 3
    if (hasLesions || hasFlares) return 2
    if (isHovered) return 2
    if (isHSPriority) return 1.5
    return 1
  }

  const getStrokeDasharray = () => {
    // Dashed outline for HS-priority regions when not selected/hovered
    if (isHSPriority && !isSelected && !isHovered && !hasLesions) return '4,2'
    return 'none'
  }

  return (
    <path
      id={id}
      d={path}
      fill={getFill()}
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
      aria-label={`${name} region${hasFlares ? ' (has active flares)' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(id)
        }
      }}
    />
  )
}
