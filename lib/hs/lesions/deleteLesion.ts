/**
 * Delete a lesion and its observations
 */

import { db } from '@/lib/db'
import type { HSLesion, LesionObservation } from '../types'

/**
 * Deletes a lesion (soft delete - keeps observations for history)
 * For full deletion, use deleteLesionWithObservations
 */
export async function deleteLesion(guid: string): Promise<void> {
  await db.hsLesions.where('guid').equals(guid).delete()
}

/**
 * Deletes a lesion and all its associated observations
 * Use with caution - this permanently removes all data
 */
export async function deleteLesionWithObservations(guid: string): Promise<{
  lesion: HSLesion | undefined
  observationsDeleted: number
}> {
  // Get the lesion first for return value
  const lesion = await db.hsLesions.where('guid').equals(guid).first()

  // Count observations to be deleted
  const observations = await db.lesionObservations
    .where('lesionId')
    .equals(guid)
    .toArray()

  // Atomic deletion
  await db.transaction('rw', [db.hsLesions, db.lesionObservations], async () => {
    // Delete all observations for this lesion
    await db.lesionObservations.where('lesionId').equals(guid).delete()

    // Delete the lesion
    await db.hsLesions.where('guid').equals(guid).delete()
  })

  return {
    lesion,
    observationsDeleted: observations.length,
  }
}

/**
 * Deletes all lesions for a region (use with extreme caution)
 */
export async function deleteAllLesionsInRegion(regionId: string): Promise<number> {
  const lesions = await db.hsLesions.where('regionId').equals(regionId).toArray()
  const guids = lesions.map((l) => l.guid)

  await db.transaction('rw', [db.hsLesions, db.lesionObservations], async () => {
    // Delete all observations for these lesions
    for (const guid of guids) {
      await db.lesionObservations.where('lesionId').equals(guid).delete()
    }

    // Delete all lesions in the region
    await db.hsLesions.where('regionId').equals(regionId).delete()
  })

  return lesions.length
}

/**
 * Deletes all healed lesions older than a certain number of days
 * Useful for data cleanup
 */
export async function deleteOldHealedLesions(daysOld: number): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

  const oldHealedLesions = await db.hsLesions
    .where('status')
    .anyOf(['healed', 'scarred'])
    .filter((lesion) => Boolean(lesion.healedDate && lesion.healedDate < cutoffDateStr))
    .toArray()

  const guids = oldHealedLesions.map((l) => l.guid)

  await db.transaction('rw', [db.hsLesions, db.lesionObservations], async () => {
    for (const guid of guids) {
      await db.lesionObservations.where('lesionId').equals(guid).delete()
      await db.hsLesions.where('guid').equals(guid).delete()
    }
  })

  return oldHealedLesions.length
}
