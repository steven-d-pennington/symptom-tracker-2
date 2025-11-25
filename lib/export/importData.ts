'use client'

import { db } from '@/lib/db'
import { FullBackup, ExportMetadata } from './exportJSON'

export interface ImportResult {
  success: boolean
  message: string
  stats?: {
    table: string
    imported: number
    skipped: number
    errors: number
  }[]
  errors?: string[]
}

export interface ImportOptions {
  mode: 'merge' | 'replace'
  onProgress?: (progress: { table: string; current: number; total: number }) => void
}

// Validate backup file structure
export function validateBackupFile(data: unknown): { valid: boolean; error?: string; backup?: FullBackup } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid file format: expected JSON object' }
  }

  const backup = data as Record<string, unknown>

  // Check for metadata
  if (!backup.metadata || typeof backup.metadata !== 'object') {
    return { valid: false, error: 'Missing or invalid metadata section' }
  }

  const metadata = backup.metadata as Partial<ExportMetadata>

  if (!metadata.exportVersion || !metadata.exportDate) {
    return { valid: false, error: 'Missing required metadata fields' }
  }

  // Check for data section
  if (!backup.data || typeof backup.data !== 'object') {
    return { valid: false, error: 'Missing or invalid data section' }
  }

  // Validate expected tables exist
  const expectedTables = [
    'users', 'symptoms', 'symptomInstances', 'medications', 'medicationEvents',
    'triggers', 'triggerEvents', 'foods', 'foodEvents', 'flares', 'flareEvents',
    'dailyEntries', 'bodyMapLocations'
  ]

  const dataSection = backup.data as Record<string, unknown>
  const missingTables = expectedTables.filter(table => !(table in dataSection))

  if (missingTables.length > expectedTables.length / 2) {
    return { valid: false, error: `Missing many expected tables: ${missingTables.join(', ')}` }
  }

  return { valid: true, backup: backup as unknown as FullBackup }
}

// Parse backup file
export async function parseBackupFile(file: File): Promise<{ valid: boolean; error?: string; backup?: FullBackup }> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        resolve(validateBackupFile(data))
      } catch (error) {
        resolve({
          valid: false,
          error: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    reader.onerror = () => {
      resolve({ valid: false, error: 'Failed to read file' })
    }

    reader.readAsText(file)
  })
}

// Import data from backup
export async function importBackup(
  backup: FullBackup,
  options: ImportOptions
): Promise<ImportResult> {
  const { mode, onProgress } = options
  const stats: ImportResult['stats'] = []
  const errors: string[] = []

  try {
    // If replace mode, clear existing data first
    if (mode === 'replace') {
      await clearAllData()
    }

    // Define table import order (respecting foreign key dependencies)
    const tableOrder: (keyof FullBackup['data'])[] = [
      'users',
      'symptoms',
      'medications',
      'triggers',
      'foods',
      'flares',
      'dailyEntries',
      'symptomInstances',
      'medicationEvents',
      'triggerEvents',
      'foodEvents',
      'flareEvents',
      'flareBodyLocations',
      'bodyMapLocations',
      'photoAttachments',
      'photoComparisons',
      'foodCombinationCorrelations',
      'uxEvents'
    ]

    for (const tableName of tableOrder) {
      const records = backup.data[tableName]

      if (!records || !Array.isArray(records)) {
        continue
      }

      const tableStat = {
        table: tableName,
        imported: 0,
        skipped: 0,
        errors: 0
      }

      for (let i = 0; i < records.length; i++) {
        onProgress?.({
          table: tableName,
          current: i + 1,
          total: records.length
        })

        try {
          const record = records[i] as Record<string, unknown>

          // Skip if record doesn't have a guid
          if (!record.guid) {
            tableStat.skipped++
            continue
          }

          // Check if record already exists (for merge mode)
          if (mode === 'merge') {
            const existing = await findExistingRecord(tableName, record.guid as string)
            if (existing) {
              tableStat.skipped++
              continue
            }
          }

          // Remove the id field to let IndexedDB generate new ones
          const { id, ...recordWithoutId } = record

          // Handle special cases for ArrayBuffer fields
          if (tableName === 'photoAttachments') {
            // Photo attachments have encrypted data that needs special handling
            // Skip photos during import as they contain binary data
            tableStat.skipped++
            continue
          }

          // Import the record
          await importRecord(tableName, recordWithoutId)
          tableStat.imported++
        } catch (error) {
          tableStat.errors++
          errors.push(`${tableName}[${i}]: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      stats.push(tableStat)
    }

    const totalImported = stats.reduce((sum, s) => sum + s.imported, 0)
    const totalErrors = stats.reduce((sum, s) => sum + s.errors, 0)

    return {
      success: totalErrors === 0,
      message: `Imported ${totalImported} records${totalErrors > 0 ? ` with ${totalErrors} errors` : ''}`,
      stats,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    return {
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

// Find existing record by guid
async function findExistingRecord(tableName: string, guid: string): Promise<boolean> {
  const dbAny = db as unknown as Record<string, {
    where: (field: string) => { equals: (value: string) => { first: () => Promise<unknown> } }
  }>

  const table = dbAny[tableName]
  if (!table || typeof table.where !== 'function') {
    return false
  }

  try {
    const existing = await table.where('guid').equals(guid).first()
    return !!existing
  } catch {
    return false
  }
}

// Import a single record
async function importRecord(tableName: string, record: Record<string, unknown>): Promise<void> {
  const dbAny = db as unknown as Record<string, {
    add: (record: Record<string, unknown>) => Promise<number>
  }>

  const table = dbAny[tableName]
  if (!table || typeof table.add !== 'function') {
    throw new Error(`Table ${tableName} not found`)
  }

  await table.add(record)
}

// Clear all data (for replace mode)
async function clearAllData(): Promise<void> {
  await db.symptoms.clear()
  await db.symptomInstances.clear()
  await db.medications.clear()
  await db.medicationEvents.clear()
  await db.triggers.clear()
  await db.triggerEvents.clear()
  await db.foods.clear()
  await db.foodEvents.clear()
  await db.foodCombinationCorrelations.clear()
  await db.flares.clear()
  await db.flareEvents.clear()
  await db.flareBodyLocations.clear()
  await db.dailyEntries.clear()
  await db.bodyMapLocations.clear()
  await db.photoAttachments.clear()
  await db.photoComparisons.clear()
  await db.uxEvents.clear()
  // Note: We don't clear users to preserve current user settings
}

// Get import preview (stats about what will be imported)
export function getImportPreview(backup: FullBackup): {
  totalRecords: number
  tables: { name: string; count: number }[]
} {
  const tables: { name: string; count: number }[] = []
  let totalRecords = 0

  for (const [name, records] of Object.entries(backup.data)) {
    if (Array.isArray(records) && records.length > 0) {
      tables.push({ name, count: records.length })
      totalRecords += records.length
    }
  }

  return { totalRecords, tables }
}
