/**
 * Region Mapping System
 * Maps between 2D SVG regions and 3D model regions for cross-view compatibility
 */

import { HS_REGIONS_3D, Region3D } from './regions3D'

/**
 * 3D position coordinates in model space
 */
export interface Position3D {
  x: number  // Left-right (-0.89 to 0.89)
  y: number  // Front-back (-0.19 to 0.18, positive = front)
  z: number  // Vertical (0 to 2.0, 0 = feet, 2 = head)
}

/**
 * Maps 3D region IDs to their corresponding 2D sub-region IDs
 * 3D regions are coarser; each maps to one or more 2D regions
 */
export const REGION_3D_TO_2D: Record<string, string[]> = {
  // Axillae
  'axilla-left': ['left-axilla-central', 'left-axilla-peripheral'],
  'axilla-right': ['right-axilla-central', 'right-axilla-peripheral'],

  // Groin
  'groin-left': ['left-groin-inguinal'],
  'groin-right': ['right-groin-inguinal'],
  'inner-thigh-left': ['left-inner-thigh-upper'],
  'inner-thigh-right': ['right-inner-thigh-upper'],

  // Inframammary
  'inframammary-left': ['left-inframammary-fold', 'left-breast-chest'],
  'inframammary-right': ['right-inframammary-fold', 'right-breast-chest'],

  // Buttocks
  'buttock-left': ['left-buttock-upper', 'left-buttock-lower'],
  'buttock-right': ['right-buttock-upper', 'right-buttock-lower'],
  'gluteal-fold-left': ['left-buttock-lower'],
  'gluteal-fold-right': ['right-buttock-lower'],

  // Waistband
  'waist-left': ['left-waist-flank'],
  'waist-right': ['right-waist-flank'],
  'lower-abdomen': ['lower-abdomen-suprapubic', 'mons-pubis'],
  'lower-back': ['lower-back-sacral'],
}

/**
 * Reverse mapping: 2D region ID → 3D region ID
 * Built from REGION_3D_TO_2D for quick lookups
 */
export const REGION_2D_TO_3D: Record<string, string> = Object.entries(REGION_3D_TO_2D).reduce(
  (acc, [region3D, regions2D]) => {
    regions2D.forEach(region2D => {
      acc[region2D] = region3D
    })
    return acc
  },
  {} as Record<string, string>
)

/**
 * Additional 2D regions that don't have a direct 3D equivalent
 * These map to the nearest 3D region
 */
const ADDITIONAL_2D_TO_3D_MAPPINGS: Record<string, string> = {
  // Central groin areas → lower abdomen
  'perineum': 'lower-abdomen',

  // Central chest areas → nearest inframammary
  'intermammary': 'inframammary-left', // Default to left, could be either
  'submammary': 'lower-abdomen',

  // Central gluteal areas → nearest buttock
  'gluteal-cleft': 'lower-back',
  'perianal': 'lower-back',
}

// Merge additional mappings
Object.assign(REGION_2D_TO_3D, ADDITIONAL_2D_TO_3D_MAPPINGS)

/**
 * Get the 3D region for a 2D region ID
 */
export function get3DRegionFor2D(regionId2D: string): Region3D | null {
  const region3DId = REGION_2D_TO_3D[regionId2D]
  if (!region3DId) return null
  return HS_REGIONS_3D.find(r => r.id === region3DId) || null
}

/**
 * Get all 2D region IDs for a 3D region
 */
export function get2DRegionsFor3D(regionId3D: string): string[] {
  return REGION_3D_TO_2D[regionId3D] || []
}

/**
 * Get the primary 2D region for a 3D region (first in the list)
 */
export function getPrimary2DRegionFor3D(regionId3D: string): string | null {
  const regions = REGION_3D_TO_2D[regionId3D]
  return regions?.[0] || null
}

/**
 * Convert 2D region coordinates to approximate 3D position
 *
 * @param regionId - The 2D region ID (e.g., 'left-axilla-central')
 * @param coords - Coordinates within the region (0-100 range)
 * @returns 3D position in model space, or null if region not found
 */
