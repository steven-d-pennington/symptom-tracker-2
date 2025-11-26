/**
 * Waistband / Belt Line regions - 4 regions
 * Areas prone to friction from clothing
 */

import type { BodyMapRegion } from '../types'

export const WAISTBAND_REGIONS: BodyMapRegion[] = [
  {
    id: 'left-waist-flank',
    name: 'Left Waist/Flank',
    view: 'front',
    category: 'waistband',
    isHSPriority: true,
    // Left side of waist
    path: 'M 150 270 Q 140 280 140 300 L 155 310 L 170 305 Q 170 285 165 275 Z',
  },
  {
    id: 'right-waist-flank',
    name: 'Right Waist/Flank',
    view: 'front',
    category: 'waistband',
    isHSPriority: true,
    // Right side of waist (mirrored)
    path: 'M 250 270 Q 260 280 260 300 L 245 310 L 230 305 Q 230 285 235 275 Z',
  },
  {
    id: 'lower-abdomen-suprapubic',
    name: 'Lower Abdomen (suprapubic)',
    view: 'front',
    category: 'waistband',
    isHSPriority: true,
    // Area above pubic region, typical waistband location
    path: 'M 170 295 L 165 315 L 185 320 L 200 322 L 215 320 L 235 315 L 230 295 L 200 290 Z',
  },
  {
    id: 'lower-back-sacral',
    name: 'Lower Back (sacral)',
    view: 'back',
    category: 'waistband',
    isHSPriority: true,
    // Sacral area on back, above buttocks
    path: 'M 170 305 Q 165 320 170 335 L 200 340 L 230 335 Q 235 320 230 305 L 200 300 Z',
  },
]

export const WAISTBAND_GROUPS = [
  {
    id: 'waistband-front',
    name: 'Waistband (Front)',
    regionIds: ['left-waist-flank', 'right-waist-flank', 'lower-abdomen-suprapubic'],
  },
  {
    id: 'waistband-back',
    name: 'Waistband (Back)',
    regionIds: ['lower-back-sacral'],
  },
]
