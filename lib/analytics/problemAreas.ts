import { db, Flare, SymptomInstance } from '../db'

export interface ProblemAreaStats {
  region: string
  flareCount: number
  symptomCount: number
  totalEvents: number
  avgSeverity: number
  avgDuration: number // in hours
  recentFlares: number // flares in last 30 days
  heatLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface ProblemAreasReport {
  areas: ProblemAreaStats[]
  totalFlares: number
  totalSymptoms: number
  dateRange: { start: number; end: number }
}

function getHeatLevel(count: number, avgSeverity: number): 'low' | 'medium' | 'high' | 'critical' {
  const score = count * avgSeverity
  if (score >= 50) return 'critical'
  if (score >= 20) return 'high'
  if (score >= 10) return 'medium'
  return 'low'
}

export async function calculateProblemAreas(options?: {
  startDate?: number
  endDate?: number
}): Promise<ProblemAreasReport> {
  const endDate = options?.endDate || Date.now()
  const startDate = options?.startDate || endDate - 90 * 24 * 60 * 60 * 1000 // 90 days default
  const thirtyDaysAgo = endDate - 30 * 24 * 60 * 60 * 1000

  // Get all flares in date range
  const flares = await db.flares
    .filter((f) => f.startDate >= startDate && f.startDate <= endDate)
    .toArray()

  // Get all symptom instances with body regions
  const symptoms = await db.symptomInstances
    .filter(
      (s) => s.timestamp >= startDate && s.timestamp <= endDate && s.bodyRegion !== undefined
    )
    .toArray()

  // Group by body region
  const regionMap = new Map<
    string,
    {
      flares: Flare[]
      symptoms: SymptomInstance[]
    }
  >()

  for (const flare of flares) {
    const region = flare.bodyRegion
    if (!regionMap.has(region)) {
      regionMap.set(region, { flares: [], symptoms: [] })
    }
    regionMap.get(region)!.flares.push(flare)
  }

  for (const symptom of symptoms) {
    const region = symptom.bodyRegion!
    if (!regionMap.has(region)) {
      regionMap.set(region, { flares: [], symptoms: [] })
    }
    regionMap.get(region)!.symptoms.push(symptom)
  }

  // Calculate stats for each region
  const areas: ProblemAreaStats[] = []

  for (const [region, data] of regionMap.entries()) {
    const flareCount = data.flares.length
    const symptomCount = data.symptoms.length
    const totalEvents = flareCount + symptomCount

    // Calculate average severity
    const severities: number[] = [
      ...data.flares.map((f) => f.currentSeverity),
      ...data.symptoms.map((s) => s.severity),
    ]
    const avgSeverity =
      severities.length > 0 ? severities.reduce((a, b) => a + b, 0) / severities.length : 0

    // Calculate average flare duration
    const durations = data.flares
      .filter((f) => f.endDate)
      .map((f) => (f.endDate! - f.startDate) / (60 * 60 * 1000)) // hours

    const avgDuration =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

    // Count recent flares
    const recentFlares = data.flares.filter((f) => f.startDate >= thirtyDaysAgo).length

    const heatLevel = getHeatLevel(totalEvents, avgSeverity)

    areas.push({
      region,
      flareCount,
      symptomCount,
      totalEvents,
      avgSeverity,
      avgDuration,
      recentFlares,
      heatLevel,
    })
  }

  // Sort by total events (most problematic first)
  areas.sort((a, b) => b.totalEvents - a.totalEvents)

  return {
    areas,
    totalFlares: flares.length,
    totalSymptoms: symptoms.length,
    dateRange: { start: startDate, end: endDate },
  }
}

export function getHeatColor(level: ProblemAreaStats['heatLevel']): string {
  switch (level) {
    case 'critical':
      return '#dc2626' // red-600
    case 'high':
      return '#ea580c' // orange-600
    case 'medium':
      return '#eab308' // yellow-500
    case 'low':
      return '#22c55e' // green-500
  }
}

export function exportProblemAreasCSV(report: ProblemAreasReport): string {
  const headers = [
    'Body Region',
    'Total Events',
    'Flare Count',
    'Symptom Count',
    'Avg Severity',
    'Avg Duration (hrs)',
    'Recent Flares (30d)',
    'Heat Level',
  ]

  const rows = report.areas.map((area) => [
    area.region,
    area.totalEvents.toString(),
    area.flareCount.toString(),
    area.symptomCount.toString(),
    area.avgSeverity.toFixed(1),
    area.avgDuration.toFixed(1),
    area.recentFlares.toString(),
    area.heatLevel,
  ])

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}
