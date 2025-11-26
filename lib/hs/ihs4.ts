/**
 * IHS4 (International Hidradenitis Suppurativa Severity Score System) Calculation
 *
 * Formula: IHS4 = (Nodules × 1) + (Abscesses × 2) + (Draining Tunnels × 4)
 *
 * Severity thresholds:
 * - Mild: ≤3
 * - Moderate: 4-10
 * - Severe: ≥11
 */

import type {
  HSLesion,
  IHS4Result,
  IHS4Severity,
  IHS4HistoryPoint,
  DailyHSEntry,
  LesionType,
} from './types'
import { IHS4_WEIGHTS, IHS4_THRESHOLDS } from './types'

/**
 * Determines IHS4 severity level based on score
 */
export function getIHS4Severity(score: number): IHS4Severity {
  if (score <= IHS4_THRESHOLDS.mild.max) {
    return 'mild'
  }
  if (score <= IHS4_THRESHOLDS.moderate.max) {
    return 'moderate'
  }
  return 'severe'
}

/**
 * Calculates IHS4 score for a specific date
 *
 * Only includes lesions that:
 * 1. Had onset on or before the target date
 * 2. Were not healed before the target date (uses healedDate, not current status)
 *
 * Note: For historical queries, we use healedDate to determine if lesion was
 * active on that date, since the current status reflects the present state.
 */
export function calculateIHS4ForDate(
  lesions: HSLesion[],
  date: string
): IHS4Result {
  const targetDate = new Date(date)
  targetDate.setHours(23, 59, 59, 999) // End of day

  // Get lesions that were active on this date
  const activeLesions = lesions.filter((lesion) => {
    const onsetDate = new Date(lesion.onsetDate)
    onsetDate.setHours(0, 0, 0, 0) // Start of day

    const healedDate = lesion.healedDate
      ? new Date(lesion.healedDate)
      : null
    if (healedDate) {
      healedDate.setHours(0, 0, 0, 0)
    }

    // Lesion must have started on or before this date
    const hasStarted = onsetDate <= targetDate

    // For historical queries, use healedDate to determine if lesion was active
    // A lesion is considered active on a date if:
    // - It has no healedDate (still active today), OR
    // - Its healedDate is after the target date (was active on that date)
    const wasActiveOnDate = !healedDate || healedDate > targetDate

    return hasStarted && wasActiveOnDate
  })

  // Count by type
  const counts = countLesionsByType(activeLesions)

  // Calculate score
  const score =
    counts.nodules * IHS4_WEIGHTS.nodule +
    counts.abscesses * IHS4_WEIGHTS.abscess +
    counts.drainingTunnels * IHS4_WEIGHTS.draining_tunnel

  // Determine severity
  const severity = getIHS4Severity(score)

  return {
    score,
    severity,
    breakdown: counts,
    lesionIds: activeLesions.map((l) => l.guid),
  }
}

/**
 * Calculates IHS4 score from active lesions only (current state)
 * Faster version for real-time display - doesn't need date filtering
 */
export function calculateCurrentIHS4(lesions: HSLesion[]): IHS4Result {
  // Only count active and healing lesions
  const activeLesions = lesions.filter((lesion) =>
    ['active', 'healing'].includes(lesion.status)
  )

  const counts = countLesionsByType(activeLesions)

  const score =
    counts.nodules * IHS4_WEIGHTS.nodule +
    counts.abscesses * IHS4_WEIGHTS.abscess +
    counts.drainingTunnels * IHS4_WEIGHTS.draining_tunnel

  const severity = getIHS4Severity(score)

  return {
    score,
    severity,
    breakdown: counts,
    lesionIds: activeLesions.map((l) => l.guid),
  }
}

/**
 * Counts lesions by type
 */
function countLesionsByType(lesions: HSLesion[]): {
  nodules: number
  abscesses: number
  drainingTunnels: number
} {
  return {
    nodules: lesions.filter((l) => l.lesionType === 'nodule').length,
    abscesses: lesions.filter((l) => l.lesionType === 'abscess').length,
    drainingTunnels: lesions.filter((l) => l.lesionType === 'draining_tunnel').length,
  }
}

/**
 * Extracts IHS4 history from daily entries
 */
