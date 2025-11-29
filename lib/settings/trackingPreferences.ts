import { db, Symptom, Trigger, Food, Medication } from '../db'

export type TrackingCategory = 'symptoms' | 'medications' | 'triggers' | 'foods'

export interface TrackingCounts {
  symptoms: number
  medications: number
  triggers: number
  foods: number
}

/**
 * Get counts of tracked items for each category
 */
export async function getTrackingCounts(): Promise<TrackingCounts> {
  const [symptoms, medications, triggers, foods] = await Promise.all([
    db.symptoms.where('isActive').equals(1).count(),
    db.medications.where('isActive').equals(1).count(),
    db.triggers.where('isActive').equals(1).count(),
    db.foods.where('isActive').equals(1).count(),
  ])

  return { symptoms, medications, triggers, foods }
}

/**
 * Get all tracked (active) items for a category
 */
export async function getTrackedSymptoms(): Promise<Symptom[]> {
  return db.symptoms.where('isActive').equals(1).toArray()
}

export async function getTrackedMedications(): Promise<Medication[]> {
  return db.medications.where('isActive').equals(1).toArray()
}

export async function getTrackedTriggers(): Promise<Trigger[]> {
  return db.triggers.where('isActive').equals(1).toArray()
}

export async function getTrackedFoods(): Promise<Food[]> {
  return db.foods.where('isActive').equals(1).toArray()
}

/**
 * Get all items (including inactive) for a category
 */
export async function getAllSymptoms(): Promise<Symptom[]> {
  return db.symptoms.toArray()
}

export async function getAllMedications(): Promise<Medication[]> {
  return db.medications.toArray()
}

export async function getAllTriggers(): Promise<Trigger[]> {
  return db.triggers.toArray()
}

export async function getAllFoods(): Promise<Food[]> {
  return db.foods.toArray()
}

/**
 * Set tracking status for an item
 */
export async function setSymptomTracked(guid: string, tracked: boolean): Promise<void> {
  await db.symptoms.where('guid').equals(guid).modify({
    isActive: tracked,
    updatedAt: Date.now()
  })
}

export async function setMedicationTracked(guid: string, tracked: boolean): Promise<void> {
  await db.medications.where('guid').equals(guid).modify({
    isActive: tracked,
    updatedAt: Date.now()
  })
}

export async function setTriggerTracked(guid: string, tracked: boolean): Promise<void> {
  await db.triggers.where('guid').equals(guid).modify({
    isActive: tracked,
    updatedAt: Date.now()
  })
}

export async function setFoodTracked(guid: string, tracked: boolean): Promise<void> {
  await db.foods.where('guid').equals(guid).modify({
    isActive: tracked,
    updatedAt: Date.now()
  })
}

/**
 * Bulk enable items for a category
 */
export async function enableSymptoms(guids: string[]): Promise<void> {
  if (guids.length === 0) return
  await db.symptoms.where('guid').anyOf(guids).modify({
    isActive: true,
    updatedAt: Date.now()
  })
}

export async function enableTriggers(guids: string[]): Promise<void> {
  if (guids.length === 0) return
  await db.triggers.where('guid').anyOf(guids).modify({
    isActive: true,
    updatedAt: Date.now()
  })
}

export async function enableFoods(guids: string[]): Promise<void> {
  if (guids.length === 0) return
  await db.foods.where('guid').anyOf(guids).modify({
    isActive: true,
    updatedAt: Date.now()
  })
}

export async function enableMedications(guids: string[]): Promise<void> {
  if (guids.length === 0) return
  await db.medications.where('guid').anyOf(guids).modify({
    isActive: true,
    updatedAt: Date.now()
  })
}
