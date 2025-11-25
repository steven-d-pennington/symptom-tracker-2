import { db, SymptomInstance, Symptom } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

/**
 * Log a new symptom instance
 */
export async function logSymptom(data: {
  symptomId: string
  severity: number
  timestamp?: number
  bodyRegion?: string
  coordinateX?: number
  coordinateY?: number
  durationMinutes?: number
  associatedTriggers?: string[]
  notes?: string
  photoIds?: string[]
}): Promise<SymptomInstance> {
  const now = getCurrentTimestamp()
  const timestamp = data.timestamp || now

  // Validate severity
  if (data.severity < 1 || data.severity > 10) {
    throw new Error('Severity must be between 1 and 10')
  }

  // Validate timestamp (cannot be in future)
  if (timestamp > now) {
    throw new Error('Timestamp cannot be in the future')
  }

  // Validate coordinates if provided
  if (data.coordinateX !== undefined || data.coordinateY !== undefined) {
    if (
      data.coordinateX === undefined ||
      data.coordinateY === undefined ||
      data.coordinateX < 0 ||
      data.coordinateX > 1 ||
      data.coordinateY < 0 ||
      data.coordinateY > 1
    ) {
      throw new Error('Both coordinates must be provided and between 0 and 1')
    }
  }

  const symptomInstance: SymptomInstance = {
    guid: generateGUID(),
    symptomId: data.symptomId,
    timestamp: timestamp,
    timezoneOffset: new Date().getTimezoneOffset(),
    severity: data.severity,
    bodyRegion: data.bodyRegion,
    coordinateX: data.coordinateX,
    coordinateY: data.coordinateY,
    durationMinutes: data.durationMinutes,
    associatedTriggers: data.associatedTriggers,
    notes: data.notes,
    photoIds: data.photoIds,
    createdAt: now,
  }

  await db.symptomInstances.add(symptomInstance)

  console.log('Symptom logged:', symptomInstance.guid)
  return symptomInstance
}

/**
 * Get all active symptoms (user's selected symptoms to track)
 */
export async function getActiveSymptoms(): Promise<Symptom[]> {
  const allSymptoms = await db.symptoms.toArray()
  return allSymptoms.filter(s => s.isActive === true).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get recent symptom instances
 */
export async function getRecentSymptomInstances(limit: number = 50): Promise<SymptomInstance[]> {
  return await db.symptomInstances
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray()
}

/**
 * Get symptom instances for a specific symptom
 */
export async function getSymptomInstancesBySymptomId(
  symptomId: string
): Promise<SymptomInstance[]> {
  return await db.symptomInstances
    .where('symptomId')
    .equals(symptomId)
    .reverse()
    .sortBy('timestamp')
}

/**
 * Get symptom by ID
 */
export async function getSymptomById(guid: string): Promise<Symptom | undefined> {
  return await db.symptoms.where('guid').equals(guid).first()
}

/**
 * Get symptoms instances for a date range
 */
export async function getSymptomInstancesInRange(
  startDate: number,
  endDate: number
): Promise<SymptomInstance[]> {
  return await db.symptomInstances
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .toArray()
}
