import { db, Medication } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

export interface MedicationSchedule {
  times: string[] // Array of times like "08:00", "20:00"
  days?: number[] // Days of week (0-6, Sunday-Saturday), undefined = every day
}

/**
 * Create a new medication
 */
export async function createMedication(data: {
  name: string
  dosage: string
  frequency: string
  schedule?: MedicationSchedule
  sideEffects?: string[]
}): Promise<Medication> {
  const now = getCurrentTimestamp()

  const medication: Medication = {
    guid: generateGUID(),
    name: data.name.trim(),
    dosage: data.dosage.trim(),
    frequency: data.frequency.trim(),
    schedule: data.schedule || { times: [] },
    sideEffects: data.sideEffects || [],
    isActive: true,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  }

  await db.medications.add(medication)
  console.log('Medication created:', medication.guid)
  return medication
}

/**
 * Update a medication
 */
export async function updateMedication(
  guid: string,
  updates: Partial<Pick<Medication, 'name' | 'dosage' | 'frequency' | 'schedule' | 'sideEffects'>>
): Promise<void> {
  const existing = await getMedicationById(guid)
  if (!existing) {
    throw new Error('Medication not found')
  }

  await db.medications.where('guid').equals(guid).modify({
    ...updates,
    updatedAt: getCurrentTimestamp(),
  })
}

/**
 * Soft delete (deactivate) a medication
 */
export async function deactivateMedication(guid: string): Promise<void> {
  await db.medications.where('guid').equals(guid).modify({
    isActive: false,
    updatedAt: getCurrentTimestamp(),
  })
}

/**
 * Reactivate a medication
 */
export async function reactivateMedication(guid: string): Promise<void> {
  await db.medications.where('guid').equals(guid).modify({
    isActive: true,
    updatedAt: getCurrentTimestamp(),
  })
}

/**
 * Get a single medication by ID
 */
export async function getMedicationById(guid: string): Promise<Medication | undefined> {
  return await db.medications.where('guid').equals(guid).first()
}

/**
 * Get all active medications
 */
export async function getActiveMedications(): Promise<Medication[]> {
  return await db.medications.filter((m) => m.isActive === true).toArray()
}

/**
 * Get all medications (including inactive)
 */
export async function getAllMedications(): Promise<Medication[]> {
  return await db.medications.toArray()
}

/**
 * Get inactive medications
 */
export async function getInactiveMedications(): Promise<Medication[]> {
  return await db.medications.filter((m) => m.isActive === false).toArray()
}

/**
 * Search medications by name
 */
export async function searchMedications(query: string): Promise<Medication[]> {
  const lowerQuery = query.toLowerCase()
  return await db.medications
    .filter((m) => m.name.toLowerCase().includes(lowerQuery))
    .toArray()
}

/**
 * Get medications due at a specific time
 */
export function getMedicationsDueAtTime(
  medications: Medication[],
  time: string, // "HH:mm" format
  dayOfWeek?: number // 0-6
): Medication[] {
  return medications.filter((med) => {
    if (!med.isActive) return false
    if (!med.schedule.times.includes(time)) return false
    if (med.schedule.days && dayOfWeek !== undefined) {
      return med.schedule.days.includes(dayOfWeek)
    }
    return true
  })
}

/**
 * Get medications scheduled for today
 */
export function getMedicationsForToday(medications: Medication[]): Medication[] {
  const today = new Date().getDay() // 0-6
  return medications.filter((med) => {
    if (!med.isActive) return false
    if (med.schedule.times.length === 0) return false
    if (med.schedule.days && med.schedule.days.length > 0) {
      return med.schedule.days.includes(today)
    }
    return true // No specific days means every day
  })
}

/**
 * Common frequency options
 */
export const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'Once weekly',
  'As needed',
  'Other',
]
