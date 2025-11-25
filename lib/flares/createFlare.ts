import { db, Flare, FlareEvent } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

/**
 * Create a new flare with initial event
 * Atomic transaction ensures data integrity
 */
export async function createFlare(data: {
  bodyRegion: string
  coordinateX: number
  coordinateY: number
  initialSeverity: number
  notes?: string
  photoIds?: string[]
  timestamp?: number
}): Promise<Flare> {
  const now = getCurrentTimestamp()
  const timestamp = data.timestamp || now
  const flareGuid = generateGUID()

  // Validate severity
  if (data.initialSeverity < 1 || data.initialSeverity > 10) {
    throw new Error('Severity must be between 1 and 10')
  }

  // Validate coordinates
  if (
    data.coordinateX < 0 ||
    data.coordinateX > 1 ||
    data.coordinateY < 0 ||
    data.coordinateY > 1
  ) {
    throw new Error('Coordinates must be between 0 and 1')
  }

  // Validate timestamp (cannot be in future)
  if (timestamp > now) {
    throw new Error('Timestamp cannot be in the future')
  }

  const flare: Flare = {
    guid: flareGuid,
    startDate: timestamp,
    status: 'active',
    bodyRegion: data.bodyRegion,
    coordinateX: data.coordinateX,
    coordinateY: data.coordinateY,
    initialSeverity: data.initialSeverity,
    currentSeverity: data.initialSeverity,
    createdAt: now,
    updatedAt: now,
  }

  const flareEvent: FlareEvent = {
    guid: generateGUID(),
    flareId: flareGuid,
    eventType: 'created',
    timestamp: timestamp,
    timezoneOffset: new Date().getTimezoneOffset(),
    severity: data.initialSeverity,
    notes: data.notes,
    createdAt: now,
  }

  // Atomic transaction
  await db.transaction('rw', [db.flares, db.flareEvents], async () => {
    await db.flares.add(flare)
    await db.flareEvents.add(flareEvent)
  })

  console.log('Flare created:', flareGuid)
  return flare
}

/**
 * Get all active flares
 */
export async function getActiveFlares(): Promise<Flare[]> {
  return await db.flares.where('status').notEqual('resolved').toArray()
}

/**
 * Get flare by ID
 */
export async function getFlareById(guid: string): Promise<Flare | undefined> {
  return await db.flares.where('guid').equals(guid).first()
}

/**
 * Get all events for a flare
 */
export async function getFlareEvents(flareId: string): Promise<FlareEvent[]> {
  return await db.flareEvents
    .where('flareId')
    .equals(flareId)
    .sortBy('timestamp')
}
