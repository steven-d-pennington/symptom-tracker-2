/**
 * Grouped HS Regions for simplified view at low zoom levels
 *
 * These combined paths merge the detailed sub-regions into single
 * larger regions for better visibility when zoomed out.
 */

import type { BodyMapRegion } from '../types'

export interface HSRegionGroup {
  id: string
  name: string
  view: 'front' | 'back'
  category: string
  path: string  // Combined/simplified path covering all sub-regions
  childRegionIds: string[]  // IDs of detailed regions this group contains
}

/**
 * Grouped HS regions for simplified display
 * These show as single regions at 1x zoom
 */
export const HS_REGION_GROUPS: HSRegionGroup[] = [
  // === FRONT VIEW ===

  // Left Axilla (combines central + peripheral)
  {
    id: 'left-axilla-group',
    name: 'Left Axilla',
    view: 'front',
    category: 'axillae',
    // Expanded bounding path that encompasses both central and peripheral
    path: 'M 130 120 Q 120 135 120 155 Q 120 175 140 185 L 180 180 Q 185 160 180 135 Q 175 120 160 115 Z',
    childRegionIds: ['left-axilla-central', 'left-axilla-peripheral'],
  },

  // Right Axilla (combines central + peripheral)
  {
    id: 'right-axilla-group',
    name: 'Right Axilla',
    view: 'front',
    category: 'axillae',
    // Mirrored expanded bounding path
    path: 'M 270 120 Q 280 135 280 155 Q 280 175 260 185 L 220 180 Q 215 160 220 135 Q 225 120 240 115 Z',
    childRegionIds: ['right-axilla-central', 'right-axilla-peripheral'],
  },

  // Left Chest/Inframammary (combines fold + breast area)
  {
    id: 'left-chest-group',
    name: 'Left Chest',
    view: 'front',
    category: 'inframammary',
    // Covers left breast/chest and inframammary fold area
    path: 'M 145 125 Q 135 145 140 170 Q 145 195 155 205 L 190 205 Q 200 180 195 150 Q 190 125 175 120 Z',
    childRegionIds: ['left-inframammary-fold', 'left-breast-chest'],
  },

  // Right Chest/Inframammary (combines fold + breast area)
  {
    id: 'right-chest-group',
    name: 'Right Chest',
    view: 'front',
    category: 'inframammary',
    // Mirrored chest area
    path: 'M 255 125 Q 265 145 260 170 Q 255 195 245 205 L 210 205 Q 200 180 205 150 Q 210 125 225 120 Z',
    childRegionIds: ['right-inframammary-fold', 'right-breast-chest'],
  },

  // Central Chest (combines intermammary + submammary)
  {
    id: 'central-chest-group',
    name: 'Central Chest',
    view: 'front',
    category: 'inframammary',
    path: 'M 185 125 L 180 175 Q 175 200 180 220 L 220 220 Q 225 200 220 175 L 215 125 Z',
    childRegionIds: ['intermammary', 'submammary'],
  },

  // Left Groin (combines inguinal + inner thigh)
  {
    id: 'left-groin-group',
    name: 'Left Groin',
    view: 'front',
    category: 'groin',
    // Covers inguinal fold and upper inner thigh
    path: 'M 145 310 Q 135 325 135 355 Q 138 390 148 395 L 185 390 Q 190 355 185 325 Q 180 310 165 305 Z',
    childRegionIds: ['left-groin-inguinal', 'left-inner-thigh-upper'],
  },

  // Right Groin (combines inguinal + inner thigh)
  {
    id: 'right-groin-group',
    name: 'Right Groin',
    view: 'front',
    category: 'groin',
    // Mirrored groin area
    path: 'M 255 310 Q 265 325 265 355 Q 262 390 252 395 L 215 390 Q 210 355 215 325 Q 220 310 235 305 Z',
    childRegionIds: ['right-groin-inguinal', 'right-inner-thigh-upper'],
  },

  // Central Groin (combines mons pubis + perineum)
  {
    id: 'central-groin-group',
    name: 'Central Groin',
    view: 'front',
    category: 'groin',
    path: 'M 180 305 L 175 340 Q 180 370 200 385 Q 220 370 225 340 L 220 305 Z',
    childRegionIds: ['mons-pubis', 'perineum'],
  },

  // Front Waistband (combines left flank, right flank, suprapubic)
  {
    id: 'waistband-front-group',
    name: 'Front Waistband',
    view: 'front',
    category: 'waistband',
    path: 'M 140 270 Q 135 285 140 310 L 200 320 L 260 310 Q 265 285 260 270 L 200 265 Z',
    childRegionIds: ['left-waist-flank', 'right-waist-flank', 'lower-abdomen-suprapubic'],
  },

  // === BACK VIEW ===

  // Left Buttock (combines upper + lower)
  {
    id: 'left-buttock-group',
    name: 'Left Buttock',
    view: 'back',
    category: 'buttocks',
    path: 'M 145 310 Q 130 340 135 380 Q 140 410 160 420 L 200 415 Q 205 380 200 340 Q 195 310 175 305 Z',
    childRegionIds: ['left-buttock-upper', 'left-buttock-lower'],
  },

  // Right Buttock (combines upper + lower)
  {
    id: 'right-buttock-group',
    name: 'Right Buttock',
    view: 'back',
    category: 'buttocks',
    path: 'M 255 310 Q 270 340 265 380 Q 260 410 240 420 L 200 415 Q 195 380 200 340 Q 205 310 225 305 Z',
    childRegionIds: ['right-buttock-upper', 'right-buttock-lower'],
  },

  // Central Gluteal (combines cleft + perianal)
  {
    id: 'central-gluteal-group',
    name: 'Central Gluteal',
    view: 'back',
    category: 'buttocks',
    path: 'M 185 300 L 180 360 Q 185 400 200 420 Q 215 400 220 360 L 215 300 Z',
    childRegionIds: ['gluteal-cleft', 'perianal'],
  },

  // Lower Back / Sacral (single region for back waistband area)
  {
    id: 'lower-back-group',
    name: 'Lower Back',
    view: 'back',
    category: 'waistband',
    path: 'M 170 305 Q 165 320 170 335 L 200 340 L 230 335 Q 235 320 230 305 L 200 300 Z',
    childRegionIds: ['lower-back-sacral'],
  },
]

/**
 * Get grouped HS regions for a specific view
 */
export function getHSRegionGroupsForView(view: 'front' | 'back'): HSRegionGroup[] {
  return HS_REGION_GROUPS.filter(g => g.view === view)
}

/**
 * Get group that contains a specific child region ID
 */
export function getGroupForChildRegion(childRegionId: string): HSRegionGroup | undefined {
  return HS_REGION_GROUPS.find(g => g.childRegionIds.includes(childRegionId))
}

/**
 * Check if a region ID is a group ID
 */
export function isHSRegionGroup(regionId: string): boolean {
  return HS_REGION_GROUPS.some(g => g.id === regionId)
}

/**
 * Get all child region IDs for a group
 */
export function getChildRegionIds(groupId: string): string[] {
  const group = HS_REGION_GROUPS.find(g => g.id === groupId)
  return group?.childRegionIds ?? []
}

/**
 * Zoom threshold for showing detailed regions vs grouped regions
 * Below this zoom level, show grouped regions
 * At or above this level, show detailed sub-regions
 */
export const HS_DETAIL_ZOOM_THRESHOLD = 1.5
