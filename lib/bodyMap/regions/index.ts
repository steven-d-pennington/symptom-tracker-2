/**
 * Body Map Regions - Complete Set (58 regions)
 *
 * HS-Priority Regions: 26
 * - Axillae: 4
 * - Groin: 6
 * - Inframammary: 6
 * - Buttocks: 6
 * - Waistband: 4
 *
 * Standard Regions: 32
 * - Head/Neck: 6
 * - Torso Front: 4
 * - Torso Back: 4
 * - Arms: 12
 * - Legs: 12
 */

// Types
export * from './types'

// HS-Priority regions
export {
  ALL_HS_PRIORITY_REGIONS,
  getHSPriorityRegionsForView,
  isHSPriorityRegion,
  HS_PRIORITY_REGION_IDS,
  AXILLAE_REGIONS,
  GROIN_REGIONS,
  INFRAMAMMARY_REGIONS,
  BUTTOCKS_REGIONS,
  WAISTBAND_REGIONS,
} from './hsPriority'

// Standard regions
export {
  ALL_STANDARD_REGIONS,
  getStandardRegionsForView,
  HEAD_NECK_REGIONS,
  TORSO_FRONT_REGIONS,
  TORSO_BACK_REGIONS,
  ARMS_REGIONS,
  LEGS_REGIONS,
} from './standard'

import { ALL_HS_PRIORITY_REGIONS, getHSPriorityRegionsForView } from './hsPriority'
import { ALL_STANDARD_REGIONS, getStandardRegionsForView } from './standard'
import type { BodyMapRegion, RegionCategory } from './types'

/**
 * All body map regions (58 total)
 */
export const ALL_REGIONS: BodyMapRegion[] = [
  ...ALL_HS_PRIORITY_REGIONS,
  ...ALL_STANDARD_REGIONS,
]

/**
 * Region count by type
 */
export const REGION_COUNTS = {
  hsPriority: ALL_HS_PRIORITY_REGIONS.length,
  standard: ALL_STANDARD_REGIONS.length,
  total: ALL_REGIONS.length,
} as const

/**
 * Get all regions for a specific view
 */
export function getRegionsForView(view: 'front' | 'back'): BodyMapRegion[] {
  return [
    ...getHSPriorityRegionsForView(view),
    ...getStandardRegionsForView(view),
  ]
}

/**
 * Get region by ID
 */
export function getRegionById(id: string): BodyMapRegion | undefined {
  return ALL_REGIONS.find(r => r.id === id)
}

/**
 * Get regions by category
 */
export function getRegionsByCategory(category: RegionCategory): BodyMapRegion[] {
  return ALL_REGIONS.filter(r => r.category === category)
}

/**
 * Get regions by parent region (for grouped regions like left-axilla)
 */
export function getRegionsByParent(parentRegion: string): BodyMapRegion[] {
  return ALL_REGIONS.filter(r => r.parentRegion === parentRegion)
}

/**
 * Search regions by name (case-insensitive)
 */
export function searchRegions(query: string): BodyMapRegion[] {
  const lowerQuery = query.toLowerCase()
  return ALL_REGIONS.filter(r =>
    r.name.toLowerCase().includes(lowerQuery) ||
    r.id.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get HS-priority regions (convenience export)
 */
export function getHSPriorityRegions(): BodyMapRegion[] {
  return ALL_HS_PRIORITY_REGIONS
}

/**
 * Get standard regions (convenience export)
 */
export function getStandardRegions(): BodyMapRegion[] {
  return ALL_STANDARD_REGIONS
}

/**
 * ViewBox dimensions for SVG (matching existing)
 */
export const VIEW_BOX = {
  width: 400,
  height: 700,
  x: 0,
  y: 0,
} as const

/**
 * Get region display name with HS badge
 */
export function getRegionDisplayName(region: BodyMapRegion): string {
  return region.isHSPriority ? `${region.name} ★` : region.name
}

/**
 * Group regions by category
 */
export function groupRegionsByCategory(): Map<RegionCategory, BodyMapRegion[]> {
  const grouped = new Map<RegionCategory, BodyMapRegion[]>()

  for (const region of ALL_REGIONS) {
    const existing = grouped.get(region.category) || []
    existing.push(region)
    grouped.set(region.category, existing)
  }

  return grouped
}
