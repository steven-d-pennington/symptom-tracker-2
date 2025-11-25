'use client'

import { db } from '@/lib/db'

/**
 * Completely deletes all user data from the database.
 * This is irreversible and cannot be undone.
 */
export async function deleteAllUserData(): Promise<void> {
  // Delete all data from all tables
  await Promise.all([
    // User data
    db.users.clear(),

    // Symptoms
    db.symptoms.clear(),
    db.symptomInstances.clear(),

    // Medications
    db.medications.clear(),
    db.medicationEvents.clear(),

    // Triggers
    db.triggers.clear(),
    db.triggerEvents.clear(),

    // Foods
    db.foods.clear(),
    db.foodEvents.clear(),
    db.foodCombinationCorrelations.clear(),

    // Flares
    db.flares.clear(),
    db.flareEvents.clear(),
    db.flareBodyLocations.clear(),

    // Daily entries
    db.dailyEntries.clear(),
    db.bodyMapLocations.clear(),

    // Photos
    db.photoAttachments.clear(),
    db.photoComparisons.clear(),

    // Analytics
    db.uxEvents.clear()
  ])

  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.clear()
  }

  // Clear sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.clear()
  }
}

/**
 * Get count of all records that will be deleted
 */
export async function getDataCounts(): Promise<{
  total: number
  breakdown: { name: string; count: number }[]
}> {
  const counts = await Promise.all([
    db.users.count(),
    db.symptoms.count(),
    db.symptomInstances.count(),
    db.medications.count(),
    db.medicationEvents.count(),
    db.triggers.count(),
    db.triggerEvents.count(),
    db.foods.count(),
    db.foodEvents.count(),
    db.flares.count(),
    db.flareEvents.count(),
    db.dailyEntries.count(),
    db.photoAttachments.count()
  ])

  const breakdown = [
    { name: 'User profiles', count: counts[0] },
    { name: 'Symptoms', count: counts[1] },
    { name: 'Symptom logs', count: counts[2] },
    { name: 'Medications', count: counts[3] },
    { name: 'Medication logs', count: counts[4] },
    { name: 'Triggers', count: counts[5] },
    { name: 'Trigger logs', count: counts[6] },
    { name: 'Foods', count: counts[7] },
    { name: 'Meal logs', count: counts[8] },
    { name: 'Flares', count: counts[9] },
    { name: 'Flare events', count: counts[10] },
    { name: 'Daily entries', count: counts[11] },
    { name: 'Photos', count: counts[12] }
  ].filter(item => item.count > 0)

  const total = counts.reduce((sum, count) => sum + count, 0)

  return { total, breakdown }
}
