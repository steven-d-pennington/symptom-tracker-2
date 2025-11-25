export interface BodyRegion {
  id: string
  name: string
  view: 'front' | 'back' | 'side'
  category: 'head' | 'torso' | 'upper-limb' | 'lower-limb' | 'specialized'
}

export const BODY_REGIONS: BodyRegion[] = [
  // Front View - Head & Neck
  { id: 'head', name: 'Head', view: 'front', category: 'head' },
  { id: 'neck-front', name: 'Neck (front)', view: 'front', category: 'head' },
  { id: 'forehead', name: 'Forehead', view: 'front', category: 'head' },
  { id: 'left-temple', name: 'Left Temple', view: 'front', category: 'head' },
  { id: 'right-temple', name: 'Right Temple', view: 'front', category: 'head' },
  { id: 'left-eye', name: 'Left Eye', view: 'front', category: 'head' },
  { id: 'right-eye', name: 'Right Eye', view: 'front', category: 'head' },
  { id: 'nose', name: 'Nose', view: 'front', category: 'head' },
  { id: 'left-cheek', name: 'Left Cheek', view: 'front', category: 'head' },
  { id: 'right-cheek', name: 'Right Cheek', view: 'front', category: 'head' },
  { id: 'mouth', name: 'Mouth', view: 'front', category: 'head' },
  { id: 'chin', name: 'Chin', view: 'front', category: 'head' },
  { id: 'left-ear', name: 'Left Ear', view: 'front', category: 'head' },
  { id: 'right-ear', name: 'Right Ear', view: 'front', category: 'head' },

  // Front View - Upper Limbs
  { id: 'left-shoulder', name: 'Left Shoulder', view: 'front', category: 'upper-limb' },
  { id: 'right-shoulder', name: 'Right Shoulder', view: 'front', category: 'upper-limb' },
  { id: 'left-upper-arm', name: 'Left Upper Arm', view: 'front', category: 'upper-limb' },
  { id: 'right-upper-arm', name: 'Right Upper Arm', view: 'front', category: 'upper-limb' },
  { id: 'left-elbow', name: 'Left Elbow', view: 'front', category: 'upper-limb' },
  { id: 'right-elbow', name: 'Right Elbow', view: 'front', category: 'upper-limb' },
  { id: 'left-forearm', name: 'Left Forearm', view: 'front', category: 'upper-limb' },
  { id: 'right-forearm', name: 'Right Forearm', view: 'front', category: 'upper-limb' },
  { id: 'left-wrist', name: 'Left Wrist', view: 'front', category: 'upper-limb' },
  { id: 'right-wrist', name: 'Right Wrist', view: 'front', category: 'upper-limb' },
  { id: 'left-hand', name: 'Left Hand', view: 'front', category: 'upper-limb' },
  { id: 'right-hand', name: 'Right Hand', view: 'front', category: 'upper-limb' },

  // Front View - Torso
  { id: 'chest-upper', name: 'Chest (upper)', view: 'front', category: 'torso' },
  { id: 'chest-lower', name: 'Chest (lower)', view: 'front', category: 'torso' },
  { id: 'abdomen-upper', name: 'Abdomen (upper)', view: 'front', category: 'torso' },
  { id: 'abdomen-lower', name: 'Abdomen (lower)', view: 'front', category: 'torso' },

  // Front View - Groin (HS-specific)
  { id: 'groin-left', name: 'Groin (left)', view: 'front', category: 'specialized' },
  { id: 'groin-right', name: 'Groin (right)', view: 'front', category: 'specialized' },
  { id: 'groin-center', name: 'Groin (center)', view: 'front', category: 'specialized' },

  // Front View - Lower Limbs
  { id: 'left-hip', name: 'Left Hip', view: 'front', category: 'lower-limb' },
  { id: 'right-hip', name: 'Right Hip', view: 'front', category: 'lower-limb' },
  { id: 'left-thigh-upper', name: 'Left Thigh (upper)', view: 'front', category: 'lower-limb' },
  { id: 'right-thigh-upper', name: 'Right Thigh (upper)', view: 'front', category: 'lower-limb' },
  { id: 'left-thigh-lower', name: 'Left Thigh (lower)', view: 'front', category: 'lower-limb' },
  { id: 'right-thigh-lower', name: 'Right Thigh (lower)', view: 'front', category: 'lower-limb' },
  { id: 'left-knee', name: 'Left Knee', view: 'front', category: 'lower-limb' },
  { id: 'right-knee', name: 'Right Knee', view: 'front', category: 'lower-limb' },
  { id: 'left-shin', name: 'Left Shin', view: 'front', category: 'lower-limb' },
  { id: 'right-shin', name: 'Right Shin', view: 'front', category: 'lower-limb' },
  { id: 'left-calf', name: 'Left Calf', view: 'front', category: 'lower-limb' },
  { id: 'right-calf', name: 'Right Calf', view: 'front', category: 'lower-limb' },
  { id: 'left-ankle', name: 'Left Ankle', view: 'front', category: 'lower-limb' },
  { id: 'right-ankle', name: 'Right Ankle', view: 'front', category: 'lower-limb' },
  { id: 'left-foot-top', name: 'Left Foot (top)', view: 'front', category: 'lower-limb' },
  { id: 'right-foot-top', name: 'Right Foot (top)', view: 'front', category: 'lower-limb' },

  // Back View
  { id: 'head-back', name: 'Head (back)', view: 'back', category: 'head' },
  { id: 'neck-back', name: 'Neck (back)', view: 'back', category: 'head' },
  { id: 'scalp-back', name: 'Scalp (back)', view: 'back', category: 'head' },
  { id: 'left-shoulder-back', name: 'Left Shoulder (back)', view: 'back', category: 'upper-limb' },
  { id: 'right-shoulder-back', name: 'Right Shoulder (back)', view: 'back', category: 'upper-limb' },
  { id: 'upper-back', name: 'Upper Back', view: 'back', category: 'torso' },
  { id: 'mid-back', name: 'Mid Back', view: 'back', category: 'torso' },
  { id: 'lower-back', name: 'Lower Back', view: 'back', category: 'torso' },
  { id: 'left-upper-arm-back', name: 'Left Upper Arm (back)', view: 'back', category: 'upper-limb' },
  { id: 'right-upper-arm-back', name: 'Right Upper Arm (back)', view: 'back', category: 'upper-limb' },
  { id: 'left-elbow-back', name: 'Left Elbow (back)', view: 'back', category: 'upper-limb' },
  { id: 'right-elbow-back', name: 'Right Elbow (back)', view: 'back', category: 'upper-limb' },
  { id: 'left-forearm-back', name: 'Left Forearm (back)', view: 'back', category: 'upper-limb' },
  { id: 'right-forearm-back', name: 'Right Forearm (back)', view: 'back', category: 'upper-limb' },
  { id: 'left-hand-back', name: 'Left Hand (back)', view: 'back', category: 'upper-limb' },
  { id: 'right-hand-back', name: 'Right Hand (back)', view: 'back', category: 'upper-limb' },
  { id: 'left-buttock', name: 'Left Buttock', view: 'back', category: 'lower-limb' },
  { id: 'right-buttock', name: 'Right Buttock', view: 'back', category: 'lower-limb' },
  { id: 'left-thigh-back-upper', name: 'Left Thigh (back upper)', view: 'back', category: 'lower-limb' },
  { id: 'right-thigh-back-upper', name: 'Right Thigh (back upper)', view: 'back', category: 'lower-limb' },
  { id: 'left-thigh-back-lower', name: 'Left Thigh (back lower)', view: 'back', category: 'lower-limb' },
  { id: 'right-thigh-back-lower', name: 'Right Thigh (back lower)', view: 'back', category: 'lower-limb' },
  { id: 'left-knee-back', name: 'Left Knee (back)', view: 'back', category: 'lower-limb' },
  { id: 'right-knee-back', name: 'Right Knee (back)', view: 'back', category: 'lower-limb' },
  { id: 'left-calf-back', name: 'Left Calf (back)', view: 'back', category: 'lower-limb' },
  { id: 'right-calf-back', name: 'Right Calf (back)', view: 'back', category: 'lower-limb' },
  { id: 'left-ankle-back', name: 'Left Ankle (back)', view: 'back', category: 'lower-limb' },
  { id: 'right-ankle-back', name: 'Right Ankle (back)', view: 'back', category: 'lower-limb' },
  { id: 'left-foot-bottom', name: 'Left Foot (bottom)', view: 'back', category: 'lower-limb' },
  { id: 'right-foot-bottom', name: 'Right Foot (bottom)', view: 'back', category: 'lower-limb' },

  // Specialized Regions
  { id: 'armpit-left', name: 'Armpit (left)', view: 'front', category: 'specialized' },
  { id: 'armpit-right', name: 'Armpit (right)', view: 'front', category: 'specialized' },
  { id: 'under-breast-left', name: 'Under Breast (left)', view: 'front', category: 'specialized' },
  { id: 'under-breast-right', name: 'Under Breast (right)', view: 'front', category: 'specialized' },
  { id: 'between-breasts', name: 'Between Breasts', view: 'front', category: 'specialized' },
  { id: 'navel-region', name: 'Navel Region', view: 'front', category: 'specialized' },
  { id: 'waistline-left', name: 'Waistline (left)', view: 'front', category: 'specialized' },
  { id: 'waistline-right', name: 'Waistline (right)', view: 'front', category: 'specialized' },
  { id: 'inner-thigh-left-upper', name: 'Inner Thigh (left upper)', view: 'front', category: 'specialized' },
  { id: 'inner-thigh-right-upper', name: 'Inner Thigh (right upper)', view: 'front', category: 'specialized' },
  { id: 'inner-thigh-left-lower', name: 'Inner Thigh (left lower)', view: 'front', category: 'specialized' },
  { id: 'inner-thigh-right-lower', name: 'Inner Thigh (right lower)', view: 'front', category: 'specialized' },
]
