'use client'

import { useState, useRef, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Flare } from '@/lib/db'
import { FlareMarker } from './FlareMarker'
import { BodyRegion } from './BodyRegion'
import { ViewSelector } from './ViewSelector'
import { normalizeCoordinates } from '@/lib/bodyMap/coordinateUtils'
import { getRegionsForView, VIEW_BOX } from '@/lib/bodyMap/bodyMapSVGs'

interface BodyMapProps {
  flares?: Flare[]
  showResolvedFlares?: boolean
  selectedRegion?: string | null
  onRegionClick?: (regionId: string) => void
  onCoordinateCapture?: (x: number, y: number, regionId: string) => void
  onFlareClick?: (flare: Flare) => void
  className?: string
}

export function BodyMap({
  flares = [],
  showResolvedFlares = false,
  selectedRegion = null,
  onRegionClick,
  onCoordinateCapture,
  onFlareClick,
  className = '',
}: BodyMapProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back' | 'side'>('front')
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)

  const regions = getRegionsForView(currentView)

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
          limitToBounds
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
