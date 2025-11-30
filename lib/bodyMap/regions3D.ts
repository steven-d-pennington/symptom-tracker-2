/**
 * 3D Body Region Definitions for Three.js Body Map
 * Maps HS-priority regions to 3D coordinates on the model
 */

import * as THREE from 'three'

export interface Region3D {
  id: string
  name: string
  // 3D position on the model (normalized, will be scaled by model size)
  position: THREE.Vector3
  // Approximate radius for highlighting
  radius: number
  // Which side of the body (for rotation targeting)
  side: 'front' | 'back' | 'left' | 'right'
  // HS priority region
  isHSPriority: boolean
  // Color for highlighting
  color: string
}

// HS-priority region colors (colorblind-safe palette)
const HS_COLORS = {
  axillae: '#E69F00',      // Orange
  groin: '#CC79A7',        // Pink
  inframammary: '#56B4E9', // Light blue
  buttocks: '#882255',     // Purple
  waistband: '#009E73',    // Teal
}

/**
 * 3D HS-Priority Regions
 * Positions are in ACTUAL model coordinates for female_base_mesh.glb
 * Model coordinate system:
 *   X-axis: left-right (-0.89 to 0.89)
 *   Y-axis: front-back (-0.19 to 0.18) - positive Y is FRONT
 *   Z-axis: vertical (0 to 2.0) - 0=feet, 2=head
 */
export const HS_REGIONS_3D: Region3D[] = [
  // Axillae (armpits) - where arms meet torso on the sides
  // Position at shoulder level, toward the back where armpit fold is
  {
    id: 'axilla-left',
    name: 'Left Armpit',
    position: new THREE.Vector3(0.15, -0.04, 1.56),  // X=side, Y=toward back, Z=higher up at shoulder
    radius: 0.12,
    side: 'front',
    isHSPriority: true,
    color: HS_COLORS.axillae,
  },
  {
    id: 'axilla-right',
    name: 'Right Armpit',
    position: new THREE.Vector3(-0.15, -0.04, 1.56),
    radius: 0.12,
    side: 'front',
    isHSPriority: true,
    color: HS_COLORS.axillae,
  },

  // Groin/Inguinal - at hip crease level
  {
    id: 'groin-left',
    name: 'Left Groin',
    position: new THREE.Vector3(0.10, 0.08, 0.95),
    radius: 0.10,
    side: 'front',
    isHSPriority: true,
    color: HS_COLORS.groin,
  },
  {
    id: 'groin-right',
    name: 'Right Groin',
    position: new THREE.Vector3(-0.10, 0.08, 0.95),
    radius: 0.10,
    side: 'front',
    isHSPriority: true,
    color: HS_COLORS.groin,
  },
  {
    id: 'inner-thigh-left',
    name: 'Left Inner Thigh',
    position: new THREE.Vector3(0.08, 0.06, 0.78),
    radius: 0.09,
    side: 'front',
    isHSPriority: true,
    color: HS_COLORS.groin,
  },
  {
    id: 'inner-thigh-right',
    name: 'Right Inner Thigh',
    position: new THREE.Vector3(-0.08, 0.06, 0.78),
    radius: 0.09,
    side: 'front',
    isHSPriority: true,
    color: HS_COLORS.groin,
  },

  // Inframammary (under breasts) - at chest level, front-facing
  // Position directly under each breast at the breast crease
  {
    id: 'inframammary-left',
    name: 'Left Inframammary',
    position: new THREE.Vector3(0.08, 0.10, 1.44),  // X=under breast, Y=front surface, Z=breast crease height
    radius: 0.09,
    side: 'front',
    isHSPriority: true,
    color: HS_COLORS.inframammary,
  },
  {
    id: 'inframammary-right',
    name: 'Right Inframammary',
    position: new THREE.Vector3(-0.08, 0.10, 1.44),
    radius: 0.09,
    side: 'front',
    isHSPriority: true,
    color: HS_COLORS.inframammary,
  },

  // Buttocks - at hip level (back side)
  // Negative Y for back surface, need to be further back (-0.12 to -0.15)
  {
    id: 'buttock-left',
    name: 'Left Buttock',
    position: new THREE.Vector3(0.12, -0.14, 0.88),  // negative Y = back surface
    radius: 0.12,
    side: 'back',
    isHSPriority: true,
    color: HS_COLORS.buttocks,
  },
  {
    id: 'buttock-right',
    name: 'Right Buttock',
    position: new THREE.Vector3(-0.12, -0.14, 0.88),
    radius: 0.12,
    side: 'back',
    isHSPriority: true,
    color: HS_COLORS.buttocks,
  },
  {
    id: 'gluteal-fold-left',
    name: 'Left Gluteal Fold',
    position: new THREE.Vector3(0.10, -0.12, 0.76),
    radius: 0.09,
    side: 'back',
    isHSPriority: true,
    color: HS_COLORS.buttocks,
  },
  {
    id: 'gluteal-fold-right',
    name: 'Right Gluteal Fold',
    position: new THREE.Vector3(-0.10, -0.12, 0.76),
    radius: 0.09,
    side: 'back',
    isHSPriority: true,
    color: HS_COLORS.buttocks,
  },

  // Waistband areas - at waist level, wrapping around torso
  {
    id: 'waist-left',
    name: 'Left Waist',
    position: new THREE.Vector3(0.18, 0, 1.12),  // Higher Z, slightly wider radius
    radius: 0.14,
    side: 'left',
    isHSPriority: true,
    color: HS_COLORS.waistband,
  },
  {
    id: 'waist-right',
    name: 'Right Waist',
    position: new THREE.Vector3(-0.18, 0, 1.12),
    radius: 0.14,
    side: 'right',
    isHSPriority: true,
    color: HS_COLORS.waistband,
  },
  {
    id: 'lower-abdomen',
    name: 'Lower Abdomen',
    position: new THREE.Vector3(0, 0.10, 1.12),  // Higher Z to match waist level
    radius: 0.14,
    side: 'front',
    isHSPriority: true,
    color: HS_COLORS.waistband,
  },
  {
    id: 'lower-back',
    name: 'Lower Back',
    position: new THREE.Vector3(0, -0.12, 1.12),  // Higher Z to match waist level
    radius: 0.14,
    side: 'back',
    isHSPriority: true,
    color: HS_COLORS.waistband,
  },
]

