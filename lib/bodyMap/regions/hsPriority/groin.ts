/**
 * Groin / Inguinal regions - 6 regions
 * High granularity for HS-prone areas
 */

import type { BodyMapRegion } from '../types'

export const GROIN_REGIONS: BodyMapRegion[] = [
  // Left Groin
  {
    id: 'left-groin-inguinal',
    name: 'Left Groin (inguinal fold)',
    view: 'front',
    category: 'groin',
    isHSPriority: true,
    parentRegion: 'left-groin',
    // Inguinal fold area - crease between thigh and lower abdomen
    path: 'M 165 315 Q 155 320 150 335 L 165 350 L 180 340 Q 175 325 170 315 Z',
  },
  {
    id: 'left-inner-thigh-upper',
    name: 'Left Inner Thigh (upper)',
    view: 'front',
    category: 'groin',
    isHSPriority: true,
    parentRegion: 'left-groin',
    // Upper inner thigh, adjacent to groin
    path: 'M 165 350 L 150 335 Q 145 355 148 380 L 175 380 Q 180 360 180 340 Z',
  },
  // Right Groin
  {
    id: 'right-groin-inguinal',
    name: 'Right Groin (inguinal fold)',
    view: 'front',
    category: 'groin',
    isHSPriority: true,
    parentRegion: 'right-groin',
    // Mirrored inguinal fold
    path: 'M 235 315 Q 245 320 250 335 L 235 350 L 220 340 Q 225 325 230 315 Z',
  },
  {
    id: 'right-inner-thigh-upper',
    name: 'Right Inner Thigh (upper)',
    view: 'front',
    category: 'groin',
    isHSPriority: true,
    parentRegion: 'right-groin',
    // Upper inner thigh, mirrored
    path: 'M 235 350 L 250 335 Q 255 355 252 380 L 225 380 Q 220 360 220 340 Z',
  },
  // Central areas
  {
    id: 'mons-pubis',
    name: 'Mons Pubis',
    view: 'front',
    category: 'groin',
    isHSPriority: true,
    // Central pubic area
    path: 'M 185 310 L 180 330 L 190 345 L 200 350 L 210 345 L 220 330 L 215 310 Z',
  },
  {
    id: 'perineum',
    name: 'Perineum',
    view: 'front',
    category: 'groin',
    isHSPriority: true,
    // Area between genitals and anus - shown on front view as lower central
    path: 'M 190 345 L 185 365 L 200 375 L 215 365 L 210 345 L 200 350 Z',
  },
]

export const GROIN_GROUPS = [
  {
    id: 'left-groin',
    name: 'Left Groin',
    regionIds: ['left-groin-inguinal', 'left-inner-thigh-upper'],
  },
  {
    id: 'right-groin',
    name: 'Right Groin',
    regionIds: ['right-groin-inguinal', 'right-inner-thigh-upper'],
  },
  {
    id: 'central-groin',
    name: 'Central Groin',
    regionIds: ['mons-pubis', 'perineum'],
  },
]
