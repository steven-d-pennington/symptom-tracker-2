/**
 * Create a new HS lesion with initial observation
 */

import { db } from '@/lib/db'
import { generateGUID, getCurrentTimestamp, formatDateISO } from '@/lib/utils'
import type {
  HSLesion,
  LesionObservation,
  LesionType,
  LesionSize,
  LesionSymptoms,
  DrainageAssessment,
  PainCharacterization,
} from '../types'

export interface CreateLesionInput {
  regionId: string
  coordinates: { x: number; y: number }
  lesionType: LesionType
  onsetDate?: string // Defaults to today

  // Initial observation data
  size: LesionSize
  symptoms: LesionSymptoms
  drainage: DrainageAssessment
  painType?: PainCharacterization
  notes?: string
  photoIds?: string[]
}

export interface CreateLesionResult {
  lesion: HSLesion
  observation: LesionObservation
}

/**
 * Creates a new lesion and its initial observation in a single atomic transaction
 */
export async function createLesion(
  input: CreateLesionInput,
  entryId: string
): Promise<CreateLesionResult> {
  const now = getCurrentTimestamp()
  const today = formatDateISO(new Date())
  const onsetDate = input.onsetDate || today

  const lesionGuid = generateGUID()
  const observationGuid = generateGUID()

  const lesion: HSLesion = {
    guid: lesionGuid,
    regionId: input.regionId,
    coordinates: {
      x: input.coordinates.x,
      y: input.coordinates.y,
    },
    lesionType: input.lesionType,
    status: 'active',
    onsetDate,
    createdAt: now,
    updatedAt: now,
  }

  const observation: LesionObservation = {
    guid: observationGuid,
    lesionId: lesionGuid,
    entryId,
    date: today,
    size: input.size,
    symptoms: input.symptoms,
    drainage: input.drainage,
    painType: input.painType,
    notes: input.notes,
    photoIds: input.photoIds,
    createdAt: now,
  }

  // Atomic transaction: both or neither
  await db.transaction('rw', [db.hsLesions, db.lesionObservations], async () => {
    await db.hsLesions.add(lesion)
    await db.lesionObservations.add(observation)
  })

  return { lesion, observation }
}

/**
 * Creates default symptom values (all zeros)
 */
export function createDefaultSymptoms(): LesionSymptoms {
  return {
    pain: 0,
    tenderness: 0,
    swelling: 0,
    heat: 0,
    itch: 0,
    pressure: 0,
  }
}

/**
 * Creates default drainage assessment (none)
 */
export function createDefaultDrainage(): DrainageAssessment {
  return {
    amount: 'none',
    odor: 'none',
  }
}

/**
 * Gets all active lesions
 */
export async function getActiveLesions(): Promise<HSLesion[]> {
  return db.hsLesions
    .where('status')
    .anyOf(['active', 'healing'])
    .toArray()
}

/**
 * Gets all lesions (including healed)
 */
export async function getAllLesions(): Promise<HSLesion[]> {
  return db.hsLesions.toArray()
}

/**
 * Gets lesions for a specific region
 */
export async function getLesionsByRegion(regionId: string): Promise<HSLesion[]> {
  return db.hsLesions.where('regionId').equals(regionId).toArray()
}

/**
 * Gets active lesions for a specific region
 */
export async function getActiveLesionsByRegion(regionId: string): Promise<HSLesion[]> {
  const lesions = await getLesionsByRegion(regionId)
  return lesions.filter((l) => ['active', 'healing'].includes(l.status))
}

/**
 * Gets a lesion by GUID
 */
export async function getLesionByGuid(guid: string): Promise<HSLesion | undefined> {
  return db.hsLesions.where('guid').equals(guid).first()
}

/**
 * Counts active lesions by type
 */
export async function countActiveLesionsByType(): Promise<{
  nodules: number
  abscesses: number
  drainingTunnels: number
}> {
  const activeLesions = await getActiveLesions()

  return {
    nodules: activeLesions.filter((l) => l.lesionType === 'nodule').length,
    abscesses: activeLesions.filter((l) => l.lesionType === 'abscess').length,
    drainingTunnels: activeLesions.filter((l) => l.lesionType === 'draining_tunnel').length,
  }
}
