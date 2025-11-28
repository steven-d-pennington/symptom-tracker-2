'use client'

import { useState, useRef, useMemo } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Flare, BodyImagePreference } from '@/lib/db'
import { FlareMarker } from './FlareMarker'
import { BodyRegion, RegionLesionData } from './BodyRegion'
import { ViewSelector } from './ViewSelector'
import { normalizeCoordinates } from '@/lib/bodyMap/coordinateUtils'
import { getRegionsForView, VIEW_BOX, isHSPriorityRegion } from '@/lib/bodyMap/regions'
import { getBodyImageUrl } from '@/lib/settings/userSettings'

export type { BodyImagePreference }

/**
 * Calculate approximate center of an SVG path by extracting coordinates
 */
function getPathCenter(pathData: string): { x: number; y: number } {
  const numbers = pathData.match(/-?\d+\.?\d*/g)?.map(Number) || []

  if (numbers.length < 2) {
    return { x: 200, y: 350 }
  }

  const xCoords: number[] = []
  const yCoords: number[] = []

  for (let i = 0; i < numbers.length; i++) {
    if (i % 2 === 0) {
      xCoords.push(numbers[i])
    } else {
      yCoords.push(numbers[i])
    }
  }

  const avgX = xCoords.reduce((a, b) => a + b, 0) / xCoords.length
  const avgY = yCoords.reduce((a, b) => a + b, 0) / yCoords.length

  return { x: avgX, y: avgY }
}

interface BodyMapProps {
  flares?: Flare[]
  showResolvedFlares?: boolean
  selectedRegion?: string | null
  onRegionClick?: (regionId: string) => void
  onCoordinateCapture?: (x: number, y: number, regionId: string) => void
  onFlareClick?: (flare: Flare) => void
  className?: string
  // HS-specific props
  highlightHSRegions?: boolean        // Show visual distinction for HS-prone areas
  regionsWithLesions?: Set<string>    // Region IDs that have active lesions
  lesionCounts?: Map<string, number>  // Lesion count per region
  regionLesionData?: Map<string, RegionLesionData> // Detailed lesion data per region
  // Body image preference (null = no background image)
  bodyImagePreference?: BodyImagePreference | null
}

