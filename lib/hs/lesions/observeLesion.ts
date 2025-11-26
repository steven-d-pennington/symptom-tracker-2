/**
 * Add daily observations to an existing lesion
 */

import { db } from '@/lib/db'
import { generateGUID, getCurrentTimestamp, formatDateISO } from '@/lib/utils'
import type {
  LesionObservation,
  LesionSize,
  LesionSymptoms,
  DrainageAssessment,
  PainCharacterization,
  LesionStatus,
} from '../types'

export interface ObserveLesionInput {
  lesionId: string
  entryId: string
  date?: string // Defaults to today

  size: LesionSize
  symptoms: LesionSymptoms
  drainage: DrainageAssessment
  painType?: PainCharacterization
  notes?: string
  photoIds?: string[]

  // Optional status change
  statusChange?: {
    newStatus: LesionStatus
    note?: string
  }
}

/**
 * Creates a new observation for an existing lesion
 * Optionally updates the lesion status if statusChange is provided
 */
export async function observeLesion(
  input: ObserveLesionInput
): Promise<LesionObservation> {
  const now = getCurrentTimestamp()
  const today = formatDateISO(new Date())
  const date = input.date || today

  // Verify lesion exists
  const lesion = await db.hsLesions
    .where('guid')
    .equals(input.lesionId)
    .first()

  if (!lesion) {
    throw new Error(`Lesion not found: ${input.lesionId}`)
  }

  const observation: LesionObservation = {
    guid: generateGUID(),
    lesionId: input.lesionId,
    entryId: input.entryId,
    date,
    size: input.size,
    symptoms: input.symptoms,
    drainage: input.drainage,
    painType: input.painType,
    notes: input.notes,
    photoIds: input.photoIds,
    statusChange: input.statusChange,
    createdAt: now,
  }

  // Atomic transaction if status is being changed
  if (input.statusChange) {
    await db.transaction('rw', [db.hsLesions, db.lesionObservations], async () => {
      // Update lesion status
      await db.hsLesions.where('guid').equals(input.lesionId).modify({
        status: input.statusChange!.newStatus,
        updatedAt: now,
        // Set healed date if marking as healed/scarred
        ...((['healed', 'scarred'] as LesionStatus[]).includes(input.statusChange!.newStatus)
          ? { healedDate: date }
          : {}),
      })

      // Add observation
      await db.lesionObservations.add(observation)
    })
  } else {
    await db.lesionObservations.add(observation)
  }

  return observation
}

/**
 * Gets all observations for a lesion
 */
export async function getObservationsForLesion(
  lesionId: string
): Promise<LesionObservation[]> {
  return db.lesionObservations
    .where('lesionId')
    .equals(lesionId)
    .sortBy('date')
}

/**
 * Gets the most recent observation for a lesion
 */
export async function getLatestObservation(
  lesionId: string
): Promise<LesionObservation | undefined> {
  const observations = await getObservationsForLesion(lesionId)
  return observations[observations.length - 1]
}

/**
 * Gets observations for a specific date
 */
export async function getObservationsForDate(
  date: string
): Promise<LesionObservation[]> {
  return db.lesionObservations.where('date').equals(date).toArray()
}

/**
 * Gets observations for a specific daily entry
 */
export async function getObservationsForEntry(
  entryId: string
): Promise<LesionObservation[]> {
  return db.lesionObservations.where('entryId').equals(entryId).toArray()
}

/**
 * Checks if a lesion has been observed today
 */
export async function hasObservationToday(lesionId: string): Promise<boolean> {
  const today = formatDateISO(new Date())
  const observations = await db.lesionObservations
    .where(['lesionId', 'date'])
    .equals([lesionId, today])
    .toArray()

  return observations.length > 0
}

/**
 * Gets pain trend over observations
 */
export async function getPainTrend(
  lesionId: string
): Promise<{ date: string; pain: number }[]> {
  const observations = await getObservationsForLesion(lesionId)

  return observations.map((obs) => ({
    date: obs.date,
    pain: obs.symptoms.pain,
  }))
}

/**
 * Gets size progression over observations
 */
export async function getSizeProgression(
  lesionId: string
): Promise<{ date: string; size: LesionSize }[]> {
  const observations = await getObservationsForLesion(lesionId)

  return observations.map((obs) => ({
    date: obs.date,
    size: obs.size,
  }))
}

/**
 * Calculates average pain for a lesion
 */
export async function getAveragePain(lesionId: string): Promise<number | null> {
  const observations = await getObservationsForLesion(lesionId)

  if (observations.length === 0) return null

  const totalPain = observations.reduce((sum, obs) => sum + obs.symptoms.pain, 0)
  return totalPain / observations.length
}

/**
 * Gets the worst symptoms recorded for a lesion
 */
export async function getWorstSymptoms(
  lesionId: string
): Promise<LesionSymptoms | null> {
  const observations = await getObservationsForLesion(lesionId)

  if (observations.length === 0) return null

  // Find worst values for each symptom
  return {
    pain: Math.max(...observations.map((o) => o.symptoms.pain)),
    tenderness: Math.max(...observations.map((o) => o.symptoms.tenderness)),
    swelling: Math.max(...observations.map((o) => o.symptoms.swelling)),
    heat: Math.max(...observations.map((o) => o.symptoms.heat)),
    itch: Math.max(...observations.map((o) => o.symptoms.itch)),
    pressure: Math.max(...observations.map((o) => o.symptoms.pressure)),
  }
}

/**
 * Deletes an observation
 */
export async function deleteObservation(guid: string): Promise<void> {
  await db.lesionObservations.where('guid').equals(guid).delete()
}
