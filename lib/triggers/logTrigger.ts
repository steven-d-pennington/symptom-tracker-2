import { db, TriggerEvent, Trigger } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

export type Intensity = 'low' | 'medium' | 'high'

/**
 * Log a trigger exposure
 */
export async function logTrigger(data: {
  triggerId: string
  intensity: Intensity
  timestamp?: number
  notes?: string
}): Promise<TriggerEvent> {
  const now = getCurrentTimestamp()
  const timestamp = data.timestamp || now

  const triggerEvent: TriggerEvent = {
    guid: generateGUID(),
    triggerId: data.triggerId,
    timestamp,
    timezoneOffset: new Date().getTimezoneOffset(),
    intensity: data.intensity,
    notes: data.notes,
    createdAt: now,
  }

  await db.triggerEvents.add(triggerEvent)
  console.log('Trigger logged:', triggerEvent.guid)
  return triggerEvent
}

/**
 * Get all trigger events
 */
export async function getTriggerEvents(): Promise<TriggerEvent[]> {
  return await db.triggerEvents.orderBy('timestamp').reverse().toArray()
}

/**
 * Get trigger events within a date range
 */
export async function getTriggerEventsInRange(
  startDate: number,
  endDate: number
): Promise<TriggerEvent[]> {
  return await db.triggerEvents
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .reverse()
    .sortBy('timestamp')
}

/**
 * Get trigger events by trigger ID
 */
export async function getTriggerEventsByTriggerId(triggerId: string): Promise<TriggerEvent[]> {
  return await db.triggerEvents
    .where('triggerId')
    .equals(triggerId)
    .reverse()
    .sortBy('timestamp')
}

/**
 * Get a single trigger event by ID
 */
export async function getTriggerEventById(guid: string): Promise<TriggerEvent | undefined> {
  return await db.triggerEvents.where('guid').equals(guid).first()
}

/**
 * Delete a trigger event
 */
export async function deleteTriggerEvent(guid: string): Promise<void> {
  await db.triggerEvents.where('guid').equals(guid).delete()
}

/**
 * Get active triggers from the database
 */
export async function getActiveTriggers(): Promise<Trigger[]> {
  return await db.triggers.filter((t) => t.isActive === true).toArray()
}

/**
 * Get triggers by category
 */
export async function getTriggersByCategory(): Promise<Record<string, Trigger[]>> {
  const triggers = await getActiveTriggers()
  return triggers.reduce(
    (acc, trigger) => {
      if (!acc[trigger.category]) {
        acc[trigger.category] = []
      }
      acc[trigger.category].push(trigger)
      return acc
    },
    {} as Record<string, Trigger[]>
  )
}

/**
 * Get recent trigger events
 */
export async function getRecentTriggerEvents(limit: number = 50): Promise<TriggerEvent[]> {
  return await db.triggerEvents.orderBy('timestamp').reverse().limit(limit).toArray()
}

/**
 * Get today's trigger events
 */
export async function getTodaysTriggerEvents(): Promise<TriggerEvent[]> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000

  return await getTriggerEventsInRange(startOfDay, endOfDay)
}

/**
 * Get trigger statistics for a date range
 */
export async function getTriggerStats(startDate: number, endDate: number): Promise<{
  totalEvents: number
  byTrigger: Record<string, number>
  byIntensity: Record<Intensity, number>
}> {
  const events = await getTriggerEventsInRange(startDate, endDate)

  const byTrigger: Record<string, number> = {}
  const byIntensity: Record<Intensity, number> = {
    low: 0,
    medium: 0,
    high: 0,
  }

  events.forEach((event) => {
    byTrigger[event.triggerId] = (byTrigger[event.triggerId] || 0) + 1
    byIntensity[event.intensity]++
  })

  return {
    totalEvents: events.length,
    byTrigger,
    byIntensity,
  }
}
