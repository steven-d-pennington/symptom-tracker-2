'use client'

import { useMemo } from 'react'
import {
  getHSPriorityRegions,
  groupRegionsByCategory,
  type RegionCategory,
} from '@/lib/bodyMap/regions'

interface RegionNavigationProps {
  currentView: 'front' | 'back'
  selectedRegion?: string | null
  onRegionSelect: (regionId: string) => void
  onViewChange: (view: 'front' | 'back') => void
  lesionCountByRegion?: Map<string, number>
  compact?: boolean
}

/**
 * Category display names and order
 */
const CATEGORY_CONFIG: Record<RegionCategory, { label: string; order: number }> = {
  axillae: { label: 'Axillae', order: 1 },
  groin: { label: 'Groin', order: 2 },
  inframammary: { label: 'Inframammary', order: 3 },
  buttocks: { label: 'Buttocks', order: 4 },
  waistband: { label: 'Waistband', order: 5 },
  'head-neck': { label: 'Head/Neck', order: 6 },
  'torso-front': { label: 'Torso (Front)', order: 7 },
  'torso-back': { label: 'Torso (Back)', order: 8 },
  arms: { label: 'Arms', order: 9 },
  legs: { label: 'Legs', order: 10 },
}

/**
 * Quick navigation to HS-priority regions
 */
export function RegionNavigation({
  currentView,
  selectedRegion,
  onRegionSelect,
  onViewChange,
  lesionCountByRegion = new Map(),
  compact = false,
}: RegionNavigationProps) {
  // Group HS-priority regions by category
  const hsPriorityByCategory = useMemo(() => {
    const regions = getHSPriorityRegions()
    const grouped = new Map<RegionCategory, typeof regions>()

    regions.forEach((region) => {
      if (region.view === currentView) {
        const existing = grouped.get(region.category) || []
        existing.push(region)
        grouped.set(region.category, existing)
      }
    })

    // Sort by category order
    return Array.from(grouped.entries()).sort(
      (a, b) => (CATEGORY_CONFIG[a[0]]?.order || 99) - (CATEGORY_CONFIG[b[0]]?.order || 99)
    )
  }, [currentView])

  // Count total lesions in HS-priority regions
  const totalHSLesions = useMemo(() => {
    let count = 0
    for (const [category, regions] of hsPriorityByCategory) {
      for (const region of regions) {
        count += lesionCountByRegion.get(region.id) || 0
      }
    }
    return count
  }, [hsPriorityByCategory, lesionCountByRegion])

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {hsPriorityByCategory.map(([category, regions]) => (
          <div key={category} className="relative">
            <select
              value={regions.some((r) => r.id === selectedRegion) ? selectedRegion || '' : ''}
              onChange={(e) => {
                if (e.target.value) onRegionSelect(e.target.value)
              }}
              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="">{CATEGORY_CONFIG[category]?.label || category}</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                  {lesionCountByRegion.get(region.id)
                    ? ` (${lesionCountByRegion.get(region.id)})`
                    : ''}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            HS-Priority Regions
          </h3>
          {totalHSLesions > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {totalHSLesions} lesion{totalHSLesions !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => onViewChange('front')}
            className={`flex-1 px-3 py-1.5 text-sm rounded transition-colors ${
              currentView === 'front'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => onViewChange('back')}
            className={`flex-1 px-3 py-1.5 text-sm rounded transition-colors ${
              currentView === 'back'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Back
          </button>
        </div>
      </div>

      {/* Region List */}
      <div className="max-h-80 overflow-y-auto">
        {hsPriorityByCategory.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No HS-priority regions in {currentView} view
          </div>
        ) : (
          hsPriorityByCategory.map(([category, regions]) => (
            <div key={category}>
              {/* Category header */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {CATEGORY_CONFIG[category]?.label || category}
                </span>
              </div>

              {/* Regions in category */}
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {regions.map((region) => {
                  const lesionCount = lesionCountByRegion.get(region.id) || 0
                  const isSelected = selectedRegion === region.id

                  return (
                    <li key={region.id}>
                      <button
                        onClick={() => onRegionSelect(region.id)}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-sm">{region.name}</span>
                        {lesionCount > 0 && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isSelected
                                ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}
                          >
                            {lesionCount}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Breadcrumb navigation for zoomed view
 */
export function RegionBreadcrumb({
  regionId,
  regionName,
  onBackToOverview,
}: {
  regionId: string
  regionName: string
  onBackToOverview: () => void
}) {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <button
        onClick={onBackToOverview}
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        Body Map
      </button>
      <span className="text-gray-400">/</span>
      <span className="text-gray-700 dark:text-gray-300 font-medium">
        {regionName}
      </span>
    </nav>
  )
}