export function getIHS4History(entries: DailyHSEntry[]): IHS4HistoryPoint[] {
  return entries
    .filter((entry) => entry.ihs4)
    .map((entry) => ({
      date: entry.date,
      score: entry.ihs4.score,
      severity: entry.ihs4.severity,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculates the change in IHS4 score between two dates
 */
export function getIHS4Change(
  history: IHS4HistoryPoint[],
  fromDate: string,
  toDate: string
): {
  absoluteChange: number
  percentageChange: number | null
  trend: 'improving' | 'stable' | 'worsening'
} | null {
  const fromEntry = history.find((h) => h.date === fromDate)
  const toEntry = history.find((h) => h.date === toDate)

  if (!fromEntry || !toEntry) {
    return null
  }

  const absoluteChange = toEntry.score - fromEntry.score

  const percentageChange =
    fromEntry.score > 0
      ? ((toEntry.score - fromEntry.score) / fromEntry.score) * 100
      : null

  let trend: 'improving' | 'stable' | 'worsening'
  if (absoluteChange < -1) {
    trend = 'improving'
  } else if (absoluteChange > 1) {
    trend = 'worsening'
  } else {
    trend = 'stable'
  }

  return {
    absoluteChange,
    percentageChange,
    trend,
  }
}

/**
 * Calculates rolling average IHS4 over a period
 */
export function getIHS4Average(
  history: IHS4HistoryPoint[],
  days: number = 7
): number | null {
  if (history.length === 0) return null

  const recentHistory = history.slice(-days)
  if (recentHistory.length === 0) return null

  const sum = recentHistory.reduce((acc, h) => acc + h.score, 0)
  return sum / recentHistory.length
}

/**
 * Gets the worst IHS4 score in a period
 */
export function getWorstIHS4InPeriod(
  history: IHS4HistoryPoint[],
  startDate: string,
  endDate: string
): IHS4HistoryPoint | null {
  const periodHistory = history.filter(
    (h) => h.date >= startDate && h.date <= endDate
  )

  if (periodHistory.length === 0) return null

  return periodHistory.reduce((worst, current) =>
    current.score > worst.score ? current : worst
  )
}

/**
 * Calculates IHS4 impact of adding a lesion
 */
export function calculateIHS4Impact(
  currentScore: number,
  lesionType: LesionType
): {
  newScore: number
  change: number
  newSeverity: IHS4Severity
  severityChanged: boolean
} {
  const weight = IHS4_WEIGHTS[lesionType]
  const newScore = currentScore + weight
  const currentSeverity = getIHS4Severity(currentScore)
  const newSeverity = getIHS4Severity(newScore)

  return {
    newScore,
    change: weight,
    newSeverity,
    severityChanged: currentSeverity !== newSeverity,
  }
}

/**
 * Formats IHS4 score for display
 */
export function formatIHS4Score(score: number): string {
  return score.toFixed(0)
}

/**
 * Gets color class for IHS4 severity
 */
export function getIHS4SeverityColor(severity: IHS4Severity): {
  bg: string
  text: string
  border: string
} {
  switch (severity) {
    case 'mild':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
      }
    case 'moderate':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
      }
    case 'severe':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700',
      }
  }
}

/**
 * Gets label for IHS4 severity
 */
export function getIHS4SeverityLabel(severity: IHS4Severity): string {
  switch (severity) {
    case 'mild':
      return 'Mild'
    case 'moderate':
      return 'Moderate'
    case 'severe':
      return 'Severe'
  }
}

/**
 * Validates that lesion counts produce expected IHS4 score
 * Useful for testing and data integrity checks
 */
export function validateIHS4Score(
  nodules: number,
  abscesses: number,
  drainingTunnels: number,
  expectedScore: number
): boolean {
  const calculatedScore =
    nodules * IHS4_WEIGHTS.nodule +
    abscesses * IHS4_WEIGHTS.abscess +
    drainingTunnels * IHS4_WEIGHTS.draining_tunnel

  return calculatedScore === expectedScore
}

/**
 * Creates an empty IHS4 result
 */
export function createEmptyIHS4Result(): IHS4Result {
  return {
    score: 0,
    severity: 'mild',
    breakdown: {
      nodules: 0,
      abscesses: 0,
      drainingTunnels: 0,
    },
    lesionIds: [],
  }
}
