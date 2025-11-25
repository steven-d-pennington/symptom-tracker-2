import { db, FlareEvent } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'
import { getFlareById } from './createFlare'

/**
 * Mark a flare as resolved
 */
export async function resolveFlare(data: {
  flareId: string
  resolutionDate?: number
  resolutionNotes?: string
  photoIds?: string[]
}): Promise<void> {
  const now = getCurrentTimestamp()
  const resolutionDate = data.resolutionDate || now

  // Get existing flare
  const flare = await getFlareById(data.flareId)
  if (!flare) {
    throw new Error('Flare not found')
  }

  if (flare.status === 'resolved') {
    throw new Error('Flare is already resolved')
  }

  // Validate resolution date (must be after start date)
  if (resolutionDate < flare.startDate) {
    throw new Error('Resolution date cannot be before flare start date')
  }

  // Create resolution event
  const event: FlareEvent = {
    guid: generateGUID(),
    flareId: data.flareId,
    eventType: 'resolved',
    timestamp: resolutionDate,
    timezoneOffset: new Date().getTimezoneOffset(),
    resolutionDate: resolutionDate,
    resolutionNotes: data.resolutionNotes,
    createdAt: now,
  }

  // Atomic transaction
  await db.transaction('rw', [db.flares, db.flareEvents], async () => {
    await db.flareEvents.add(event)
    await db.flares.update(flare.id!, {
      status: 'resolved',
      endDate: resolutionDate,
      updatedAt: now,
    })
  })

  console.log('Flare resolved:', data.flareId)
}

/**
 * Calculate days active for a flare
 */
export function calculateDaysActive(startDate: number, endDate?: number): number {
  const end = endDate || Date.now()
  const milliseconds = end - startDate
  return Math.floor(milliseconds / (1000 * 60 * 60 * 24))
}
