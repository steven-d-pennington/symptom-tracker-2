import { db, DailyEntry } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

export type Mood = 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed'

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get today's date key
 */
export function getTodayKey(): string {
  return formatDateKey(new Date())
}

/**
 * Create or update a daily entry
 */
export async function saveDailyEntry(data: {
  date: string // YYYY-MM-DD
  overallHealthScore: number
  energyLevel: number
  sleepQuality: number
  stressLevel: number
  mood?: Mood
  symptomIds?: string[]
  medicationIds?: string[]
  triggerIds?: string[]
  notes?: string
  weatherData?: Record<string, unknown>
  location?: string
}): Promise<DailyEntry> {
  const now = getCurrentTimestamp()

  // Check if entry exists for this date
  const existing = await getDailyEntryByDate(data.date)

  if (existing) {
    // Update existing entry
    await db.dailyEntries.where('guid').equals(existing.guid).modify({
      overallHealthScore: data.overallHealthScore,
      energyLevel: data.energyLevel,
      sleepQuality: data.sleepQuality,
      stressLevel: data.stressLevel,
      mood: data.mood,
      symptomIds: data.symptomIds || [],
      medicationIds: data.medicationIds || [],
      triggerIds: data.triggerIds || [],
      notes: data.notes,
      weatherData: data.weatherData,
      location: data.location,
      completedAt: now,
      updatedAt: now,
    })

    return {
      ...existing,
      ...data,
      completedAt: now,
      updatedAt: now,
    }
  }

  // Create new entry
  const entry: DailyEntry = {
    guid: generateGUID(),
    date: data.date,
    overallHealthScore: data.overallHealthScore,
    energyLevel: data.energyLevel,
    sleepQuality: data.sleepQuality,
    stressLevel: data.stressLevel,
    mood: data.mood,
    symptomIds: data.symptomIds || [],
    medicationIds: data.medicationIds || [],
    triggerIds: data.triggerIds || [],
    notes: data.notes,
    weatherData: data.weatherData,
    location: data.location,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  }

  await db.dailyEntries.add(entry)
  console.log('Daily entry saved:', entry.guid, entry.date)
  return entry
}

/**
 * Get daily entry by date
 */
export async function getDailyEntryByDate(date: string): Promise<DailyEntry | undefined> {
  return await db.dailyEntries.where('date').equals(date).first()
}

/**
 * Get daily entry by ID
 */
export async function getDailyEntryById(guid: string): Promise<DailyEntry | undefined> {
  return await db.dailyEntries.where('guid').equals(guid).first()
}

/**
 * Get all daily entries
 */
export async function getAllDailyEntries(): Promise<DailyEntry[]> {
  return await db.dailyEntries.orderBy('date').reverse().toArray()
}

/**
 * Get daily entries in a date range
 */
export async function getDailyEntriesInRange(
  startDate: string,
  endDate: string
): Promise<DailyEntry[]> {
  return await db.dailyEntries
    .where('date')
    .between(startDate, endDate, true, true)
    .reverse()
    .sortBy('date')
}

/**
 * Get recent daily entries
 */
export async function getRecentDailyEntries(limit: number = 30): Promise<DailyEntry[]> {
  return await db.dailyEntries.orderBy('date').reverse().limit(limit).toArray()
}

/**
 * Delete a daily entry
 */
export async function deleteDailyEntry(guid: string): Promise<void> {
  await db.dailyEntries.where('guid').equals(guid).delete()
}

/**
 * Get today's summary data (symptoms, medications, triggers logged today)
 */
export async function getTodaysSummary(): Promise<{
  symptomIds: string[]
  medicationIds: string[]
  triggerIds: string[]
}> {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000

  // Get symptom instances from today
  const symptoms = await db.symptomInstances
    .where('timestamp')
    .between(startOfDay, endOfDay, true, true)
    .toArray()
  const symptomIds = [...new Set(symptoms.map((s) => s.symptomId))]

  // Get medication events from today
  const medications = await db.medicationEvents
    .where('timestamp')
    .between(startOfDay, endOfDay, true, true)
    .toArray()
  const medicationIds = [...new Set(medications.filter((m) => m.taken).map((m) => m.medicationId))]

  // Get trigger events from today
  const triggers = await db.triggerEvents
    .where('timestamp')
    .between(startOfDay, endOfDay, true, true)
    .toArray()
  const triggerIds = [...new Set(triggers.map((t) => t.triggerId))]

  return { symptomIds, medicationIds, triggerIds }
}

/**
 * Calculate average scores over a period
 */
export async function getAverageScores(
  startDate: string,
  endDate: string
): Promise<{
  health: number
  energy: number
  sleep: number
  stress: number
  entryCount: number
}> {
  const entries = await getDailyEntriesInRange(startDate, endDate)

  if (entries.length === 0) {
    return { health: 0, energy: 0, sleep: 0, stress: 0, entryCount: 0 }
  }

  const totals = entries.reduce(
    (acc, entry) => ({
      health: acc.health + entry.overallHealthScore,
      energy: acc.energy + entry.energyLevel,
      sleep: acc.sleep + entry.sleepQuality,
      stress: acc.stress + entry.stressLevel,
    }),
    { health: 0, energy: 0, sleep: 0, stress: 0 }
  )

  return {
    health: totals.health / entries.length,
    energy: totals.energy / entries.length,
    sleep: totals.sleep / entries.length,
    stress: totals.stress / entries.length,
    entryCount: entries.length,
  }
}

/**
 * Mood options with emojis
 */
export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'stressed', label: 'Stressed', emoji: '😫' },
]
