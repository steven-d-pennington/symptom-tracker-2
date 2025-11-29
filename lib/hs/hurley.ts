/**
 * Hurley Staging Logic
 *
 * Hurley staging is a static classification system for HS disease severity:
 * - Stage I: Single/multiple abscesses; no sinus tracts or scarring
 * - Stage II: Recurrent abscesses with sinus tract OR scarring; lesions widely separated
 * - Stage III: Diffuse involvement; multiple interconnected sinus tracts and abscesses
 */

import { db } from '@/lib/db'
import { generateGUID, getCurrentTimestamp, formatDateISO } from '@/lib/utils'
import type { RegionHurleyStatus, HurleyStage } from './types'

// ═══════════════════════════════════════════════════════════════════════════════
// HURLEY STAGE DETERMINATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface HurleyAssessment {
  hasSinusTracts: boolean
  lesionsInterconnected: boolean
  hasScarring: boolean
}

/**
 * Determines Hurley stage based on assessment answers
 *
 * Logic:
 * - Stage III: Multiple interconnected sinus tracts
 * - Stage II: Has sinus tracts OR significant scarring (but not interconnected)
 * - Stage I: Just abscesses/nodules, no tracts or scarring
 */
export function determineHurleyStage(assessment: HurleyAssessment): HurleyStage {
  if (assessment.lesionsInterconnected) {
    return 3
  }
  if (assessment.hasSinusTracts || assessment.hasScarring) {
    return 2
  }
  return 1
}

/**
 * Gets a human-readable description for each Hurley stage
 */
export function getHurleyStageDescription(stage: HurleyStage): string {
  switch (stage) {
    case 1:
      return 'Abscess formation (single or multiple) without sinus tracts and scarring'
    case 2:
      return 'Recurrent abscesses with sinus tract formation and scarring; single or few widely separated lesions'
    case 3:
      return 'Diffuse or broad involvement with multiple interconnected sinus tracts and abscesses'
  }
}

/**
 * Gets a short label for each Hurley stage
 */
export function getHurleyStageLabel(stage: HurleyStage): string {
  switch (stage) {
    case 1:
      return 'Stage I - Mild'
    case 2:
      return 'Stage II - Moderate'
    case 3:
      return 'Stage III - Severe'
  }
}

/**
 * Gets color classes for Hurley stage display
 */
export function getHurleSeverityColors(stage: HurleyStage | null): {
  bg: string
  text: string
  border: string
  dot: string
} {
  if (stage === null) {
    return {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-600',
      dot: 'bg-gray-400',
    }
  }

  switch (stage) {
    case 1:
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
        dot: 'bg-green-500',
      }
    case 2:
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
        dot: 'bg-yellow-500',
      }
    case 3:
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700',
        dot: 'bg-red-500',
      }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateHurleyStatusInput {
  regionId: string
  assessment: HurleyAssessment
  notes?: string
}

/**
 * Creates or updates Hurley status for a region
 */
export async function setRegionHurleyStatus(
  input: CreateHurleyStatusInput
): Promise<RegionHurleyStatus> {
  const now = getCurrentTimestamp()
  const today = formatDateISO(new Date())
  const stage = determineHurleyStage(input.assessment)

  // Check if region already has a status
  const existing = await db.regionHurleyStatuses
    .where('regionId')
    .equals(input.regionId)
    .first()

  if (existing) {
    // Update existing record
    const updated: RegionHurleyStatus = {
      ...existing,
      hurleyStage: stage,
      hasScarring: input.assessment.hasScarring,
      hasSinusTracts: input.assessment.hasSinusTracts,
      lesionsInterconnected: input.assessment.lesionsInterconnected,
      lastAssessedDate: today,
      notes: input.notes,
      updatedAt: now,
    }

    await db.regionHurleyStatuses.update(existing.id!, updated)
    return updated
  } else {
    // Create new record
    const status: RegionHurleyStatus = {
      guid: generateGUID(),
      regionId: input.regionId,
      hurleyStage: stage,
      hasScarring: input.assessment.hasScarring,
      hasSinusTracts: input.assessment.hasSinusTracts,
      lesionsInterconnected: input.assessment.lesionsInterconnected,
      lastAssessedDate: today,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    }

    await db.regionHurleyStatuses.add(status)
    return status
  }
}

/**
 * Gets Hurley status for a specific region
 */
export async function getRegionHurleyStatus(
  regionId: string
): Promise<RegionHurleyStatus | undefined> {
  return db.regionHurleyStatuses.where('regionId').equals(regionId).first()
}

/**
 * Gets Hurley status for all regions
 */