/**
 * Get the rotation needed to view a specific region
 */
export function getRotationForRegion(region: Region3D): number {
  switch (region.side) {
    case 'front':
      return 0
    case 'back':
      return Math.PI
    case 'left':
      return Math.PI / 2
    case 'right':
      return -Math.PI / 2
    default:
      return 0
  }
}

/**
 * Get regions visible from a given rotation angle
 */
export function getVisibleRegions(rotation: number): Region3D[] {
  // Normalize rotation to 0-2PI
  const normalizedRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

  // Determine which side is facing camera
  // 0 = front, PI/2 = left, PI = back, 3PI/2 = right
  const tolerance = Math.PI / 3 // 60 degrees

  return HS_REGIONS_3D.filter(region => {
    const targetRotation = getRotationForRegion(region)
    const diff = Math.abs(normalizedRotation - targetRotation)
    return diff < tolerance || diff > (2 * Math.PI - tolerance)
  })
}

/**
 * Find the nearest region to a 3D point
 */
export function findNearestRegion(point: THREE.Vector3, modelHeight: number = 1): Region3D | null {
  // Normalize point to model space (0-1 range for Y)
  const normalizedPoint = new THREE.Vector3(
    point.x / modelHeight,
    point.y / modelHeight,
    point.z / modelHeight
  )

  let nearest: Region3D | null = null
  let minDistance = Infinity

  for (const region of HS_REGIONS_3D) {
    const distance = normalizedPoint.distanceTo(region.position)
    if (distance < minDistance && distance < region.radius * 2) {
      minDistance = distance
      nearest = region
    }
  }

  return nearest
}
