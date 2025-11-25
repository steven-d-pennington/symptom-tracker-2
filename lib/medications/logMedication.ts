import { db, MedicationEvent, Medication } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

export type TimingWarning = 'early' | 'late' | 'on-time'

/**
 * Log a medication event (taken or skipped)
 */
export async function logMedicationEvent(data: {
  medicationId: string
  taken: boolean
  timestamp?: number
  dosageOverride?: string
  notes?: string
  timingWarning?: TimingWarning
}): Promise<MedicationEvent> {
  const now = getCurrentTimestamp()
  const timestamp = data.timestamp || now

  const event: MedicationEvent = {
    guid: generateGUID(),
    medicationId: data.medicationId,
    timestamp,
    timezoneOffset: new Date().getTimezoneOffset(),
    taken: data.taken,
    dosageOverride: data.dosageOverride,
    notes: data.notes,
    timingWarning: data.timingWarning,
    createdAt: now,
  }

  await db.medicationEvents.add(event)
  console.log('Medication event logged:', event.guid, data.taken ? 'taken' : 'skipped')
  return event
}

/**
 * Get all medication events
 */
export async function getMedicationEvents(): Promise<MedicationEvent[]> {
  return await db.medicationEvents.orderBy('timestamp').reverse().toArray()
}

/**
 * Get medication events for a specific medication
 */
export async function getMedicationEventsByMedicationId(
  medicationId: string
): Promise<MedicationEvent[]> {
  return await db.medicationEvents
    .where('medicationId')
    .equals(medicationId)
    .reverse()
    .sortBy('timestamp')
}

/**
 * Get medication events within a date range
 */
export async function getMedicationEventsInRange(
  startDate: number,
  endDate: number
): Promise<MedicationEvent[]> {
  return await db.medicationEvents
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .reverse()
    .sortBy('timestamp')
}

/**
 * Get today's medication events
 */
export async function getTodaysMedicationEvents(): Promise<MedicationEvent[]> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000

  return await getMedicationEventsInRange(startOfDay, endOfDay)
}

/**
 * Get recent medication events
 */
export async function getRecentMedicationEvents(limit: number = 50): Promise<MedicationEvent[]> {
  return await db.medicationEvents.orderBy('timestamp').reverse().limit(limit).toArray()
}

/**
 * Delete a medication event
 */
export async function deleteMedicationEvent(guid: string): Promise<void> {
  await db.medicationEvents.where('guid').equals(guid).delete()
}

/**
 * Calculate adherence rate for a medication over a period
 */
export async function calculateAdherence(
  medicationId: string,
  startDate: number,
  endDate: number
): Promise<{
  totalEvents: number
  taken: number
  skipped: number
  adherenceRate: number
}> {
  const events = await db.medicationEvents
    .where('medicationId')
    .equals(medicationId)
    .filter((e) => e.timestamp >= startDate && e.timestamp <= endDate)
    .toArray()

  const taken = events.filter((e) => e.taken).length
  const skipped = events.filter((e) => !e.taken).length
  const total = events.length

  return {
    totalEvents: total,
    taken,
    skipped,
    adherenceRate: total > 0 ? (taken / total) * 100 : 0,
  }
}

/**
 * Get timing warning based on scheduled time
 */
export function getTimingWarning(
  scheduledTime: string, // "HH:mm"
  actualTime: Date,
  toleranceMinutes: number = 30
): TimingWarning {
  const [hours, minutes] = scheduledTime.split(':').map(Number)
  const scheduledDate = new Date(actualTime)
  scheduledDate.setHours(hours, minutes, 0, 0)

  const diffMinutes = (actualTime.getTime() - scheduledDate.getTime()) / (1000 * 60)

  if (Math.abs(diffMinutes) <= toleranceMinutes) {
    return 'on-time'
  }
  return diffMinutes < 0 ? 'early' : 'late'
}

/**
 * Get medication events with medication details
 */
export async function getMedicationEventsWithDetails(): Promise<
  Array<MedicationEvent & { medication?: Medication }>
> {
  const events = await getMedicationEvents()
  const medications = await db.medications.toArray()
  const medMap = new Map(medications.map((m) => [m.guid, m]))

  return events.map((event) => ({
    ...event,
    medication: medMap.get(event.medicationId),
  }))
}
