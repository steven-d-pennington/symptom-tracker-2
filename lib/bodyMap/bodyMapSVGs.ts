/**
 * Simplified SVG body map definitions
 * Note: This is a simplified version for MVP. Detailed 93+ region SVGs
 * should be created using design tools (Figma, Illustrator) for production.
 */

export interface BodyMapRegionPath {
  id: string
  name: string
  path: string
  view: 'front' | 'back' | 'side'
  category: string
}

/**
 * Simplified front view body map
 * Creates basic shapes representing major body regions
 */
export const FRONT_VIEW_REGIONS: BodyMapRegionPath[] = [
  // Head
  {
    id: 'head',
    name: 'Head',
    path: 'M 180 30 Q 160 30 160 60 Q 160 85 180 90 L 220 90 Q 240 85 240 60 Q 240 30 220 30 Z',
    view: 'front',
    category: 'head',
  },
  // Neck
  {
    id: 'neck-front',
    name: 'Neck (front)',
    path: 'M 185 90 L 185 115 L 215 115 L 215 90 Z',
    view: 'front',
    category: 'head',
  },
  // Shoulders
  {
    id: 'left-shoulder',
    name: 'Left Shoulder',
    path: 'M 140 115 Q 130 120 130 135 L 160 150 L 170 120 Z',
    view: 'front',
    category: 'upper-limb',
  },
  {
    id: 'right-shoulder',
    name: 'Right Shoulder',
    path: 'M 260 115 Q 270 120 270 135 L 240 150 L 230 120 Z',
    view: 'front',
    category: 'upper-limb',
  },
  // Chest
  {
    id: 'chest-upper',
    name: 'Chest (upper)',
    path: 'M 170 115 L 170 170 L 230 170 L 230 115 Z',
    view: 'front',
    category: 'torso',
  },
  {
    id: 'chest-lower',
    name: 'Chest (lower)',
    path: 'M 170 170 L 170 220 L 230 220 L 230 170 Z',
    view: 'front',
    category: 'torso',
  },
  // Abdomen
  {
    id: 'abdomen-upper',
    name: 'Abdomen (upper)',
    path: 'M 170 220 L 170 270 L 230 270 L 230 220 Z',
    view: 'front',
    category: 'torso',
  },
  {
    id: 'abdomen-lower',
    name: 'Abdomen (lower)',
    path: 'M 170 270 L 170 320 L 230 320 L 230 270 Z',
    view: 'front',
    category: 'torso',
  },
  // Groin (HS-specific)
  {
    id: 'groin-left',
    name: 'Groin (left)',
    path: 'M 170 320 L 170 350 L 195 350 L 195 320 Z',
    view: 'front',
    category: 'specialized',
  },
  {
    id: 'groin-center',
    name: 'Groin (center)',
    path: 'M 195 320 L 195 350 L 205 350 L 205 320 Z',
    view: 'front',
    category: 'specialized',
  },
  {
    id: 'groin-right',
    name: 'Groin (right)',
    path: 'M 205 320 L 205 350 L 230 350 L 230 320 Z',
    view: 'front',
    category: 'specialized',
  },
  // Arms
  {
    id: 'left-upper-arm',
    name: 'Left Upper Arm',
    path: 'M 130 135 L 120 230 L 145 235 L 160 150 Z',
    view: 'front',
    category: 'upper-limb',
  },
  {
    id: 'right-upper-arm',
    name: 'Right Upper Arm',
    path: 'M 270 135 L 280 230 L 255 235 L 240 150 Z',
    view: 'front',
    category: 'upper-limb',
  },
  {
    id: 'left-forearm',
    name: 'Left Forearm',
    path: 'M 120 230 L 110 330 L 135 335 L 145 235 Z',
    view: 'front',
    category: 'upper-limb',
  },
  {
    id: 'right-forearm',
    name: 'Right Forearm',
    path: 'M 280 230 L 290 330 L 265 335 L 255 235 Z',
    view: 'front',
    category: 'upper-limb',
  },
  {
    id: 'left-hand',
    name: 'Left Hand',
    path: 'M 110 330 L 105 365 L 140 370 L 135 335 Z',
    view: 'front',
    category: 'upper-limb',
  },
  {
    id: 'right-hand',
    name: 'Right Hand',
    path: 'M 290 330 L 295 365 L 260 370 L 265 335 Z',
    view: 'front',
    category: 'upper-limb',
  },
  // Legs
  {
    id: 'left-thigh-upper',
    name: 'Left Thigh (upper)',
    path: 'M 170 350 L 165 450 L 195 450 L 195 350 Z',
    view: 'front',
    category: 'lower-limb',
  },
  {
    id: 'right-thigh-upper',
    name: 'Right Thigh (upper)',
    path: 'M 205 350 L 205 450 L 235 450 L 230 350 Z',
    view: 'front',
    category: 'lower-limb',
  },
  {
    id: 'left-thigh-lower',
    name: 'Left Thigh (lower)',
    path: 'M 165 450 L 160 550 L 190 550 L 195 450 Z',
    view: 'front',
    category: 'lower-limb',
  },
  {
    id: 'right-thigh-lower',
    name: 'Right Thigh (lower)',
    path: 'M 205 450 L 210 550 L 240 550 L 235 450 Z',
    view: 'front',
    category: 'lower-limb',
  },
  {
    id: 'left-shin',
    name: 'Left Shin',
    path: 'M 160 550 L 155 650 L 185 650 L 190 550 Z',
    view: 'front',
    category: 'lower-limb',
  },
  {
    id: 'right-shin',
    name: 'Right Shin',
    path: 'M 210 550 L 215 650 L 245 650 L 240 550 Z',
    view: 'front',
    category: 'lower-limb',
  },
  {
    id: 'left-foot-top',
    name: 'Left Foot (top)',
    path: 'M 155 650 L 145 685 L 185 685 L 185 650 Z',
    view: 'front',
    category: 'lower-limb',
  },
  {
    id: 'right-foot-top',
    name: 'Right Foot (top)',
    path: 'M 215 650 L 255 685 L 215 685 L 215 650 Z',
    view: 'front',
    category: 'lower-limb',
  },
]

