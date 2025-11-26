'use client'

import { useMemo, useState, useCallback } from 'react'
import { HSLesion } from '@/lib/hs/types'
import { getRegionById, getRegionsByParent, isHSPriorityRegion } from '@/lib/bodyMap/regions'
import { HSLesionMarker, LESION_COLORS } from './HSLesionMarker'
import { PreviewMarkerSVG, PreviewControls } from './PreviewMarker'

interface ZoomedRegionViewProps {
  regionId: string
  lesions: HSLesion[]
  onBack: () => void
  onAddLesion: (coordinates: { x: number; y: number }, regionId: string) => void
  onLesionClick?: (lesion: HSLesion) => void
  hurleyStage?: 1 | 2 | 3
}

/**
 * Calculate a bounding box for a region to enable zoomed view
 * Parses the SVG path to find min/max coordinates
 */
function getRegionBounds(path: string): { minX: number; minY: number; maxX: number; maxY: number } {
  // Extract all numbers from the path (coordinates)
  const numbers = path.match(/-?\d+\.?\d*/g)?.map(Number) || []

  if (numbers.length < 2) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 700 }
  }

  // Separate X and Y coordinates (assuming they alternate)
  const xCoords: number[] = []
  const yCoords: number[] = []

  for (let i = 0; i < numbers.length; i++) {
    if (i % 2 === 0) {
      xCoords.push(numbers[i])
    } else {
      yCoords.push(numbers[i])
    }
  }

  const minX = Math.min(...xCoords)
  const maxX = Math.max(...xCoords)
  const minY = Math.min(...yCoords)
  const maxY = Math.max(...yCoords)

  // Add some padding
  const paddingX = (maxX - minX) * 0.3
  const paddingY = (maxY - minY) * 0.3

  return {
    minX: Math.max(0, minX - paddingX),
    minY: Math.max(0, minY - paddingY),
    maxX: Math.min(400, maxX + paddingX),
    maxY: Math.min(700, maxY + paddingY),
  }
}

/**
 * Hurley Stage badge component
 */
function HurleyStageBadge({ stage }: { stage: 1 | 2 | 3 }) {
  const stageColors = {
    1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    3: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  const stageDescriptions = {
    1: 'Single or multiple abscesses without sinus tracts',
    2: 'Recurrent abscesses with sinus tracts and scarring',
    3: 'Diffuse involvement with multiple interconnected tracts',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stageColors[stage]}`}
      title={stageDescriptions[stage]}
    >
      Hurley {stage === 1 ? 'I' : stage === 2 ? 'II' : 'III'}
    </span>
  )
}

export function ZoomedRegionView({
  regionId,
  lesions,
  onBack,
  onAddLesion,
  onLesionClick,
  hurleyStage,
}: ZoomedRegionViewProps) {
  const region = getRegionById(regionId)
  const isHSPriority = isHSPriorityRegion(regionId)

  // Preview marker state - allows repositioning before confirming placement
  const [previewCoordinates, setPreviewCoordinates] = useState<{ x: number; y: number } | null>(null)

  // Get child regions if this is a parent region
  const childRegions = useMemo(() => {
    return getRegionsByParent(regionId)
  }, [regionId])

  // Get lesions for this region
  const regionLesions = useMemo(() => {
    return lesions.filter((l) => l.regionId === regionId || childRegions.some((r) => r.id === l.regionId))
  }, [lesions, regionId, childRegions])

  // Calculate viewBox for zoomed view
  const bounds = useMemo(() => {
    if (!region) return { minX: 0, minY: 0, maxX: 400, maxY: 700 }
    return getRegionBounds(region.path)
  }, [region])

  const viewBox = `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`

  // Handle click on SVG - shows preview marker (can be repositioned by clicking elsewhere)
  const handleSVGClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()

    // Calculate click position relative to viewBox
    const viewBoxWidth = bounds.maxX - bounds.minX
    const viewBoxHeight = bounds.maxY - bounds.minY

    const clickX = ((e.clientX - rect.left) / rect.width) * viewBoxWidth + bounds.minX
    const clickY = ((e.clientY - rect.top) / rect.height) * viewBoxHeight + bounds.minY

    // Normalize to 0-1 range based on full body map dimensions (400x700)
    const normalizedX = clickX / 400
    const normalizedY = clickY / 700

    // Set preview coordinates (user can reposition by clicking elsewhere)
    setPreviewCoordinates({ x: normalizedX, y: normalizedY })
  }, [bounds])

  // Confirm placement - calls onAddLesion with preview coordinates
  const handleConfirmPlacement = useCallback(() => {
    if (previewCoordinates) {
      onAddLesion(previewCoordinates, regionId)
      setPreviewCoordinates(null)
    }
  }, [previewCoordinates, onAddLesion, regionId])

  // Cancel placement - clears preview
  const handleCancelPlacement = useCallback(() => {
    setPreviewCoordinates(null)
  }, [])

  if (!region) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Region not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to overview
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            aria-label="Back to body map overview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {region.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              {isHSPriority && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                  HS Priority
                </span>
              )}
              {hurleyStage && <HurleyStageBadge stage={hurleyStage} />}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {regionLesions.length} lesion{regionLesions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Zoomed region view */}
      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full">
          <svg
            viewBox={viewBox}
            className="w-full h-full max-h-[500px]"
            onClick={handleSVGClick}
            role="img"
            aria-label={`Detailed view of ${region.name} region. Click to add a lesion.`}
          >
            {/* Region path */}
            <path
              d={region.path}
              fill={isHSPriority ? 'rgba(255, 152, 0, 0.1)' : 'rgba(156, 163, 175, 0.1)'}
              stroke={isHSPriority ? '#FF9800' : '#9CA3AF'}
              strokeWidth={2}
              className="transition-colors"
            />

            {/* Child regions if any */}
            {childRegions.map((childRegion) => (
              <path
                key={childRegion.id}
                d={childRegion.path}
                fill="rgba(59, 130, 246, 0.05)"
                stroke="#3b82f6"
                strokeWidth={1}
                strokeDasharray="4,2"
                className="pointer-events-none"
              />
            ))}

            {/* Lesion markers */}
            {regionLesions.map((lesion) => (
              <HSLesionMarker
                key={lesion.guid}
                lesion={lesion}
                viewBox={{ width: 400, height: 700 }}
                onClick={onLesionClick}
                showLabel={true}
              />
            ))}

            {/* Preview marker - shown before confirming placement */}
            {previewCoordinates && (
              <PreviewMarkerSVG
                coordinates={previewCoordinates}
                viewBox={{ width: 400, height: 700 }}
                bounds={bounds}
              />
            )}
          </svg>

          {/* Instructions and controls - context-aware based on preview state */}
          {previewCoordinates ? (
            <div className="mt-4">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                Tap elsewhere to reposition
              </p>
              <PreviewControls
                onConfirm={handleConfirmPlacement}
                onCancel={handleCancelPlacement}
              />
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Tap anywhere in the region to place a new lesion
            </p>
          )}
        </div>
      </div>

      {/* Legend for lesion types */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: LESION_COLORS.nodule.fill }}
            />
            <span className="text-gray-600 dark:text-gray-400">Nodule</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rotate-45"
              style={{ backgroundColor: LESION_COLORS.abscess.fill }}
            />
            <span className="text-gray-600 dark:text-gray-400">Abscess</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent"
              style={{ borderBottomColor: LESION_COLORS.draining_tunnel.fill }}
            />
            <span className="text-gray-600 dark:text-gray-400">Tunnel</span>
          </div>
        </div>
      </div>
    </div>
  )
}
