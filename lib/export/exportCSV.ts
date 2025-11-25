'use client'

import { db } from '@/lib/db'

export type ExportableTable =
  | 'symptoms'
  | 'symptomInstances'
  | 'medications'
  | 'medicationEvents'
  | 'triggers'
  | 'triggerEvents'
  | 'foods'
  | 'foodEvents'
  | 'flares'
  | 'flareEvents'
  | 'dailyEntries'

export interface CSVExportOptions {
  tables: ExportableTable[]
  dateRange?: {
    start: Date
    end: Date
  }
}

interface TableConfig {
  name: string
  columns: string[]
  dateField?: string
  transform: (row: Record<string, unknown>) => Record<string, string | number | boolean | null>
}

const TABLE_CONFIGS: Record<ExportableTable, TableConfig> = {
  symptoms: {
    name: 'Symptoms',
    columns: ['guid', 'name', 'category', 'description', 'isActive', 'isDefault', 'createdAt'],
    transform: (row) => ({
      guid: row.guid as string,
      name: row.name as string,
      category: row.category as string,
      description: row.description as string || '',
      isActive: row.isActive as boolean,
      isDefault: row.isDefault as boolean,
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  symptomInstances: {
    name: 'Symptom Logs',
    columns: ['guid', 'symptomId', 'timestamp', 'severity', 'bodyRegion', 'durationMinutes', 'notes', 'createdAt'],
    dateField: 'timestamp',
    transform: (row) => ({
      guid: row.guid as string,
      symptomId: row.symptomId as string,
      timestamp: new Date(row.timestamp as number).toISOString(),
      severity: row.severity as number,
      bodyRegion: row.bodyRegion as string || '',
      durationMinutes: row.durationMinutes as number || null,
      notes: row.notes as string || '',
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  medications: {
    name: 'Medications',
    columns: ['guid', 'name', 'dosage', 'frequency', 'isActive', 'isDefault', 'createdAt'],
    transform: (row) => ({
      guid: row.guid as string,
      name: row.name as string,
      dosage: row.dosage as string,
      frequency: row.frequency as string,
      isActive: row.isActive as boolean,
      isDefault: row.isDefault as boolean,
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  medicationEvents: {
    name: 'Medication Logs',
    columns: ['guid', 'medicationId', 'timestamp', 'taken', 'dosageOverride', 'timingWarning', 'notes', 'createdAt'],
    dateField: 'timestamp',
    transform: (row) => ({
      guid: row.guid as string,
      medicationId: row.medicationId as string,
      timestamp: new Date(row.timestamp as number).toISOString(),
      taken: row.taken as boolean,
      dosageOverride: row.dosageOverride as string || '',
      timingWarning: row.timingWarning as string || '',
      notes: row.notes as string || '',
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  triggers: {
    name: 'Triggers',
    columns: ['guid', 'name', 'category', 'description', 'isActive', 'isDefault', 'createdAt'],
    transform: (row) => ({
      guid: row.guid as string,
      name: row.name as string,
      category: row.category as string,
      description: row.description as string || '',
      isActive: row.isActive as boolean,
      isDefault: row.isDefault as boolean,
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  triggerEvents: {
    name: 'Trigger Logs',
    columns: ['guid', 'triggerId', 'timestamp', 'intensity', 'notes', 'createdAt'],
    dateField: 'timestamp',
    transform: (row) => ({
      guid: row.guid as string,
      triggerId: row.triggerId as string,
      timestamp: new Date(row.timestamp as number).toISOString(),
      intensity: row.intensity as string,
      notes: row.notes as string || '',
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  foods: {
    name: 'Foods',
    columns: ['guid', 'name', 'category', 'allergenTags', 'preparationMethod', 'isActive', 'isDefault', 'createdAt'],
    transform: (row) => ({
      guid: row.guid as string,
      name: row.name as string,
      category: row.category as string,
      allergenTags: ((row.allergenTags as string[]) || []).join('; '),
      preparationMethod: row.preparationMethod as string || '',
      isActive: row.isActive as boolean,
      isDefault: row.isDefault as boolean,
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  foodEvents: {
    name: 'Meal Logs',
    columns: ['guid', 'mealId', 'timestamp', 'mealType', 'foodCount', 'notes', 'createdAt'],
    dateField: 'timestamp',
    transform: (row) => ({
      guid: row.guid as string,
      mealId: row.mealId as string,
      timestamp: new Date(row.timestamp as number).toISOString(),
      mealType: row.mealType as string,
      foodCount: (row.foodIds as string[])?.length || 0,
      notes: row.notes as string || '',
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  flares: {
    name: 'Flares',
    columns: ['guid', 'startDate', 'endDate', 'status', 'bodyRegion', 'initialSeverity', 'currentSeverity', 'createdAt'],
    dateField: 'startDate',
    transform: (row) => ({
      guid: row.guid as string,
      startDate: new Date(row.startDate as number).toISOString(),
      endDate: row.endDate ? new Date(row.endDate as number).toISOString() : '',
      status: row.status as string,
      bodyRegion: row.bodyRegion as string,
      initialSeverity: row.initialSeverity as number,
      currentSeverity: row.currentSeverity as number,
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  flareEvents: {
    name: 'Flare Events',
    columns: ['guid', 'flareId', 'timestamp', 'eventType', 'severity', 'trend', 'interventionType', 'notes', 'createdAt'],
    dateField: 'timestamp',
    transform: (row) => ({
      guid: row.guid as string,
      flareId: row.flareId as string,
      timestamp: new Date(row.timestamp as number).toISOString(),
      eventType: row.eventType as string,
      severity: row.severity as number || null,
      trend: row.trend as string || '',
      interventionType: row.interventionType as string || '',
      notes: row.notes as string || '',
      createdAt: new Date(row.createdAt as number).toISOString()
    })
  },
  dailyEntries: {
    name: 'Daily Entries',
    columns: ['guid', 'date', 'overallHealthScore', 'energyLevel', 'sleepQuality', 'stressLevel', 'mood', 'notes', 'completedAt'],
    dateField: 'completedAt',
    transform: (row) => ({
      guid: row.guid as string,
      date: row.date as string,
      overallHealthScore: row.overallHealthScore as number,
      energyLevel: row.energyLevel as number,
      sleepQuality: row.sleepQuality as number,
      stressLevel: row.stressLevel as number,
      mood: row.mood as string || '',
      notes: row.notes as string || '',
      completedAt: new Date(row.completedAt as number).toISOString()
    })
  }
}

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCSV(columns: string[], rows: Record<string, unknown>[]): string {
  const header = columns.map(escapeCSV).join(',')
  const dataRows = rows.map(row =>
    columns.map(col => escapeCSV(row[col] as string | number | boolean | null)).join(',')
  )
  return [header, ...dataRows].join('\n')
}

export async function exportTableToCSV(
  table: ExportableTable,
  dateRange?: { start: Date; end: Date }
): Promise<string> {
  const config = TABLE_CONFIGS[table]
  let rows: unknown[]

  // Get data from the appropriate table
  switch (table) {
    case 'symptoms':
      rows = await db.symptoms.toArray()
      break
    case 'symptomInstances':
      rows = await db.symptomInstances.toArray()
      break
    case 'medications':
      rows = await db.medications.toArray()
      break
    case 'medicationEvents':
      rows = await db.medicationEvents.toArray()
      break
    case 'triggers':
      rows = await db.triggers.toArray()
      break
    case 'triggerEvents':
      rows = await db.triggerEvents.toArray()
      break
    case 'foods':
      rows = await db.foods.toArray()
      break
    case 'foodEvents':
      rows = await db.foodEvents.toArray()
      break
    case 'flares':
      rows = await db.flares.toArray()
      break
    case 'flareEvents':
      rows = await db.flareEvents.toArray()
      break
    case 'dailyEntries':
      rows = await db.dailyEntries.toArray()
      break
    default:
      rows = []
  }

  // Apply date filter if specified
  if (dateRange && config.dateField) {
    const startMs = dateRange.start.getTime()
    const endMs = dateRange.end.getTime()
    rows = rows.filter(row => {
      const dateValue = (row as Record<string, unknown>)[config.dateField!] as number
      return dateValue >= startMs && dateValue <= endMs
    })
  }

  // Transform rows
  const transformedRows = rows.map(row => config.transform(row as Record<string, unknown>))

  return toCSV(config.columns, transformedRows)
}

export async function exportMultipleTablesCSV(options: CSVExportOptions): Promise<Map<ExportableTable, string>> {
  const results = new Map<ExportableTable, string>()

  for (const table of options.tables) {
    const csv = await exportTableToCSV(table, options.dateRange)
    results.set(table, csv)
  }

  return results
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getTableDisplayName(table: ExportableTable): string {
  return TABLE_CONFIGS[table].name
}

export const EXPORTABLE_TABLES: ExportableTable[] = [
  'symptoms',
  'symptomInstances',
  'medications',
  'medicationEvents',
  'triggers',
  'triggerEvents',
  'foods',
  'foodEvents',
  'flares',
  'flareEvents',
  'dailyEntries'
]
