/**
 * Update an existing HS lesion
 */

import { db } from '@/lib/db'
import { getCurrentTimestamp } from '@/lib/utils'
import type {
  HSLesion,
  LesionType,
  LesionStatus,
  LesionTypeChange,
} from '../types'

export interface UpdateLesionInput {
  guid: string
  lesionType?: LesionType
  status?: LesionStatus
}

/**
 * Updates a lesion's properties
 * Tracks type changes in history if lesion type is changed
 */
export async function updateLesion(input: UpdateLesionInput): Promise<HSLesion> {
  const now = getCurrentTimestamp()

  const existingLesion = await db.hsLesions
    .where('guid')
    .equals(input.guid)
    .first()

  if (!existingLesion) {
    throw new Error(`Lesion not found: ${input.guid}`)
  }

  const updates: Partial<HSLesion> = {
    updatedAt: now,
  }

  // Track type change in history if changing lesion type
  if (input.lesionType && input.lesionType !== existingLesion.lesionType) {
    const typeChange: LesionTypeChange = {
      date: new Date().toISOString().split('T')[0],
      fromType: existingLesion.lesionType,
      toType: input.lesionType,
    }

    updates.lesionType = input.lesionType
    updates.typeHistory = [...(existingLesion.typeHistory || []), typeChange]
  }

  // Update status if provided
  if (input.status) {
    updates.status = input.status
  }

  await db.hsLesions.where('guid').equals(input.guid).modify(updates)

  // Return the updated lesion
  const updatedLesion = await db.hsLesions
    .where('guid')
    .equals(input.guid)
    .first()

  if (!updatedLesion) {
    throw new Error(`Failed to retrieve updated lesion: ${input.guid}`)
  }

  return updatedLesion
}

/**
 * Changes a lesion's type (e.g., nodule → abscess)
 * This is a common progression in HS
 */
export async function changeLesionType(
  guid: string,
  newType: LesionType
): Promise<HSLesion> {
  return updateLesion({ guid, lesionType: newType })
}

/**
 * Updates a lesion's status
 */
export async function updateLesionStatus(
  guid: string,
  status: LesionStatus
): Promise<HSLesion> {
  return updateLesion({ guid, status })
}

/**
 * Marks a lesion as healing (intermediate state)
 */
export async function markLesionHealing(guid: string): Promise<HSLesion> {
  return updateLesionStatus(guid, 'healing')
}

/**
 * Marks a lesion as worsening (back to active from healing)
 */
export async function markLesionWorsening(guid: string): Promise<HSLesion> {
  return updateLesionStatus(guid, 'active')
}
