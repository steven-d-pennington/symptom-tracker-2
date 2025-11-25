'use client'

import { db } from '@/lib/db'

export interface ExportMetadata {
  exportDate: string
  exportVersion: string
  appVersion: string
  tableCount: number
  totalRecords: number
}

export interface FullBackup {
  metadata: ExportMetadata
  data: {
    users: unknown[]
    symptoms: unknown[]
    symptomInstances: unknown[]
    medications: unknown[]
    medicationEvents: unknown[]
    triggers: unknown[]
    triggerEvents: unknown[]
    foods: unknown[]
    foodEvents: unknown[]
    foodCombinationCorrelations: unknown[]
    flares: unknown[]
    flareEvents: unknown[]
    flareBodyLocations: unknown[]
    dailyEntries: unknown[]
    bodyMapLocations: unknown[]
    photoAttachments: unknown[]
    photoComparisons: unknown[]
    uxEvents: unknown[]
  }
}

export async function exportFullBackup(): Promise<FullBackup> {
  // Export all tables
  const [
    users,
    symptoms,
    symptomInstances,
    medications,
    medicationEvents,
    triggers,
    triggerEvents,
    foods,
    foodEvents,
    foodCombinationCorrelations,
    flares,
    flareEvents,
    flareBodyLocations,
    dailyEntries,
    bodyMapLocations,
    photoAttachments,
    photoComparisons,
    uxEvents
  ] = await Promise.all([
    db.users.toArray(),
    db.symptoms.toArray(),
    db.symptomInstances.toArray(),
    db.medications.toArray(),
    db.medicationEvents.toArray(),
    db.triggers.toArray(),
    db.triggerEvents.toArray(),
    db.foods.toArray(),
    db.foodEvents.toArray(),
    db.foodCombinationCorrelations.toArray(),
    db.flares.toArray(),
    db.flareEvents.toArray(),
    db.flareBodyLocations.toArray(),
    db.dailyEntries.toArray(),
    db.bodyMapLocations.toArray(),
    db.photoAttachments.toArray(),
    db.photoComparisons.toArray(),
    db.uxEvents.toArray()
  ])

  const data = {
    users,
    symptoms,
    symptomInstances,
    medications,
    medicationEvents,
    triggers,
    triggerEvents,
    foods,
    foodEvents,
    foodCombinationCorrelations,
    flares,
    flareEvents,
    flareBodyLocations,
    dailyEntries,
    bodyMapLocations,
    photoAttachments,
    photoComparisons,
    uxEvents
  }

  const totalRecords = Object.values(data).reduce((sum, arr) => sum + arr.length, 0)

  const metadata: ExportMetadata = {
    exportDate: new Date().toISOString(),
    exportVersion: '1.0',
    appVersion: '1.0.0',
    tableCount: Object.keys(data).length,
    totalRecords
  }

  return { metadata, data }
}

export function downloadJSON(data: FullBackup, filename?: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const date = new Date().toISOString().split('T')[0]
  const defaultFilename = `symptom-tracker-backup-${date}.json`

  const link = document.createElement('a')
  link.href = url
  link.download = filename || defaultFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getBackupSize(data: FullBackup): string {
  const json = JSON.stringify(data)
  const bytes = new Blob([json]).size

  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
