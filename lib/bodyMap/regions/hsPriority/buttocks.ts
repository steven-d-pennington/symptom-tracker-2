/**
 * Buttocks / Gluteal regions - 6 regions
 * High granularity for HS-prone areas (back view)
 */

import type { BodyMapRegion } from '../types'

export const BUTTOCKS_REGIONS: BodyMapRegion[] = [
  // Left Buttock
  {
    id: 'left-buttock-upper',
    name: 'Left Buttock (upper)',
    view: 'back',
    category: 'buttocks',
    isHSPriority: true,
    parentRegion: 'left-buttock',
    // Upper gluteal area
    path: 'M 165 335 Q 155 345 155 360 L 175 370 L 195 365 Q 195 350 190 340 L 175 335 Z',
  },
  {
    id: 'left-buttock-lower',
    name: 'Left Buttock (lower)',
    view: 'back',
    category: 'buttocks',
    isHSPriority: true,
    parentRegion: 'left-buttock',
    // Lower gluteal area / gluteal fold
    path: 'M 155 360 Q 150 380 155 400 L 175 405 L 195 400 Q 195 380 195 365 L 175 370 Z',
  },
  // Right Buttock
  {
    id: 'right-buttock-upper',
    name: 'Right Buttock (upper)',
    view: 'back',
    category: 'buttocks',
    isHSPriority: true,
    parentRegion: 'right-buttock',
    // Mirrored upper gluteal
    path: 'M 235 335 Q 245 345 245 360 L 225 370 L 205 365 Q 205 350 210 340 L 225 335 Z',
  },
  {
    id: 'right-buttock-lower',
    name: 'Right Buttock (lower)',
    view: 'back',
    category: 'buttocks',
    isHSPriority: true,
    parentRegion: 'right-buttock',
    // Mirrored lower gluteal
    path: 'M 245 360 Q 250 380 245 400 L 225 405 L 205 400 Q 205 380 205 365 L 225 370 Z',
  },
  // Central areas
  {
    id: 'gluteal-cleft',
    name: 'Gluteal Cleft (intergluteal)',
    view: 'back',
    category: 'buttocks',
    isHSPriority: true,
    // Vertical cleft between buttocks
    path: 'M 195 340 L 192 370 L 195 400 L 205 400 L 208 370 L 205 340 Z',
  },
  {
    id: 'perianal',
    name: 'Perianal',
    view: 'back',
    category: 'buttocks',
    isHSPriority: true,
    // Area around anus
    path: 'M 190 395 Q 185 405 190 415 L 200 420 L 210 415 Q 215 405 210 395 L 200 390 Z',
  },
]

export const BUTTOCKS_GROUPS = [
  {
    id: 'left-buttock',
    name: 'Left Buttock',
    regionIds: ['left-buttock-upper', 'left-buttock-lower'],
  },
  {
    id: 'right-buttock',
    name: 'Right Buttock',
    regionIds: ['right-buttock-upper', 'right-buttock-lower'],
  },
  {
    id: 'central-gluteal',
    name: 'Central Gluteal',
    regionIds: ['gluteal-cleft', 'perianal'],
  },
]