export function BodyMap({
  flares = [],
  showResolvedFlares = false,
  selectedRegion = null,
  onRegionClick,
  onCoordinateCapture,
  onFlareClick,
  className = '',
  highlightHSRegions = true,
  regionsWithLesions = new Set(),
  lesionCounts = new Map(),
  regionLesionData = new Map(),
  bodyImagePreference = null,
}: BodyMapProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front')
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [imageLoadError, setImageLoadError] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  // Get the image URL for current view and preference
  const bodyImageUrl = useMemo(() => {
    if (!bodyImagePreference || imageLoadError) return null
    return getBodyImageUrl(bodyImagePreference, currentView)
  }, [bodyImagePreference, currentView, imageLoadError])

  // Reset image error when preference or view changes
  const handleImageError = () => {
    setImageLoadError(true)
  }

  // Determine if we're showing a background image
  const hasBackgroundImage = !!bodyImageUrl

  const regions = getRegionsForView(currentView)

  // Pre-compute region centers for tooltip/dot positioning
  const regionCenters = useMemo(() => {
    const centers = new Map<string, { x: number; y: number }>()
    for (const region of regions) {
      centers.set(region.id, getPathCenter(region.path))
    }
    return centers
  }, [regions])

  // Filter flares based on settings and current view
  const visibleFlares = flares.filter((flare) => {
    if (!showResolvedFlares && flare.status === 'resolved') return false
    // Check if flare's region matches current view
    const flareRegion = regions.find((r) => r.id === flare.bodyRegion)
    return !!flareRegion
  })

  // Get regions that have flares
  const regionsWithFlares = new Set(visibleFlares.map((f) => f.bodyRegion))

  const handleRegionClick = (regionId: string) => {
    setAnnouncement(`Selected ${regionId} region`)
    if (onRegionClick) {
      onRegionClick(regionId)
    }
  }

  const handleRegionHover = (regionId: string) => {
    const region = regions.find((r) => r.id === regionId)
    if (region) {
      setHoveredRegion(regionId)
      setAnnouncement(`Hovering over ${region.name}`)
    }
  }

  const handleRegionLeave = () => {
    setHoveredRegion(null)
    setAnnouncement('')
  }

  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !onCoordinateCapture) return

    // Get click coordinates
    const coords = normalizeCoordinates(
      e.clientX,
      e.clientY,
      svgRef.current
    )

    // Determine which region was clicked based on event target
    const target = e.target as SVGPathElement
    const regionId = target.id || selectedRegion || 'unknown'

    onCoordinateCapture(coords.x, coords.y, regionId)
    setAnnouncement(`Captured coordinates: ${(coords.x * 100).toFixed(1)}%, ${(coords.y * 100).toFixed(1)}%`)
  }

  const handleFlareMarkerClick = (flare: Flare) => {
    if (onFlareClick) {
      onFlareClick(flare)
    }
    setAnnouncement(`Selected flare in ${flare.bodyRegion}, severity ${flare.currentSeverity}`)
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <ViewSelector currentView={currentView} onViewChange={setCurrentView} />

        {/* Show resolved flares toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={showResolvedFlares}
            onChange={(e) => {
              // This should be controlled from parent, but we can emit an event
              setAnnouncement(
                e.target.checked ? 'Showing resolved flares' : 'Hiding resolved flares'
              )
            }}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          Show resolved flares
        </label>
      </div>

      {/* Zoom/Pan Container */}
      <div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={3}
          centerOnInit
          limitToBounds={false}
          doubleClick={{ disabled: true }}
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
        >
          {({ zoomIn, zoomOut, resetTransform, zoomToElement }) => (
            <>
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => zoomIn()}
                  className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Zoom in"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Zoom out"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
                  aria-label="Reset zoom"
                >
                  1×
                </button>
              </div>

              {/* Body Map SVG */}
              <TransformComponent
                wrapperClass="w-full"
                contentClass="flex items-center justify-center min-h-[600px]"
              >
                <svg
                  ref={svgRef}
                  viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
                  className="w-full max-w-2xl"
                  onClick={handleSVGClick}
                  role="img"
                  aria-label="Interactive body map for flare location tracking"
                >
                  {/* Background Body Image (if enabled) */}
                  {bodyImageUrl && (
                    <image
                      href={bodyImageUrl}
                      x={VIEW_BOX.x}
                      y={VIEW_BOX.y}
                      width={VIEW_BOX.width}
                      height={VIEW_BOX.height}
                      preserveAspectRatio="xMidYMid meet"
                      opacity={0.9}
                      aria-hidden="true"
                      onError={handleImageError}
                    />
                  )}

                  {/* Body Regions */}
                  <g role="group" aria-label="Body regions">
                    {regions.map((region) => (
                      <BodyRegion
                        key={region.id}
                        id={region.id}
                        name={region.name}
                        path={region.path}
                        isSelected={selectedRegion === region.id}
                        isHovered={hoveredRegion === region.id}
                        hasFlares={regionsWithFlares.has(region.id)}
                        hasLesions={regionsWithLesions.has(region.id)}
                        isHSPriority={highlightHSRegions && isHSPriorityRegion(region.id)}
                        lesionCount={lesionCounts.get(region.id) ?? 0}
                        lesionData={regionLesionData.get(region.id)}
                        regionCenter={regionCenters.get(region.id)}
                        hasBackgroundImage={hasBackgroundImage}
                        onClick={handleRegionClick}
                        onMouseEnter={handleRegionHover}
                        onMouseLeave={handleRegionLeave}
                      />
                    ))}
                  </g>

                  {/* Flare Markers */}
                  <g role="group" aria-label="Flare markers">
                    {visibleFlares.map((flare) => (
                      <FlareMarker
                        key={flare.guid}
                        flare={flare}
                        onClick={handleFlareMarkerClick}
                      />
                    ))}
                  </g>
                </svg>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {hoveredRegion
          ? `Hovering: ${regions.find((r) => r.id === hoveredRegion)?.name}`
          : 'Click a region to select it • Scroll or pinch to zoom • Drag to pan'}
      </div>

      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  )
}
