/**
 * Mark a lesion as healed
 */

import { db } from '@/lib/db'
import { generateGUID, getCurrentTimestamp, formatDateISO } from '@/lib/utils'
import type {
  HSLesion,
  LesionObservation,
  LesionStatus,
} from '../types'
import { createDefaultSymptoms, createDefaultDrainage } from './createLesion'

export interface HealLesionInput {
  guid: string
  healedDate?: string // Defaults to today
  finalStatus?: 'healed' | 'scarred' // Defaults to 'healed'
  notes?: string
}

/**
 * Marks a lesion as healed and creates a final observation
 */
export async function healLesion(
  input: HealLesionInput,
  entryId: string
): Promise<{ lesion: HSLesion; observation: LesionObservation }> {
  const now = getCurrentTimestamp()
  const today = formatDateISO(new Date())
  const healedDate = input.healedDate || today
  const finalStatus: LesionStatus = input.finalStatus || 'healed'

  const existingLesion = await db.hsLesions
    .where('guid')
    .equals(input.guid)
    .first()

  if (!existingLesion) {
    throw new Error(`Lesion not found: ${input.guid}`)
  }

  if (existingLesion.status === 'healed' || existingLesion.status === 'scarred') {
    throw new Error(`Lesion is already healed: ${input.guid}`)
  }

  // Create final observation with status change
  const observation: LesionObservation = {
    guid: generateGUID(),
    lesionId: input.guid,
    entryId,
    date: today,
    size: 'small', // Healed lesions are typically small or resolved
    symptoms: createDefaultSymptoms(), // No symptoms when healed
    drainage: createDefaultDrainage(), // No drainage when healed
    notes: input.notes,
    statusChange: {
      newStatus: finalStatus,
      note: input.notes,
    },
    createdAt: now,
  }

  // Atomic transaction
  await db.transaction('rw', [db.hsLesions, db.lesionObservations], async () => {
    // Update lesion
    await db.hsLesions.where('guid').equals(input.guid).modify({
      status: finalStatus,
      healedDate,
      updatedAt: now,
    })

    // Add final observation
    await db.lesionObservations.add(observation)
  })

  // Return updated lesion
  const updatedLesion = await db.hsLesions
    .where('guid')
    .equals(input.guid)
    .first()

  if (!updatedLesion) {
    throw new Error(`Failed to retrieve healed lesion: ${input.guid}`)
  }

  return { lesion: updatedLesion, observation }
}

/**
 * Gets all healed lesions
 */
export async function getHealedLesions(): Promise<HSLesion[]> {
  return db.hsLesions
    .where('status')
    .anyOf(['healed', 'scarred'])
    .toArray()
}

/**
 * Gets healed lesions for a specific region (useful for recurrence tracking)
 */
export async function getHealedLesionsByRegion(regionId: string): Promise<HSLesion[]> {
  const lesions = await db.hsLesions.where('regionId').equals(regionId).toArray()
  return lesions.filter((l) => ['healed', 'scarred'].includes(l.status))
}

/**
 * Calculates healing duration in days
 */
export function calculateHealingDuration(lesion: HSLesion): number | null {
  if (!lesion.healedDate) return null

  const onset = new Date(lesion.onsetDate)
  const healed = new Date(lesion.healedDate)

  const diffTime = Math.abs(healed.getTime() - onset.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Gets average healing time for lesions of a specific type
 */
export async function getAverageHealingTime(
  lesionType?: string
): Promise<number | null> {
  const healedLesions = await getHealedLesions()

  let filteredLesions = healedLesions
  if (lesionType) {
    filteredLesions = healedLesions.filter((l) => l.lesionType === lesionType)
  }

  if (filteredLesions.length === 0) return null

  const durations = filteredLesions
    .map(calculateHealingDuration)
    .filter((d): d is number => d !== null)

  if (durations.length === 0) return null

  return durations.reduce((sum, d) => sum + d, 0) / durations.length
}

/**
 * Reopens a healed lesion (marks as recurrence)
 * This creates a new lesion linked to the old one
 */
export async function reopenLesionAsRecurrence(
  originalGuid: string,
  entryId: string
): Promise<HSLesion> {
  const originalLesion = await db.hsLesions
    .where('guid')
    .equals(originalGuid)
    .first()

  if (!originalLesion) {
    throw new Error(`Original lesion not found: ${originalGuid}`)
  }

  const now = getCurrentTimestamp()
  const today = formatDateISO(new Date())

  const newLesion: HSLesion = {
    guid: generateGUID(),
    regionId: originalLesion.regionId,
    coordinates: originalLesion.coordinates,
    lesionType: 'nodule', // Recurrences typically start as nodules
    status: 'active',
    onsetDate: today,
    recurrenceOf: originalGuid,
    createdAt: now,
    updatedAt: now,
  }

  await db.hsLesions.add(newLesion)

  return newLesion
}