/**
 * Simplified back view body map
 */
export const BACK_VIEW_REGIONS: BodyMapRegionPath[] = [
  // Head back
  {
    id: 'head-back',
    name: 'Head (back)',
    path: 'M 180 30 Q 160 30 160 60 Q 160 85 180 90 L 220 90 Q 240 85 240 60 Q 240 30 220 30 Z',
    view: 'back',
    category: 'head',
  },
  // Neck back
  {
    id: 'neck-back',
    name: 'Neck (back)',
    path: 'M 185 90 L 185 115 L 215 115 L 215 90 Z',
    view: 'back',
    category: 'head',
  },
  // Back
  {
    id: 'upper-back',
    name: 'Upper Back',
    path: 'M 170 115 L 170 200 L 230 200 L 230 115 Z',
    view: 'back',
    category: 'torso',
  },
  {
    id: 'mid-back',
    name: 'Mid Back',
    path: 'M 170 200 L 170 270 L 230 270 L 230 200 Z',
    view: 'back',
    category: 'torso',
  },
  {
    id: 'lower-back',
    name: 'Lower Back',
    path: 'M 170 270 L 170 340 L 230 340 L 230 270 Z',
    view: 'back',
    category: 'torso',
  },
  // Buttocks
  {
    id: 'left-buttock',
    name: 'Left Buttock',
    path: 'M 170 340 L 170 390 L 200 390 L 200 340 Z',
    view: 'back',
    category: 'lower-limb',
  },
  {
    id: 'right-buttock',
    name: 'Right Buttock',
    path: 'M 200 340 L 200 390 L 230 390 L 230 340 Z',
    view: 'back',
    category: 'lower-limb',
  },
  // Arms back
  {
    id: 'left-upper-arm-back',
    name: 'Left Upper Arm (back)',
    path: 'M 130 135 L 120 230 L 145 235 L 160 150 Z',
    view: 'back',
    category: 'upper-limb',
  },
  {
    id: 'right-upper-arm-back',
    name: 'Right Upper Arm (back)',
    path: 'M 270 135 L 280 230 L 255 235 L 240 150 Z',
    view: 'back',
    category: 'upper-limb',
  },
  // Legs back
  {
    id: 'left-thigh-back-upper',
    name: 'Left Thigh (back upper)',
    path: 'M 170 390 L 165 490 L 195 490 L 200 390 Z',
    view: 'back',
    category: 'lower-limb',
  },
  {
    id: 'right-thigh-back-upper',
    name: 'Right Thigh (back upper)',
    path: 'M 200 390 L 205 490 L 235 490 L 230 390 Z',
    view: 'back',
    category: 'lower-limb',
  },
  {
    id: 'left-calf-back',
    name: 'Left Calf (back)',
    path: 'M 165 490 L 160 600 L 190 600 L 195 490 Z',
    view: 'back',
    category: 'lower-limb',
  },
  {
    id: 'right-calf-back',
    name: 'Right Calf (back)',
    path: 'M 205 490 L 210 600 L 240 600 L 235 490 Z',
    view: 'back',
    category: 'lower-limb',
  },
]

/**
 * Get regions for a specific view
 */
export function getRegionsForView(view: 'front' | 'back' | 'side'): BodyMapRegionPath[] {
  if (view === 'back') return BACK_VIEW_REGIONS
  if (view === 'side') return [] // Side view can be added later
  return FRONT_VIEW_REGIONS
}

/**
 * ViewBox dimensions for SVG
 */
export const VIEW_BOX = {
  width: 400,
  height: 700,
  x: 0,
  y: 0,
}
