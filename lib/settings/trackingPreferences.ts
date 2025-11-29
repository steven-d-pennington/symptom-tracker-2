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
    db.symptoms.filter((s) => s.isActive === true).count(),
    db.medications.filter((m) => m.isActive === true).count(),
    db.triggers.filter((t) => t.isActive === true).count(),
    db.foods.filter((f) => f.isActive === true).count(),
  ])

  return { symptoms, medications, triggers, foods }
}

/**
 * Get all tracked (active) items for a category
 */
export async function getTrackedSymptoms(): Promise<Symptom[]> {
  return db.symptoms.filter((s) => s.isActive === true).toArray()
}

export async function getTrackedMedications(): Promise<Medication[]> {
  return db.medications.filter((m) => m.isActive === true).toArray()
}

export async function getTrackedTriggers(): Promise<Trigger[]> {
  return db.triggers.filter((t) => t.isActive === true).toArray()
}

export async function getTrackedFoods(): Promise<Food[]> {
  return db.foods.filter((f) => f.isActive === true).toArray()
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
