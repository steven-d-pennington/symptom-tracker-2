/**
 * Enhanced body map region types for HS tracking
 */

export interface BodyMapRegion {
  id: string                      // Unique ID e.g., 'left-axilla-central'
  name: string                    // Display name e.g., 'Left Axilla (central)'
  path: string                    // SVG path data
  view: 'front' | 'back'
  category: RegionCategory
  isHSPriority: boolean          // True for HS-prone areas
  parentRegion?: string          // For grouping e.g., 'left-axilla'
  detailedSVG?: string           // Path to detailed region SVG for zoom view
}

export type RegionCategory =
  | 'axillae'
  | 'groin'
  | 'inframammary'
  | 'buttocks'
  | 'waistband'
  | 'head-neck'
  | 'torso-front'
  | 'torso-back'
  | 'arms'
  | 'legs'

export interface RegionGroup {
  id: string
  name: string
  category: RegionCategory
  regions: BodyMapRegion[]
  isHSPriority: boolean
}

/**
 * HS Priority region categories
 */
export const HS_PRIORITY_CATEGORIES: RegionCategory[] = [
  'axillae',
  'groin',
  'inframammary',
  'buttocks',
  'waistband',
]

/**
 * Standard region categories
 */
export const STANDARD_CATEGORIES: RegionCategory[] = [
  'head-neck',
  'torso-front',
  'torso-back',
  'arms',
  'legs',
]

/**
 * Check if a category is HS-priority
 */
export function isHSPriorityCategory(category: RegionCategory): boolean {
  return HS_PRIORITY_CATEGORIES.includes(category)
}

/**
 * Color scheme for HS priority highlighting
 */
export const HS_PRIORITY_COLORS = {
  default: 'rgba(255, 152, 0, 0.1)',    // Subtle orange tint
  hover: 'rgba(255, 152, 0, 0.3)',
  selected: 'rgba(255, 152, 0, 0.5)',
  border: '#FF9800',
} as const

/**
 * Standard region colors
 */
export const STANDARD_REGION_COLORS = {
  default: 'rgba(156, 163, 175, 0.1)',  // Gray tint
  hover: 'rgba(156, 163, 175, 0.3)',
  selected: 'rgba(59, 130, 246, 0.3)',
  border: '#9CA3AF',
} as const