export function get3DPositionForLesion(
  regionId: string,
  coords: { x: number; y: number }
): Position3D | null {
  // Find the corresponding 3D region
  const region3D = get3DRegionFor2D(regionId)
  if (!region3D) return null

  const center = region3D.position
  const radius = region3D.radius

  // Map 2D percentage coords (0-100) to offset from 3D center
  // Normalize to -1 to 1 range
  const normalizedX = (coords.x - 50) / 50
  const normalizedY = (coords.y - 50) / 50

  // Apply offset based on region orientation
  // The offset direction depends on which side/view the region is on
  let offsetX = 0
  let offsetY = 0
  let offsetZ = 0

  switch (region3D.side) {
    case 'front':
      // Front-facing regions: X maps to left-right, Y maps to up-down
      offsetX = normalizedX * radius * 0.5
      offsetZ = -normalizedY * radius * 0.5  // Negative because Y increases downward in 2D
      break
    case 'back':
      // Back-facing regions: same as front but mirrored
      offsetX = -normalizedX * radius * 0.5  // Mirrored on X
      offsetZ = -normalizedY * radius * 0.5
      break
    case 'left':
    case 'right':
      // Side-facing regions: X maps to front-back, Y maps to up-down
      offsetY = normalizedX * radius * 0.5 * (region3D.side === 'left' ? -1 : 1)
      offsetZ = -normalizedY * radius * 0.5
      break
  }

  return {
    x: center.x + offsetX,
    y: center.y + offsetY,
    z: center.z + offsetZ,
  }
}

/**
 * Convert 3D position to approximate 2D region and coordinates
 * Used when placing lesions directly in 3D view
 *
 * @param position3D - Position in model space
 * @returns Object with regionId and coords, or null if no matching region
 */
export function get2DPositionForLesion(
  position3D: Position3D
): { regionId: string; coords: { x: number; y: number } } | null {
  // Find the nearest 3D region
  let nearestRegion: Region3D | null = null
  let minDistance = Infinity

  for (const region of HS_REGIONS_3D) {
    const dx = position3D.x - region.position.x
    const dy = position3D.y - region.position.y
    const dz = position3D.z - region.position.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (distance < minDistance && distance < region.radius * 2) {
      minDistance = distance
      nearestRegion = region
    }
  }

  if (!nearestRegion) return null

  // Get the primary 2D region for this 3D region
  const regionId = getPrimary2DRegionFor3D(nearestRegion.id)
  if (!regionId) return null

  // Calculate relative position within the region
  const center = nearestRegion.position
  const radius = nearestRegion.radius

  let normalizedX = 0
  let normalizedY = 0

  switch (nearestRegion.side) {
    case 'front':
      normalizedX = (position3D.x - center.x) / (radius * 0.5)
      normalizedY = -(position3D.z - center.z) / (radius * 0.5)
      break
    case 'back':
      normalizedX = -(position3D.x - center.x) / (radius * 0.5)
      normalizedY = -(position3D.z - center.z) / (radius * 0.5)
      break
    case 'left':
    case 'right':
      normalizedX = (position3D.y - center.y) / (radius * 0.5) * (nearestRegion.side === 'left' ? -1 : 1)
      normalizedY = -(position3D.z - center.z) / (radius * 0.5)
      break
  }

  // Convert back to 0-100 range and clamp
  const coords = {
    x: Math.max(0, Math.min(100, (normalizedX * 50) + 50)),
    y: Math.max(0, Math.min(100, (normalizedY * 50) + 50)),
  }

  return { regionId, coords }
}

/**
 * Check if a 2D region ID is a valid HS-priority region
 */
export function isValid2DRegion(regionId: string): boolean {
  return regionId in REGION_2D_TO_3D
}

/**
 * Check if a 3D region ID is a valid HS-priority region
 */
export function isValid3DRegion(regionId: string): boolean {
  return regionId in REGION_3D_TO_2D
}

/**
 * Get the view (front/back) for a 2D region based on its 3D mapping
 */
export function getViewFor2DRegion(regionId: string): 'front' | 'back' | null {
  const region3D = get3DRegionFor2D(regionId)
  if (!region3D) return null

  // Map 3D sides to 2D views
  switch (region3D.side) {
    case 'front':
    case 'left':
    case 'right':
      return 'front'
    case 'back':
      return 'back'
    default:
      return null
  }
}
