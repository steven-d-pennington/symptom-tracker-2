/**
 * HS-Priority Body Map Regions (26 total)
 * These are areas most commonly affected by Hidradenitis Suppurativa
 */

export { AXILLAE_REGIONS, AXILLAE_GROUPS } from './axillae'
export { GROIN_REGIONS, GROIN_GROUPS } from './groin'
export { INFRAMAMMARY_REGIONS, INFRAMAMMARY_GROUPS } from './inframammary'
export { BUTTOCKS_REGIONS, BUTTOCKS_GROUPS } from './buttocks'
export { WAISTBAND_REGIONS, WAISTBAND_GROUPS } from './waistband'

import { AXILLAE_REGIONS } from './axillae'
import { GROIN_REGIONS } from './groin'
import { INFRAMAMMARY_REGIONS } from './inframammary'
import { BUTTOCKS_REGIONS } from './buttocks'
import { WAISTBAND_REGIONS } from './waistband'
import type { BodyMapRegion } from '../types'

/**
 * All HS-Priority regions combined
 * Total: 26 regions
 * - Axillae: 4
 * - Groin: 6
 * - Inframammary: 6
 * - Buttocks: 6
 * - Waistband: 4
 */
export const ALL_HS_PRIORITY_REGIONS: BodyMapRegion[] = [
  ...AXILLAE_REGIONS,
  ...GROIN_REGIONS,
  ...INFRAMAMMARY_REGIONS,
  ...BUTTOCKS_REGIONS,
  ...WAISTBAND_REGIONS,
]

/**
 * Get HS-priority regions for a specific view
 */
export function getHSPriorityRegionsForView(view: 'front' | 'back'): BodyMapRegion[] {
  return ALL_HS_PRIORITY_REGIONS.filter(r => r.view === view)
}

/**
 * HS-Priority region IDs for quick lookup
 */
export const HS_PRIORITY_REGION_IDS = new Set(
  ALL_HS_PRIORITY_REGIONS.map(r => r.id)
)

/**
 * Check if a region ID is HS-priority
 */
export function isHSPriorityRegion(regionId: string): boolean {
  return HS_PRIORITY_REGION_IDS.has(regionId)
}
