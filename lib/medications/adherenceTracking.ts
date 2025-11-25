import { db, Medication, MedicationEvent } from '../db'

export interface AdherenceData {
  medicationId: string
  medicationName: string
  totalEvents: number
  taken: number
  skipped: number
  adherenceRate: number
}

export interface MissedDose {
  medication: Medication
  event: MedicationEvent
  date: Date
  reason?: string
}

export interface AdherenceReport {
  overallAdherence: number
  totalTaken: number
  totalSkipped: number
  byMedication: AdherenceData[]
  missedDoses: MissedDose[]
  weeklyTrend: { weekStart: Date; adherenceRate: number }[]
  dailyTrend: { date: Date; adherenceRate: number }[]
  dateRange: { start: Date; end: Date }
}

/**
 * Calculate overall adherence for all medications in a date range
 */
export async function calculateOverallAdherence(
  startDate: number,
  endDate: number
): Promise<AdherenceReport> {
  const medications = await db.medications.where('isActive').equals(1).toArray()
  const events = await db.medicationEvents
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .toArray()

  const medMap = new Map(medications.map((m) => [m.guid, m]))

  // Calculate per-medication adherence
  const byMedication: AdherenceData[] = []
  for (const med of medications) {
    const medEvents = events.filter((e) => e.medicationId === med.guid)
    const taken = medEvents.filter((e) => e.taken).length
    const skipped = medEvents.filter((e) => !e.taken).length
    const total = taken + skipped

    byMedication.push({
      medicationId: med.guid,
      medicationName: med.name,
      totalEvents: total,
      taken,
      skipped,
      adherenceRate: total > 0 ? (taken / total) * 100 : 0,
    })
  }

  // Calculate overall adherence
  const totalTaken = events.filter((e) => e.taken).length
  const totalSkipped = events.filter((e) => !e.taken).length
  const totalEvents = totalTaken + totalSkipped
  const overallAdherence = totalEvents > 0 ? (totalTaken / totalEvents) * 100 : 0

  // Get missed doses with details
  const missedDoses: MissedDose[] = events
    .filter((e) => !e.taken)
    .map((event) => ({
      medication: medMap.get(event.medicationId) as Medication,
      event,
      date: new Date(event.timestamp),
      reason: event.notes,
    }))
    .filter((md) => md.medication)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  // Calculate weekly trend
  const weeklyTrend = calculateWeeklyTrend(events, startDate, endDate)

  // Calculate daily trend
  const dailyTrend = calculateDailyTrend(events, startDate, endDate)

  return {
    overallAdherence,
    totalTaken,
    totalSkipped,
    byMedication: byMedication.sort((a, b) => b.totalEvents - a.totalEvents),
    missedDoses,
    weeklyTrend,
    dailyTrend,
    dateRange: { start: new Date(startDate), end: new Date(endDate) },
  }
}

/**
 * Calculate weekly adherence trend
 */
function calculateWeeklyTrend(
  events: MedicationEvent[],
  startDate: number,
  endDate: number
): { weekStart: Date; adherenceRate: number }[] {
  const trend: { weekStart: Date; adherenceRate: number }[] = []

  // Start from the beginning of the week containing startDate
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay()) // Go to Sunday

  const end = new Date(endDate)

  let current = new Date(start)
  while (current <= end) {
    const weekEnd = new Date(current)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const weekEvents = events.filter(
      (e) => e.timestamp >= current.getTime() && e.timestamp < weekEnd.getTime()
    )

    const taken = weekEvents.filter((e) => e.taken).length
    const total = weekEvents.length

    trend.push({
      weekStart: new Date(current),
      adherenceRate: total > 0 ? (taken / total) * 100 : 0,
    })

    current = weekEnd
  }

  return trend
}

/**
 * Calculate daily adherence trend
 */
function calculateDailyTrend(
  events: MedicationEvent[],
  startDate: number,
  endDate: number
): { date: Date; adherenceRate: number }[] {
  const trend: { date: Date; adherenceRate: number }[] = []

  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDate)

  let current = new Date(start)
  while (current <= end) {
    const dayEnd = new Date(current)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const dayEvents = events.filter(
      (e) => e.timestamp >= current.getTime() && e.timestamp < dayEnd.getTime()
    )

    const taken = dayEvents.filter((e) => e.taken).length
    const total = dayEvents.length

    if (total > 0) {
      trend.push({
        date: new Date(current),
        adherenceRate: (taken / total) * 100,
      })
    }

    current = dayEnd
  }

  return trend
}

/**
 * Get date range presets
 */
export function getDateRangePreset(
  preset: 'week' | 'month' | 'quarter' | 'year'
): { start: number; end: number } {
  const end = Date.now()
  let start: number

  switch (preset) {
    case 'week':
      start = end - 7 * 24 * 60 * 60 * 1000
      break
    case 'month':
      start = end - 30 * 24 * 60 * 60 * 1000
      break
    case 'quarter':
      start = end - 90 * 24 * 60 * 60 * 1000
      break
    case 'year':
      start = end - 365 * 24 * 60 * 60 * 1000
      break
    default:
      start = end - 30 * 24 * 60 * 60 * 1000
  }

  return { start, end }
}

/**
 * Export adherence data as CSV
 */
export function exportAdherenceToCSV(report: AdherenceReport): string {
  const lines: string[] = []

  // Header
  lines.push('Medication Adherence Report')
  lines.push(`Generated: ${new Date().toLocaleString()}`)
  lines.push(
    `Date Range: ${report.dateRange.start.toLocaleDateString()} - ${report.dateRange.end.toLocaleDateString()}`
  )
  lines.push('')

  // Overall Summary
  lines.push('OVERALL SUMMARY')
  lines.push(`Overall Adherence Rate,${report.overallAdherence.toFixed(1)}%`)
  lines.push(`Total Doses Taken,${report.totalTaken}`)
  lines.push(`Total Doses Skipped,${report.totalSkipped}`)
  lines.push('')

  // Per Medication
  lines.push('BY MEDICATION')
  lines.push('Medication,Total Events,Taken,Skipped,Adherence Rate')
  for (const med of report.byMedication) {
    lines.push(
      `${med.medicationName},${med.totalEvents},${med.taken},${med.skipped},${med.adherenceRate.toFixed(1)}%`
    )
  }
  lines.push('')

  // Missed Doses
  if (report.missedDoses.length > 0) {
    lines.push('MISSED DOSES')
    lines.push('Date,Medication,Reason')
    for (const missed of report.missedDoses) {
      lines.push(
        `${missed.date.toLocaleDateString()},${missed.medication.name},"${missed.reason || 'No reason provided'}"`
      )
    }
    lines.push('')
  }

  // Weekly Trend
  lines.push('WEEKLY TREND')
  lines.push('Week Starting,Adherence Rate')
  for (const week of report.weeklyTrend) {
    lines.push(`${week.weekStart.toLocaleDateString()},${week.adherenceRate.toFixed(1)}%`)
  }

  return lines.join('\n')
}

/**
 * Get adherence status label and color
 */
export function getAdherenceStatus(rate: number): {
  label: string
  color: 'green' | 'yellow' | 'orange' | 'red'
} {
  if (rate >= 90) return { label: 'Excellent', color: 'green' }
  if (rate >= 75) return { label: 'Good', color: 'yellow' }
  if (rate >= 50) return { label: 'Fair', color: 'orange' }
  return { label: 'Needs Improvement', color: 'red' }
}
