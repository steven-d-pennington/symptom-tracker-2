interface BodyRegionProps {
  id: string
  name: string
  path: string
  isSelected: boolean
  isHovered: boolean
  hasFlares: boolean
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
  onClick,
  onMouseEnter,
  onMouseLeave,
}: BodyRegionProps) {
  // Determine fill and stroke based on state
  const getFill = () => {
    if (isSelected) return 'rgba(59, 130, 246, 0.3)' // blue with opacity
    if (isHovered) return 'rgba(59, 130, 246, 0.1)'
    return 'transparent'
  }

  const getStroke = () => {
    if (hasFlares) return '#ef4444' // red for regions with flares
    if (isSelected) return '#2563eb' // darker blue
    if (isHovered) return '#3b82f6' // blue
    return '#cbd5e0' // gray
  }

  const getStrokeWidth = () => {
    if (isSelected) return 3
    if (hasFlares) return 2
    if (isHovered) return 2
    return 1
  }

  return (
    <path
      id={id}
      d={path}
      fill={getFill()}
      stroke={getStroke()}
      strokeWidth={getStrokeWidth()}
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
