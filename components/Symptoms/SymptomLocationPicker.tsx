'use client'

import { useState, useRef } from 'react'
import { getRegionsForView, VIEW_BOX, FRONT_VIEW_REGIONS, BACK_VIEW_REGIONS } from '@/lib/bodyMap/bodyMapSVGs'
import { normalizeCoordinates } from '@/lib/bodyMap/coordinateUtils'

interface SymptomLocationPickerProps {
  selectedRegion?: string
  selectedCoordinates?: { x: number; y: number }
  onLocationSelect: (region: string, coordinates: { x: number; y: number }) => void
  onClear?: () => void
  className?: string
}

export function SymptomLocationPicker({
  selectedRegion,
  selectedCoordinates,
  onLocationSelect,
  onClear,
  className = '',
}: SymptomLocationPickerProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front')
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const regions = getRegionsForView(currentView)

  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return

    const coords = normalizeCoordinates(e.clientX, e.clientY, svgRef.current)
    const target = e.target as SVGPathElement
    const regionId = target.id || hoveredRegion || 'unknown'

    onLocationSelect(regionId, coords)
    setIsExpanded(false)
  }

  const handleRegionClick = (regionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!svgRef.current) return

    // Get center of region for coordinates
    const region = regions.find((r) => r.id === regionId)
    if (region) {
      // Use click position
      const coords = normalizeCoordinates(e.clientX, e.clientY, svgRef.current)
      onLocationSelect(regionId, coords)
      setIsExpanded(false)
    }
  }

  // Determine which view to show for selected region
  const getViewForRegion = (regionId: string) => {
    const frontIds = new Set(FRONT_VIEW_REGIONS.map((r) => r.id))
    const backIds = new Set(BACK_VIEW_REGIONS.map((r) => r.id))
    if (backIds.has(regionId)) return 'back'
    return 'front'
  }

  if (!isExpanded) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location (optional)
          </label>
          {selectedRegion && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Clear
            </button>
          )}
        </div>

        {selectedRegion ? (
          <div
            onClick={() => setIsExpanded(true)}
            className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {selectedRegion.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
                {selectedCoordinates && (
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ({(selectedCoordinates.x * 100).toFixed(1)}%, {(selectedCoordinates.y * 100).toFixed(1)}%)
                  </p>
                )}
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400">Change</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="mt-2 w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            + Tap to add body location
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`${className} border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Location
        </label>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setCurrentView('front')}
          className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            currentView === 'front'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('back')}
          className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            currentView === 'back'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Back
        </button>
      </div>

      {/* Body Map */}
      <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
        <svg
          ref={svgRef}
          viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
          className="w-full h-auto max-h-80 cursor-crosshair"
          onClick={handleSVGClick}
        >
          {/* Body Regions */}
          {regions.map((region) => (
            <path
              key={region.id}
              id={region.id}
              d={region.path}
              fill={
                selectedRegion === region.id
                  ? '#3b82f6'
                  : hoveredRegion === region.id
                    ? '#93c5fd'
                    : '#e5e7eb'
              }
              stroke={selectedRegion === region.id ? '#1d4ed8' : '#d1d5db'}
              strokeWidth={selectedRegion === region.id ? 2 : 1}
              className="transition-colors cursor-pointer"
              onClick={(e) => handleRegionClick(region.id, e)}
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
            />
          ))}

          {/* Selected Point Marker */}
          {selectedCoordinates && selectedRegion && getViewForRegion(selectedRegion) === currentView && (
            <g>
              <circle
                cx={selectedCoordinates.x * VIEW_BOX.width}
                cy={selectedCoordinates.y * VIEW_BOX.height}
                r={12}
                fill="#ef4444"
                opacity={0.3}
              />
              <circle
                cx={selectedCoordinates.x * VIEW_BOX.width}
                cy={selectedCoordinates.y * VIEW_BOX.height}
                r={8}
                fill="#ef4444"
                stroke="white"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
      </div>

      {/* Hover info */}
      <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        {hoveredRegion
          ? regions.find((r) => r.id === hoveredRegion)?.name || hoveredRegion
          : 'Tap a region to select location'}
      </div>
    </div>
  )
}
