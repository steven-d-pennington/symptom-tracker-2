/**
 * Inframammary / Chest regions - 6 regions
 * High granularity for HS-prone areas
 */

import type { BodyMapRegion } from '../types'

export const INFRAMAMMARY_REGIONS: BodyMapRegion[] = [
  // Inframammary folds (under breast/chest)
  {
    id: 'left-inframammary-fold',
    name: 'Left Inframammary Fold',
    view: 'front',
    category: 'inframammary',
    isHSPriority: true,
    parentRegion: 'left-chest',
    // Crease under left breast/pectoral
    path: 'M 155 175 Q 150 185 155 195 L 185 200 Q 190 190 185 180 L 170 175 Z',
  },
  {
    id: 'right-inframammary-fold',
    name: 'Right Inframammary Fold',
    view: 'front',
    category: 'inframammary',
    isHSPriority: true,
    parentRegion: 'right-chest',
    // Crease under right breast/pectoral (mirrored)
    path: 'M 245 175 Q 250 185 245 195 L 215 200 Q 210 190 215 180 L 230 175 Z',
  },
  // Breast/Chest areas
  {
    id: 'left-breast-chest',
    name: 'Left Breast/Chest',
    view: 'front',
    category: 'inframammary',
    isHSPriority: true,
    parentRegion: 'left-chest',
    // Left pectoral/breast area
    path: 'M 155 130 Q 145 145 150 165 L 155 175 L 185 180 Q 195 160 190 140 L 175 125 Z',
  },
  {
    id: 'right-breast-chest',
    name: 'Right Breast/Chest',
    view: 'front',
    category: 'inframammary',
    isHSPriority: true,
    parentRegion: 'right-chest',
    // Right pectoral/breast area (mirrored)
    path: 'M 245 130 Q 255 145 250 165 L 245 175 L 215 180 Q 205 160 210 140 L 225 125 Z',
  },
  // Central areas
  {
    id: 'intermammary',
    name: 'Intermammary (between breasts/chest)',
    view: 'front',
    category: 'inframammary',
    isHSPriority: true,
    // Sternum area between breasts
    path: 'M 190 130 L 185 165 L 190 180 L 210 180 L 215 165 L 210 130 Z',
  },
  {
    id: 'submammary',
    name: 'Submammary (below breast tissue)',
    view: 'front',
    category: 'inframammary',
    isHSPriority: true,
    // Area below the inframammary folds
    path: 'M 155 195 Q 160 210 175 215 L 200 218 L 225 215 Q 240 210 245 195 L 215 200 L 200 205 L 185 200 Z',
  },
]

export const INFRAMAMMARY_GROUPS = [
  {
    id: 'left-chest',
    name: 'Left Chest/Inframammary',
    regionIds: ['left-inframammary-fold', 'left-breast-chest'],
  },
  {
    id: 'right-chest',
    name: 'Right Chest/Inframammary',
    regionIds: ['right-inframammary-fold', 'right-breast-chest'],
  },
  {
    id: 'central-chest',
    name: 'Central Chest',
    regionIds: ['intermammary', 'submammary'],
  },
]
