/**
 * Standard Body Map Regions (32 total)
 * Non-HS-priority areas that complete the body map
 */

import type { BodyMapRegion } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// HEAD & NECK - 6 regions
// ═══════════════════════════════════════════════════════════════════════════════

export const HEAD_NECK_REGIONS: BodyMapRegion[] = [
  {
    id: 'head-face-front',
    name: 'Head/Face (front)',
    view: 'front',
    category: 'head-neck',
    isHSPriority: false,
    path: 'M 180 25 Q 155 25 155 55 Q 155 85 180 90 L 220 90 Q 245 85 245 55 Q 245 25 220 25 Z',
  },
  {
    id: 'head-scalp-back',
    name: 'Head/Scalp (back)',
    view: 'back',
    category: 'head-neck',
    isHSPriority: false,
    path: 'M 180 25 Q 155 25 155 55 Q 155 85 180 90 L 220 90 Q 245 85 245 55 Q 245 25 220 25 Z',
  },
  {
    id: 'neck-front',
    name: 'Neck (front)',
    view: 'front',
    category: 'head-neck',
    isHSPriority: false,
    path: 'M 185 90 L 180 120 L 220 120 L 215 90 Z',
  },
  {
    id: 'neck-back',
    name: 'Neck (back)',
    view: 'back',
    category: 'head-neck',
    isHSPriority: false,
    path: 'M 185 90 L 180 120 L 220 120 L 215 90 Z',
  },
  {
    id: 'left-ear-area',
    name: 'Left Ear area',
    view: 'front',
    category: 'head-neck',
    isHSPriority: false,
    path: 'M 152 45 Q 145 50 145 65 Q 145 75 152 80 L 155 55 Z',
  },
  {
    id: 'right-ear-area',
    name: 'Right Ear area',
    view: 'front',
    category: 'head-neck',
    isHSPriority: false,
    path: 'M 248 45 Q 255 50 255 65 Q 255 75 248 80 L 245 55 Z',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// TORSO - FRONT - 4 regions
// ═══════════════════════════════════════════════════════════════════════════════

export const TORSO_FRONT_REGIONS: BodyMapRegion[] = [
  {
    id: 'upper-chest-left',
    name: 'Upper Chest (left)',
    view: 'front',
    category: 'torso-front',
    isHSPriority: false,
    path: 'M 165 120 L 155 130 L 155 160 L 190 165 L 190 125 Z',
  },
  {
    id: 'upper-chest-right',
    name: 'Upper Chest (right)',
    view: 'front',
    category: 'torso-front',
    isHSPriority: false,
    path: 'M 235 120 L 245 130 L 245 160 L 210 165 L 210 125 Z',
  },
  {
    id: 'upper-abdomen',
    name: 'Upper Abdomen',
    view: 'front',
    category: 'torso-front',
    isHSPriority: false,
    path: 'M 165 220 L 160 260 L 200 265 L 240 260 L 235 220 L 200 215 Z',
  },
  {
    id: 'mid-abdomen',
    name: 'Mid Abdomen',
    view: 'front',
    category: 'torso-front',
    isHSPriority: false,
    path: 'M 160 260 L 158 300 L 200 305 L 242 300 L 240 260 L 200 265 Z',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// TORSO - BACK - 4 regions
// ═══════════════════════════════════════════════════════════════════════════════

export const TORSO_BACK_REGIONS: BodyMapRegion[] = [
  {
    id: 'upper-back-left',
    name: 'Upper Back (left)',
    view: 'back',
    category: 'torso-back',
    isHSPriority: false,
    path: 'M 165 120 L 155 140 L 155 200 L 195 205 L 195 125 Z',
  },
  {
    id: 'upper-back-right',
    name: 'Upper Back (right)',
    view: 'back',
    category: 'torso-back',
    isHSPriority: false,
    path: 'M 235 120 L 245 140 L 245 200 L 205 205 L 205 125 Z',
  },
  {
    id: 'mid-back-left',
    name: 'Mid Back (left)',
    view: 'back',
    category: 'torso-back',
    isHSPriority: false,
    path: 'M 155 200 L 155 270 L 195 275 L 195 205 Z',
  },
  {
    id: 'mid-back-right',
    name: 'Mid Back (right)',
    view: 'back',
    category: 'torso-back',
    isHSPriority: false,
    path: 'M 245 200 L 245 270 L 205 275 L 205 205 Z',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// ARMS - 12 regions (6 per arm)
// ═══════════════════════════════════════════════════════════════════════════════

export const ARMS_REGIONS: BodyMapRegion[] = [
  // Left arm
  {
    id: 'left-shoulder',
    name: 'Left Shoulder',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 135 115 Q 120 120 118 140 L 140 150 L 155 130 Q 152 118 140 115 Z',
  },
  {
    id: 'left-upper-arm-inner',
    name: 'Left Upper Arm (inner)',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 140 150 L 135 220 L 150 225 L 155 160 Z',
  },
  {
    id: 'left-upper-arm-outer',
    name: 'Left Upper Arm (outer)',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 118 140 L 110 220 L 135 225 L 140 150 Z',
  },
  {
    id: 'left-elbow',
    name: 'Left Elbow',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 110 220 L 105 250 L 148 255 L 150 225 Z',
  },
  {
    id: 'left-forearm',
    name: 'Left Forearm',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 105 250 L 95 340 L 140 345 L 148 255 Z',
  },
  {
    id: 'left-hand',
    name: 'Left Hand',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 95 340 L 85 385 L 145 390 L 140 345 Z',
  },
  // Right arm
  {
    id: 'right-shoulder',
    name: 'Right Shoulder',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 265 115 Q 280 120 282 140 L 260 150 L 245 130 Q 248 118 260 115 Z',
  },
  {
    id: 'right-upper-arm-inner',
    name: 'Right Upper Arm (inner)',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 260 150 L 265 220 L 250 225 L 245 160 Z',
  },
  {
    id: 'right-upper-arm-outer',
    name: 'Right Upper Arm (outer)',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 282 140 L 290 220 L 265 225 L 260 150 Z',
  },
  {
    id: 'right-elbow',
    name: 'Right Elbow',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 290 220 L 295 250 L 252 255 L 250 225 Z',
  },
  {
    id: 'right-forearm',
    name: 'Right Forearm',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 295 250 L 305 340 L 260 345 L 252 255 Z',
  },
  {
    id: 'right-hand',
    name: 'Right Hand',
    view: 'front',
    category: 'arms',
    isHSPriority: false,
    path: 'M 305 340 L 315 385 L 255 390 L 260 345 Z',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// LEGS - 12 regions (6 per leg)
// ═══════════════════════════════════════════════════════════════════════════════

export const LEGS_REGIONS: BodyMapRegion[] = [
  // Left leg
  {
    id: 'left-hip',
    name: 'Left Hip',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 150 310 Q 140 320 140 340 L 165 350 L 175 335 Q 172 320 165 310 Z',
  },
  {
    id: 'left-thigh-front',
    name: 'Left Thigh (front)',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 148 380 L 145 480 L 190 485 L 195 385 Z',
  },
  {
    id: 'left-thigh-back',
    name: 'Left Thigh (back)',
    view: 'back',
    category: 'legs',
    isHSPriority: false,
    path: 'M 155 405 L 150 500 L 195 505 L 200 410 Z',
  },
  {
    id: 'left-knee',
    name: 'Left Knee',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 145 480 L 140 520 L 190 525 L 190 485 Z',
  },
  {
    id: 'left-shin-calf',
    name: 'Left Shin/Calf',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 140 520 L 138 640 L 185 645 L 190 525 Z',
  },
  {
    id: 'left-ankle-foot',
    name: 'Left Ankle/Foot',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 138 640 L 130 695 L 195 700 L 185 645 Z',
  },
  // Right leg
  {
    id: 'right-hip',
    name: 'Right Hip',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 250 310 Q 260 320 260 340 L 235 350 L 225 335 Q 228 320 235 310 Z',
  },
  {
    id: 'right-thigh-front',
    name: 'Right Thigh (front)',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 252 380 L 255 480 L 210 485 L 205 385 Z',
  },
  {
    id: 'right-thigh-back',
    name: 'Right Thigh (back)',
    view: 'back',
    category: 'legs',
    isHSPriority: false,
    path: 'M 245 405 L 250 500 L 205 505 L 200 410 Z',
  },
  {
    id: 'right-knee',
    name: 'Right Knee',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 255 480 L 260 520 L 210 525 L 210 485 Z',
  },
  {
    id: 'right-shin-calf',
    name: 'Right Shin/Calf',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 260 520 L 262 640 L 215 645 L 210 525 Z',
  },
  {
    id: 'right-ankle-foot',
    name: 'Right Ankle/Foot',
    view: 'front',
    category: 'legs',
    isHSPriority: false,
    path: 'M 262 640 L 270 695 L 205 700 L 215 645 Z',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * All standard regions combined
 * Total: 32 regions
 * - Head/Neck: 6
 * - Torso Front: 4
 * - Torso Back: 4
 * - Arms: 12
 * - Legs: 12
 */
export const ALL_STANDARD_REGIONS: BodyMapRegion[] = [
  ...HEAD_NECK_REGIONS,
  ...TORSO_FRONT_REGIONS,
  ...TORSO_BACK_REGIONS,
  ...ARMS_REGIONS,
  ...LEGS_REGIONS,
]

/**
 * Get standard regions for a specific view
 */
export function getStandardRegionsForView(view: 'front' | 'back'): BodyMapRegion[] {
  return ALL_STANDARD_REGIONS.filter(r => r.view === view)
}