export async function getAllRegionHurleyStatuses(): Promise<RegionHurleyStatus[]> {
  return db.regionHurleyStatuses.toArray()
}

/**
 * Gets regions with Hurley stage assigned
 */
export async function getRegionsWithHurleyStage(): Promise<
  Map<string, RegionHurleyStatus>
> {
  const statuses = await getAllRegionHurleyStatuses()
  const map = new Map<string, RegionHurleyStatus>()

  statuses.forEach((status) => {
    if (status.hurleyStage !== null) {
      map.set(status.regionId, status)
    }
  })

  return map
}

/**
 * Clears Hurley status for a region
 */
export async function clearRegionHurleyStatus(regionId: string): Promise<void> {
  const existing = await db.regionHurleyStatuses
    .where('regionId')
    .equals(regionId)
    .first()

  if (existing) {
    await db.regionHurleyStatuses.delete(existing.id!)
  }
}

/**
 * Gets the overall worst Hurley stage across all regions
 */
export async function getWorstHurleyStage(): Promise<HurleyStage | null> {
  const statuses = await getAllRegionHurleyStatuses()

  if (statuses.length === 0) return null

  const stages = statuses
    .map((s) => s.hurleyStage)
    .filter((s): s is HurleyStage => s !== null)

  if (stages.length === 0) return null

  return Math.max(...stages) as HurleyStage
}

/**
 * Counts regions by Hurley stage
 */
export async function countRegionsByHurleyStage(): Promise<{
  stage1: number
  stage2: number
  stage3: number
  unassessed: number
}> {
  const statuses = await getAllRegionHurleyStatuses()

  return {
    stage1: statuses.filter((s) => s.hurleyStage === 1).length,
    stage2: statuses.filter((s) => s.hurleyStage === 2).length,
    stage3: statuses.filter((s) => s.hurleyStage === 3).length,
    unassessed: statuses.filter((s) => s.hurleyStage === null).length,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EDUCATIONAL CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface HurleyStageInfo {
  stage: HurleyStage
  name: string
  shortDescription: string
  fullDescription: string
  criteria: string[]
  typicalFeatures: string[]
  treatmentConsiderations: string[]
}

export const HURLEY_STAGE_INFO: Record<HurleyStage, HurleyStageInfo> = {
  1: {
    stage: 1,
    name: 'Hurley Stage I',
    shortDescription: 'Mild - Abscess formation only',
    fullDescription:
      'Single or multiple abscesses without sinus tracts (tunnels) and scarring. This is the earliest stage of HS.',
    criteria: [
      'Single or multiple abscesses',
      'No sinus tracts (tunnels under the skin)',
      'No significant scarring',
      'Lesions are isolated',
    ],
    typicalFeatures: [
      'Painful bumps that come and go',
      'May look like large pimples or boils',
      'Can occur in one or multiple areas',
      'Often mistaken for other skin conditions',
    ],
    treatmentConsiderations: [
      'Topical treatments may be effective',
      'Oral antibiotics for acute flares',
      'Lifestyle modifications (weight, smoking)',
      'Good response to early intervention',
    ],
  },
  2: {
    stage: 2,
    name: 'Hurley Stage II',
    shortDescription: 'Moderate - Recurring with tracts/scarring',
    fullDescription:
      'Recurrent abscesses with sinus tract formation and scarring. Single or few widely separated lesions.',
    criteria: [
      'Recurrent abscesses',
      'Sinus tracts (tunnels) may be present',
      'Visible scarring in affected areas',
      'Lesions widely separated (not interconnected)',
    ],
    typicalFeatures: [
      'Tunnels under the skin that drain',
      'Scarring between flares',
      'More frequent recurrences',
      'May have chronic drainage',
    ],
    treatmentConsiderations: [
      'Often requires systemic medications',
      'Biologics may be considered',
      'Surgical options for specific lesions',
      'Regular dermatology follow-up important',
    ],
  },
  3: {
    stage: 3,
    name: 'Hurley Stage III',
    shortDescription: 'Severe - Diffuse with interconnected tracts',
    fullDescription:
      'Diffuse or broad involvement with multiple interconnected sinus tracts and abscesses across an entire area.',
    criteria: [
      'Diffuse involvement of area',
      'Multiple interconnected sinus tracts',
      'Widespread abscesses',
      'Extensive scarring',
    ],
    typicalFeatures: [
      'Large areas affected',
      'Complex tunnel networks',
      'Chronic drainage and pain',
      'Significant impact on quality of life',
    ],
    treatmentConsiderations: [
      'Usually requires aggressive treatment',
      'Biologic therapy often needed',
      'Surgical excision may be necessary',
      'Multidisciplinary care recommended',
    ],
  },
}
