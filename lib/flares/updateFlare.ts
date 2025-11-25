import { db, Flare, FlareEvent } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'
import { getFlareById } from './createFlare'

/**
 * Update flare severity and/or trend
 */
export async function updateFlareSeverity(data: {
  flareId: string
  newSeverity: number
  trend?: 'improving' | 'stable' | 'worsening'
  notes?: string
  timestamp?: number
}): Promise<void> {
  const now = getCurrentTimestamp()
  const timestamp = data.timestamp || now

  // Validate severity
  if (data.newSeverity < 1 || data.newSeverity > 10) {
    throw new Error('Severity must be between 1 and 10')
  }

  // Get existing flare
  const flare = await getFlareById(data.flareId)
  if (!flare) {
    throw new Error('Flare not found')
  }

  if (flare.status === 'resolved') {
    throw new Error('Cannot update resolved flare')
  }

  // Create severity update event
  const event: FlareEvent = {
    guid: generateGUID(),
    flareId: data.flareId,
    eventType: 'severity_update',
    timestamp: timestamp,
    timezoneOffset: new Date().getTimezoneOffset(),
    severity: data.newSeverity,
    trend: data.trend,
    notes: data.notes,
    createdAt: now,
  }

  // Determine new status based on trend
  let newStatus: 'active' | 'improving' | 'worsening' = 'active'
  if (data.trend) {
    newStatus = data.trend === 'stable' ? 'active' : data.trend
  }

  // Atomic transaction
  await db.transaction('rw', [db.flares, db.flareEvents], async () => {
    await db.flareEvents.add(event)
    await db.flares.update(flare.id!, {
      currentSeverity: data.newSeverity,
      status: newStatus,
      updatedAt: now,
    })
  })

  console.log('Flare updated:', data.flareId)
}

/**
 * Log an intervention for a flare
 */
export async function logFlareIntervention(data: {
  flareId: string
  interventionType: 'ice' | 'heat' | 'medication' | 'rest' | 'drainage' | 'other'
  interventionDetails?: string
  notes?: string
  timestamp?: number
}): Promise<void> {
  const now = getCurrentTimestamp()
  const timestamp = data.timestamp || now

  // Get existing flare
  const flare = await getFlareById(data.flareId)
  if (!flare) {
    throw new Error('Flare not found')
  }

  if (flare.status === 'resolved') {
    throw new Error('Cannot log intervention for resolved flare')
  }

  // Create intervention event
  const event: FlareEvent = {
    guid: generateGUID(),
    flareId: data.flareId,
    eventType: 'intervention',
    timestamp: timestamp,
    timezoneOffset: new Date().getTimezoneOffset(),
    interventionType: data.interventionType,
    interventionDetails: data.interventionDetails,
    notes: data.notes,
    createdAt: now,
  }

  await db.flareEvents.add(event)

  // Update flare's updatedAt
  await db.flares.update(flare.id!, {
    updatedAt: now,
  })

  console.log('Intervention logged:', data.flareId, data.interventionType)
}
