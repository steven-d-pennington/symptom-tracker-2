'use client'

import { db, Flare, SymptomInstance, TriggerEvent, Symptom, Trigger, Food } from '@/lib/db'
import { runCorrelationAnalysis, CorrelationResult } from '@/lib/correlationAnalysis'

export interface AnalyticsSummary {
  activeFlares: number
  totalSymptomsThisMonth: number
  totalTriggersThisMonth: number
  totalMealsThisMonth: number
  averageHealthScore: number | null
  topTriggers: { trigger: Trigger; count: number }[]
  recentCorrelations: CorrelationResult[]
  problemAreas: { region: string; count: number; avgSeverity: number }[]
  streakDays: number
}

export type DateRangeOption = '7d' | '30d' | '90d' | 'all'

function getDateRangeStart(option: DateRangeOption): number {
  const now = Date.now()
  switch (option) {
    case '7d':
      return now - 7 * 24 * 60 * 60 * 1000
    case '30d':
      return now - 30 * 24 * 60 * 60 * 1000
    case '90d':
      return now - 90 * 24 * 60 * 60 * 1000
    case 'all':
      return 0
  }
}

export async function getAnalyticsSummary(dateRange: DateRangeOption = '30d'): Promise<AnalyticsSummary> {
  const rangeStart = getDateRangeStart(dateRange)
  const monthStart = Date.now() - 30 * 24 * 60 * 60 * 1000

  // Get active flares count
  const activeFlares = await db.flares
    .where('status')
    .anyOf(['active', 'improving', 'worsening'])
    .count()

  // Get symptoms logged this month
  const symptomsThisMonth = await db.symptomInstances
    .where('timestamp')
    .above(monthStart)
    .count()

  // Get triggers logged this month
  const triggersThisMonth = await db.triggerEvents
    .where('timestamp')
    .above(monthStart)
    .count()

  // Get meals this month
  const mealsThisMonth = await db.foodEvents
    .where('timestamp')
    .above(monthStart)
    .count()

  // Calculate average health score
  const dailyEntries = await db.dailyEntries.toArray()
  const recentEntries = dailyEntries.filter(e => {
    const entryDate = new Date(e.date + 'T12:00:00').getTime()
    return entryDate >= rangeStart
  })

  const averageHealthScore = recentEntries.length > 0
    ? recentEntries.reduce((sum, e) => sum + e.overallHealthScore, 0) / recentEntries.length
    : null

  // Get top triggers
  const triggerEvents = await db.triggerEvents
    .where('timestamp')
    .above(rangeStart)
    .toArray()

  const triggers = await db.triggers.where('isActive').equals(1).toArray()
  const triggerMap = new Map(triggers.map(t => [t.guid, t]))

  const triggerCounts = new Map<string, number>()
  triggerEvents.forEach(event => {
    const count = triggerCounts.get(event.triggerId) || 0
    triggerCounts.set(event.triggerId, count + 1)
  })

  const topTriggers = Array.from(triggerCounts.entries())
    .map(([triggerId, count]) => ({
      trigger: triggerMap.get(triggerId)!,
      count
    }))
    .filter(t => t.trigger)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Get recent correlations (run analysis)
  let recentCorrelations: CorrelationResult[] = []
  try {
    const allCorrelations = await runCorrelationAnalysis(90)
    recentCorrelations = allCorrelations
      .filter(c => c.confidenceLevel !== 'low')
      .sort((a, b) => Math.abs(b.correlationScore) - Math.abs(a.correlationScore))
      .slice(0, 5)
  } catch (error) {
    console.error('Error running correlation analysis:', error)
  }

  // Get problem areas (body regions with most symptoms)
  const symptomInstances = await db.symptomInstances
    .where('timestamp')
    .above(rangeStart)
    .toArray()

  const regionData = new Map<string, { count: number; totalSeverity: number }>()
  symptomInstances.forEach(instance => {
    if (instance.bodyRegion) {
      const data = regionData.get(instance.bodyRegion) || { count: 0, totalSeverity: 0 }
      data.count++
      data.totalSeverity += instance.severity
      regionData.set(instance.bodyRegion, data)
    }
  })

  const problemAreas = Array.from(regionData.entries())
    .map(([region, data]) => ({
      region,
      count: data.count,
      avgSeverity: data.totalSeverity / data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Calculate streak
  let streakDays = 0
  const today = new Date()
  const sortedEntries = dailyEntries.sort((a, b) => b.date.localeCompare(a.date))

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateKey = checkDate.toISOString().split('T')[0]

    if (sortedEntries.some(e => e.date === dateKey)) {
      streakDays++
    } else {
      break
    }
  }

  return {
    activeFlares,
    totalSymptomsThisMonth: symptomsThisMonth,
    totalTriggersThisMonth: triggersThisMonth,
    totalMealsThisMonth: mealsThisMonth,
    averageHealthScore,
    topTriggers,
    recentCorrelations,
    problemAreas,
    streakDays
  }
}

export async function getSymptomNames(ids: string[]): Promise<Map<string, string>> {
  const symptoms = await db.symptoms.where('guid').anyOf(ids).toArray()
  return new Map(symptoms.map(s => [s.guid, s.name]))
}

export async function getFoodNames(ids: string[]): Promise<Map<string, string>> {
  const foods = await db.foods.where('guid').anyOf(ids).toArray()
  return new Map(foods.map(f => [f.guid, f.name]))
}

export async function getTriggerNames(ids: string[]): Promise<Map<string, string>> {
  const triggers = await db.triggers.where('guid').anyOf(ids).toArray()
  return new Map(triggers.map(t => [t.guid, t.name]))
}
