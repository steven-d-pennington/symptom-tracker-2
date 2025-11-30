'use client'

import { useMemo, useState } from 'react'
import { HSLesion } from '@/lib/hs/types'
import { getRegionsByIds, isHSPriorityRegion } from '@/lib/bodyMap/regions'
import type { HSRegionGroup } from '@/lib/bodyMap/regions'
import type { BodyMapRegion } from '@/lib/bodyMap/regions/types'
import { LESION_COLORS } from './HSLesionMarker'

interface GroupZoomViewProps {
  group: HSRegionGroup
  lesions: HSLesion[]
  onBack: () => void
  onSubRegionClick: (regionId: string) => void
}

/**
 * Calculate a bounding box for a region path
 */
function getRegionBounds(path: string): { minX: number; minY: number; maxX: number; maxY: number } {
  const numbers = path.match(/-?\d+\.?\d*/g)?.map(Number) || []

  if (numbers.length < 2) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 700 }
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

  return {
    minX: Math.min(...xCoords),
    minY: Math.min(...yCoords),
    maxX: Math.max(...xCoords),
    maxY: Math.max(...yCoords),
  }
}

/**
 * Calculate combined bounding box for multiple regions
 */
function getMultiRegionBounds(regions: BodyMapRegion[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const region of regions) {
    const bounds = getRegionBounds(region.path)
    minX = Math.min(minX, bounds.minX)
    minY = Math.min(minY, bounds.minY)
    maxX = Math.max(maxX, bounds.maxX)
    maxY = Math.max(maxY, bounds.maxY)
  }

  // Add padding
  const padX = (maxX - minX) * 0.3
  const padY = (maxY - minY) * 0.3

  return {
    minX: Math.max(0, minX - padX),
    minY: Math.max(0, minY - padY),
    maxX: Math.min(400, maxX + padX),
    maxY: Math.min(700, maxY + padY),
  }
}

/**
 * Calculate center of a region for label placement
 */
function getRegionCenter(path: string): { x: number; y: number } {
  const numbers = path.match(/-?\d+\.?\d*/g)?.map(Number) || []

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

  return {
    x: xCoords.reduce((a, b) => a + b, 0) / xCoords.length,
    y: yCoords.reduce((a, b) => a + b, 0) / yCoords.length,
  }
}

export function GroupZoomView({
  group,
  lesions,
  onBack,
  onSubRegionClick,
}: GroupZoomViewProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  // Get actual region objects for child regions
  const childRegions = useMemo(() => {
    return getRegionsByIds(group.childRegionIds)
  }, [group.childRegionIds])

  // Calculate viewBox to fit all child regions
  const bounds = useMemo(() => {
    if (childRegions.length === 0) {
      return { minX: 0, minY: 0, maxX: 400, maxY: 700 }
    }
    return getMultiRegionBounds(childRegions)
  }, [childRegions])

  const viewBox = `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`

  // Count lesions per child region
  const lesionCountsByRegion = useMemo(() => {
    const counts = new Map<string, number>()
    for (const lesion of lesions) {
      if (group.childRegionIds.includes(lesion.regionId)) {
        counts.set(lesion.regionId, (counts.get(lesion.regionId) || 0) + 1)
      }
    }
    return counts
  }, [lesions, group.childRegionIds])

  // Total lesions in this group
  const totalLesions = useMemo(() => {
    return lesions.filter(l => group.childRegionIds.includes(l.regionId)).length
  }, [lesions, group.childRegionIds])

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
              {group.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                HS Priority
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {childRegions.length} sub-regions
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {totalLesions} lesion{totalLesions !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Zoomed group view */}
      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full">
          <svg
            viewBox={viewBox}
            className="w-full h-full max-h-[500px]"
            role="img"
            aria-label={`Detailed view of ${group.name}. Select a sub-region.`}
          >
            {/* Render each child region */}
            {childRegions.map((region) => {
              const isHovered = hoveredRegion === region.id
              const lesionCount = lesionCountsByRegion.get(region.id) || 0
              const center = getRegionCenter(region.path)

              return (
                <g key={region.id}>
                  {/* Region path */}
                  <path
                    d={region.path}
                    fill={isHovered ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.1)'}
                    stroke={isHovered ? '#FF9800' : '#FFB74D'}
                    strokeWidth={isHovered ? 3 : 2}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSubRegionClick(region.id)}
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  />

                  {/* Region label */}
                  <text
                    x={center.x}
                    y={center.y - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHovered ? '#FF9800' : '#666'}
                    fontSize={10}
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    className="pointer-events-none select-none"
                    style={{ textShadow: '0 0 3px white, 0 0 3px white' }}
                  >
                    {region.name.replace(/\([^)]*\)/g, '').trim()}
                  </text>

                  {/* Lesion count badge */}
                  {lesionCount > 0 && (
                    <g className="pointer-events-none">
                      <circle
                        cx={center.x}
                        cy={center.y + 8}
                        r={8}
                        fill="#ef4444"
                      />
                      <text
                        x={center.x}
                        y={center.y + 9}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize={9}
                        fontWeight="bold"
                      >
                        {lesionCount}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Instructions */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {hoveredRegion
              ? `Click to select: ${childRegions.find(r => r.id === hoveredRegion)?.name}`
              : 'Select a sub-region to add or view lesions'}
          </p>
        </div>
      </div>

      {/* Legend */}
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
