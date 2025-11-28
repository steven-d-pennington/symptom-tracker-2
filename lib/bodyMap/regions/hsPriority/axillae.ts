/**
 * Axillae (Armpit) regions - 4 regions
 * High granularity for HS-prone areas
 */

import type { BodyMapRegion } from '../types'

export const AXILLAE_REGIONS: BodyMapRegion[] = [
  // Left Axilla
  {
    id: 'left-axilla-central',
    name: 'Left Axilla (central)',
    view: 'front',
    category: 'axillae',
    isHSPriority: true,
    parentRegion: 'left-axilla',
    // Positioned in the left armpit area
    path: 'M 152 130 Q 145 140 145 155 Q 145 165 155 170 L 165 165 Q 168 155 165 140 Q 162 130 152 130 Z',
  },
  {
    id: 'left-axilla-peripheral',
    name: 'Left Axilla (peripheral)',
    view: 'front',
    category: 'axillae',
    isHSPriority: true,
    parentRegion: 'left-axilla',
    // Outer ring around central axilla
    path: 'M 140 125 Q 130 135 130 150 Q 130 170 145 180 L 152 130 M 165 170 L 175 180 Q 180 165 178 145 Q 175 130 165 125 L 152 130 Z',
  },
  // Right Axilla
  {
    id: 'right-axilla-central',
    name: 'Right Axilla (central)',
    view: 'front',
    category: 'axillae',
    isHSPriority: true,
    parentRegion: 'right-axilla',
    // Positioned in the right armpit area (mirrored)
    path: 'M 248 130 Q 255 140 255 155 Q 255 165 245 170 L 235 165 Q 232 155 235 140 Q 238 130 248 130 Z',
  },
  {
    id: 'right-axilla-peripheral',
    name: 'Right Axilla (peripheral)',
    view: 'front',
    category: 'axillae',
    isHSPriority: true,
    parentRegion: 'right-axilla',
    // Outer ring around central axilla
    path: 'M 260 125 Q 270 135 270 150 Q 270 170 255 180 L 248 130 M 235 170 L 225 180 Q 220 165 222 145 Q 225 130 235 125 L 248 130 Z',
  },
]

export const AXILLAE_GROUPS = [
  {
    id: 'left-axilla',
    name: 'Left Axilla',
    regionIds: ['left-axilla-central', 'left-axilla-peripheral'],
  },
  {
    id: 'right-axilla',
    name: 'Right Axilla',
    regionIds: ['right-axilla-central', 'right-axilla-peripheral'],
  },
]
