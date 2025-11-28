/**
 * IHS4 Trend Data Helpers
 *
 * Functions for calculating and formatting IHS4 trend data for charts
 */

import { DailyHSEntry, IHS4Result, IHS4Severity } from './types'
import { getIHS4Severity } from './ihs4'

export interface TrendDataPoint {
  date: string
  score: number
  severity: IHS4Severity
  breakdown: {
    nodules: number
    abscesses: number
    drainingTunnels: number
  }
  isFlareDay: boolean
}

export interface TrendSummary {
  dataPoints: TrendDataPoint[]
  averageScore: number
  minScore: number
  maxScore: number
  flareDays: number
  trend: 'improving' | 'stable' | 'worsening'
  percentChange: number | null
}

/**
 * Converts DailyHSEntry array to TrendDataPoint array
 */
export function entriesToTrendData(entries: DailyHSEntry[]): TrendDataPoint[] {
  return entries
    .filter((entry) => entry.ihs4)
    .map((entry) => ({
      date: entry.date,
      score: entry.ihs4.score,
      severity: entry.ihs4.severity,
      breakdown: entry.ihs4.breakdown,
      isFlareDay: entry.flare?.isFlareDay ?? false,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Filters trend data by date range
 */
export function filterTrendDataByRange(
  data: TrendDataPoint[],
  startDate: string,
  endDate: string
): TrendDataPoint[] {
  return data.filter((point) => point.date >= startDate && point.date <= endDate)
}

/**
 * Gets trend data for the last N days
 */
export function getTrendDataForLastDays(
  data: TrendDataPoint[],
  days: number
): TrendDataPoint[] {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const start = startDate.toISOString().split('T')[0]
  const end = endDate.toISOString().split('T')[0]

  return filterTrendDataByRange(data, start, end)
}

/**
 * Calculates trend summary statistics
 */
export function calculateTrendSummary(data: TrendDataPoint[]): TrendSummary {
  if (data.length === 0) {
    return {
      dataPoints: [],
      averageScore: 0,
      minScore: 0,
      maxScore: 0,
      flareDays: 0,
      trend: 'stable',
      percentChange: null,
    }
  }

  const scores = data.map((d) => d.score)
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  const flareDays = data.filter((d) => d.isFlareDay).length

  // Calculate trend based on first vs last third of data
  let trend: 'improving' | 'stable' | 'worsening' = 'stable'
  let percentChange: number | null = null

  if (data.length >= 3) {
    const thirdLength = Math.ceil(data.length / 3)
    const firstThird = data.slice(0, thirdLength)
    const lastThird = data.slice(-thirdLength)

    const firstAvg =
      firstThird.reduce((a, b) => a + b.score, 0) / firstThird.length
    const lastAvg =
      lastThird.reduce((a, b) => a + b.score, 0) / lastThird.length

    const change = lastAvg - firstAvg

    if (firstAvg > 0) {
      percentChange = (change / firstAvg) * 100
    }

    if (change <= -1) {
      trend = 'improving'
    } else if (change >= 1) {
      trend = 'worsening'
    } else {
      trend = 'stable'
    }
  }

  return {
    dataPoints: data,
    averageScore,
    minScore,
    maxScore,
    flareDays,
    trend,
    percentChange,
  }
}

/**
 * Generates date labels for chart X-axis
 */
export function generateDateLabels(
  startDate: string,
  endDate: string,
  maxLabels: number = 7
): string[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )

  const labels: string[] = []
  const step = Math.max(1, Math.floor(diffDays / (maxLabels - 1)))

  for (let i = 0; i <= diffDays; i += step) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    labels.push(date.toISOString().split('T')[0])
  }

  // Always include end date
  if (labels[labels.length - 1] !== endDate) {
    labels.push(endDate)
  }

  return labels
}

/**
 * Formats date for chart display
 */
export function formatChartDate(dateString: string, format: 'short' | 'medium' | 'long' = 'short'): string {
  const date = new Date(dateString)

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'medium':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
      })
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
  }
}

/**
 * Gets severity band thresholds for chart
 */
export function getSeverityBands(): Array<{
  name: string
  minY: number
  maxY: number
  color: string
  darkColor: string
}> {
  return [
    {
      name: 'Mild',
      minY: 0,
      maxY: 3,
      color: 'rgba(34, 197, 94, 0.15)', // green-500/15
      darkColor: 'rgba(34, 197, 94, 0.1)',
    },
    {
      name: 'Moderate',
      minY: 4,
      maxY: 10,
      color: 'rgba(234, 179, 8, 0.15)', // yellow-500/15
      darkColor: 'rgba(234, 179, 8, 0.1)',
    },
    {
      name: 'Severe',
      minY: 11,
      maxY: 20, // Cap for display purposes
      color: 'rgba(239, 68, 68, 0.15)', // red-500/15
      darkColor: 'rgba(239, 68, 68, 0.1)',
    },
  ]
}

/**
 * Gets color for trend direction
 */
export function getTrendColor(trend: 'improving' | 'stable' | 'worsening'): {
  text: string
  bg: string
  icon: string
} {
  switch (trend) {
    case 'improving':
      return {
        text: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
        icon: '↓',
      }
    case 'worsening':
      return {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/30',
        icon: '↑',
      }
    case 'stable':
      return {
        text: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-800',
        icon: '→',
      }
  }
}

/**
 * Date range presets
 */
export type DateRangePreset = '7d' | '30d' | '90d' | 'all' | 'custom'

export interface DateRange {
  start: string
  end: string
  preset: DateRangePreset
}

export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const end = new Date()
  const endStr = end.toISOString().split('T')[0]

  switch (preset) {
    case '7d': {
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return { start: start.toISOString().split('T')[0], end: endStr, preset }
    }
    case '30d': {
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return { start: start.toISOString().split('T')[0], end: endStr, preset }
    }
    case '90d': {
      const start = new Date()
      start.setDate(start.getDate() - 90)
      return { start: start.toISOString().split('T')[0], end: endStr, preset }
    }
    case 'all':
      return { start: '2020-01-01', end: endStr, preset }
    case 'custom':
      // Return last 30 days as default for custom
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return { start: start.toISOString().split('T')[0], end: endStr, preset }
  }
}
