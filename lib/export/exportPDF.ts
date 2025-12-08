'use client'

import { db } from '@/lib/db'
import {
  Symptom,
  SymptomInstance,
  Medication,
  MedicationEvent,
  Flare,
  FlareEvent,
  DailyEntry,
  Food,
  FoodEvent
} from '@/lib/db'
import { sanitizeHTML } from '@/lib/utils'

export type PDFReportType = 'medical' | 'flare-summary' | 'correlation'

export interface DateRange {
  start: Date
  end: Date
}

export interface MedicalReportData {
  generatedAt: string
  dateRange: { start: string; end: string }
  summary: {
    totalDays: number
    entriesLogged: number
    averageHealthScore: number
    averageEnergyLevel: number
    averageSleepQuality: number
    averageStressLevel: number
  }
  symptoms: {
    symptom: Symptom
    occurrences: number
    averageSeverity: number
    mostAffectedRegions: string[]
  }[]
  medications: {
    medication: Medication
    totalDoses: number
    takenCount: number
    skippedCount: number
    adherenceRate: number
  }[]
  flares: {
    total: number
    active: number
    resolved: number
    averageDuration: number
    mostAffectedRegions: { region: string; count: number }[]
  }
  dailyTrends: {
    date: string
    healthScore: number
    energyLevel: number
    symptomCount: number
  }[]
}

export interface FlareSummaryData {
  generatedAt: string
  dateRange: { start: string; end: string }
  flares: {
    flare: Flare
    events: FlareEvent[]
    duration: number | null
    peakSeverity: number
    interventions: string[]
  }[]
  statistics: {
    totalFlares: number
    averageDuration: number
    mostCommonLocations: { region: string; count: number }[]
    mostEffectiveInterventions: { intervention: string; successRate: number }[]
  }
}

export interface CorrelationReportData {
  generatedAt: string
  dateRange: { start: string; end: string }
  foodCorrelations: {
    food: Food
    symptomCorrelations: {
      symptom: Symptom
      correlationScore: number
      confidence: 'high' | 'medium' | 'low'
    }[]
  }[]
  triggerCorrelations: {
    triggerName: string
    symptomImpact: {
      symptom: Symptom
      impactScore: number
    }[]
  }[]
  recommendations: string[]
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatDateShort(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Gather medical report data
export async function gatherMedicalReportData(dateRange: DateRange): Promise<MedicalReportData> {
  const startTs = dateRange.start.getTime()
  const endTs = dateRange.end.getTime()

  // Fetch all relevant data
  const [
    symptoms,
    symptomInstances,
    medications,
    medicationEvents,
    flares,
    flareEvents,
    dailyEntries
  ] = await Promise.all([
    db.symptoms.toArray(),
    db.symptomInstances.where('timestamp').between(startTs, endTs).toArray(),
    db.medications.toArray(),
    db.medicationEvents.where('timestamp').between(startTs, endTs).toArray(),
    db.flares.where('startDate').between(startTs, endTs).toArray(),
    db.flareEvents.where('timestamp').between(startTs, endTs).toArray(),
    db.dailyEntries.toArray()
  ])

  // Filter daily entries by date range
  const filteredEntries = dailyEntries.filter(entry => {
    const entryDate = new Date(entry.date).getTime()
    return entryDate >= startTs && entryDate <= endTs
  })

  // Calculate summary statistics
  const totalDays = Math.ceil((endTs - startTs) / (1000 * 60 * 60 * 24))
  const entriesLogged = filteredEntries.length

  const avgHealth = filteredEntries.length > 0
    ? filteredEntries.reduce((sum, e) => sum + e.overallHealthScore, 0) / filteredEntries.length
    : 0
  const avgEnergy = filteredEntries.length > 0
    ? filteredEntries.reduce((sum, e) => sum + e.energyLevel, 0) / filteredEntries.length
    : 0
  const avgSleep = filteredEntries.length > 0
    ? filteredEntries.reduce((sum, e) => sum + e.sleepQuality, 0) / filteredEntries.length
    : 0
  const avgStress = filteredEntries.length > 0
    ? filteredEntries.reduce((sum, e) => sum + e.stressLevel, 0) / filteredEntries.length
    : 0

  // Process symptom data
  const symptomStats = symptoms.map(symptom => {
    const instances = symptomInstances.filter(i => i.symptomId === symptom.guid)
    const regionCounts: Record<string, number> = {}

    instances.forEach(i => {
      if (i.bodyRegion) {
        regionCounts[i.bodyRegion] = (regionCounts[i.bodyRegion] || 0) + 1
      }
    })

    const sortedRegions = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([region]) => region)

    return {
      symptom,
      occurrences: instances.length,
      averageSeverity: instances.length > 0
        ? instances.reduce((sum, i) => sum + i.severity, 0) / instances.length
        : 0,
      mostAffectedRegions: sortedRegions
    }
  }).filter(s => s.occurrences > 0)
    .sort((a, b) => b.occurrences - a.occurrences)

  // Process medication data
  const medicationStats = medications.map(medication => {
    const events = medicationEvents.filter(e => e.medicationId === medication.guid)
    const takenCount = events.filter(e => e.taken).length
    const skippedCount = events.filter(e => !e.taken).length

    return {
      medication,
      totalDoses: events.length,
      takenCount,
      skippedCount,
      adherenceRate: events.length > 0 ? (takenCount / events.length) * 100 : 0
    }
  }).filter(m => m.totalDoses > 0)

  // Process flare data
  const activeFlares = flares.filter(f => f.status !== 'resolved').length
  const resolvedFlares = flares.filter(f => f.status === 'resolved')

  const durations = resolvedFlares
    .filter(f => f.endDate)
    .map(f => (f.endDate! - f.startDate) / (1000 * 60 * 60 * 24))

  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0

  const regionCounts: Record<string, number> = {}
  flares.forEach(f => {
    regionCounts[f.bodyRegion] = (regionCounts[f.bodyRegion] || 0) + 1
  })

  const mostAffectedRegions = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([region, count]) => ({ region, count }))

  // Daily trends
  const dailyTrends = filteredEntries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30)
    .map(entry => {
      const entryDate = new Date(entry.date)
      const dayStart = entryDate.getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      const daySymptoms = symptomInstances.filter(
        i => i.timestamp >= dayStart && i.timestamp < dayEnd
      )

      return {
        date: entry.date,
        healthScore: entry.overallHealthScore,
        energyLevel: entry.energyLevel,
        symptomCount: daySymptoms.length
      }
    })

  return {
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: formatDate(dateRange.start),
      end: formatDate(dateRange.end)
    },
    summary: {
      totalDays,
      entriesLogged,
      averageHealthScore: Math.round(avgHealth * 10) / 10,
      averageEnergyLevel: Math.round(avgEnergy * 10) / 10,
      averageSleepQuality: Math.round(avgSleep * 10) / 10,
      averageStressLevel: Math.round(avgStress * 10) / 10
    },
    symptoms: symptomStats,
    medications: medicationStats,
    flares: {
      total: flares.length,
      active: activeFlares,
      resolved: resolvedFlares.length,
      averageDuration: Math.round(avgDuration * 10) / 10,
      mostAffectedRegions
    },
    dailyTrends
  }
}

// Gather flare summary data
export async function gatherFlareSummaryData(dateRange: DateRange): Promise<FlareSummaryData> {
  const startTs = dateRange.start.getTime()
  const endTs = dateRange.end.getTime()

  const [flares, flareEvents] = await Promise.all([
    db.flares.where('startDate').between(startTs, endTs).toArray(),
    db.flareEvents.where('timestamp').between(startTs, endTs).toArray()
  ])

  // Process each flare
  const flareDetails = flares.map(flare => {
    const events = flareEvents.filter(e => e.flareId === flare.guid)
    const duration = flare.endDate
      ? (flare.endDate - flare.startDate) / (1000 * 60 * 60 * 24)
      : null

    const severities = events.filter(e => e.severity).map(e => e.severity!)
    const peakSeverity = severities.length > 0 ? Math.max(...severities) : flare.initialSeverity

    const interventions = events
      .filter(e => e.eventType === 'intervention' && e.interventionType)
      .map(e => e.interventionType!)

    return {
      flare,
      events,
      duration,
      peakSeverity,
      interventions: [...new Set(interventions)]
    }
  })

  // Statistics
  const durations = flareDetails
    .filter(f => f.duration !== null)
    .map(f => f.duration!)

  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0

  // Most common locations
  const locationCounts: Record<string, number> = {}
  flares.forEach(f => {
    locationCounts[f.bodyRegion] = (locationCounts[f.bodyRegion] || 0) + 1
  })

  const mostCommonLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([region, count]) => ({ region, count }))

  // Intervention effectiveness (simplified - based on resolution rate)
  const interventionStats: Record<string, { total: number; resolved: number }> = {}

  flareDetails.forEach(fd => {
    const isResolved = fd.flare.status === 'resolved'
    fd.interventions.forEach(intervention => {
      if (!interventionStats[intervention]) {
        interventionStats[intervention] = { total: 0, resolved: 0 }
      }
      interventionStats[intervention].total++
      if (isResolved) {
        interventionStats[intervention].resolved++
      }
    })
  })

  const mostEffectiveInterventions = Object.entries(interventionStats)
    .map(([intervention, stats]) => ({
      intervention,
      successRate: stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0
    }))
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5)

  return {
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: formatDate(dateRange.start),
      end: formatDate(dateRange.end)
    },
    flares: flareDetails,
    statistics: {
      totalFlares: flares.length,
      averageDuration: Math.round(avgDuration * 10) / 10,
      mostCommonLocations,
      mostEffectiveInterventions
    }
  }
}

// Gather correlation report data
export async function gatherCorrelationReportData(dateRange: DateRange): Promise<CorrelationReportData> {
  const startTs = dateRange.start.getTime()
  const endTs = dateRange.end.getTime()

  const [
    foods,
    foodEvents,
    symptoms,
    symptomInstances,
    triggers,
    triggerEvents,
    correlations
  ] = await Promise.all([
    db.foods.toArray(),
    db.foodEvents.where('timestamp').between(startTs, endTs).toArray(),
    db.symptoms.toArray(),
    db.symptomInstances.where('timestamp').between(startTs, endTs).toArray(),
    db.triggers.toArray(),
    db.triggerEvents.where('timestamp').between(startTs, endTs).toArray(),
    db.foodCombinationCorrelations.toArray()
  ])

  // Process food correlations
  const foodCorrelations = foods
    .map(food => {
      // Find correlations involving this food
      const relevantCorrelations = correlations.filter(c => c.foodIds.includes(food.guid))

      const symptomCorrelations = relevantCorrelations
        .map(c => {
          const symptom = symptoms.find(s => s.guid === c.symptomId)
          if (!symptom) return null

          return {
            symptom,
            correlationScore: Math.round(c.correlationScore * 100) / 100,
            confidence: c.confidenceLevel
          }
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .sort((a, b) => b.correlationScore - a.correlationScore)

      return {
        food,
        symptomCorrelations
      }
    })
    .filter(fc => fc.symptomCorrelations.length > 0)
    .sort((a, b) =>
      (b.symptomCorrelations[0]?.correlationScore || 0) -
      (a.symptomCorrelations[0]?.correlationScore || 0)
    )
    .slice(0, 10)

  // Process trigger correlations (simplified - based on temporal proximity)
  const triggerCorrelations = triggers.map(trigger => {
    const triggerOccurrences = triggerEvents.filter(e => e.triggerId === trigger.guid)

    // For each symptom, check if it occurred within 24 hours after trigger
    const symptomImpact = symptoms.map(symptom => {
      let correlatedCount = 0

      triggerOccurrences.forEach(te => {
        const hasSymptomAfter = symptomInstances.some(
          si => si.symptomId === symptom.guid &&
            si.timestamp > te.timestamp &&
            si.timestamp < te.timestamp + 24 * 60 * 60 * 1000
        )
        if (hasSymptomAfter) correlatedCount++
      })

      const impactScore = triggerOccurrences.length > 0
        ? correlatedCount / triggerOccurrences.length
        : 0

      return { symptom, impactScore }
    })
      .filter(si => si.impactScore > 0.3)
      .sort((a, b) => b.impactScore - a.impactScore)

    return {
      triggerName: trigger.name,
      symptomImpact
    }
  }).filter(tc => tc.symptomImpact.length > 0)

  // Generate recommendations based on data
  const recommendations: string[] = []

  // Food recommendations
  const highCorrelationFoods = foodCorrelations
    .filter(fc => fc.symptomCorrelations.some(sc => sc.correlationScore > 0.5))

  if (highCorrelationFoods.length > 0) {
    recommendations.push(
      `Consider reducing consumption of: ${highCorrelationFoods.map(f => f.food.name).join(', ')}`
    )
  }

  // Trigger recommendations
  const highImpactTriggers = triggerCorrelations
    .filter(tc => tc.symptomImpact.some(si => si.impactScore > 0.5))

  if (highImpactTriggers.length > 0) {
    recommendations.push(
      `Monitor exposure to: ${highImpactTriggers.map(t => t.triggerName).join(', ')}`
    )
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue tracking to identify patterns')
    recommendations.push('Maintain consistent logging for better correlation analysis')
  }

  return {
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: formatDate(dateRange.start),
      end: formatDate(dateRange.end)
    },
    foodCorrelations,
    triggerCorrelations,
    recommendations
  }
}

// Generate HTML for medical report
export function generateMedicalReportHTML(data: MedicalReportData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Medical Report - ${data.dateRange.start} to ${data.dateRange.end}</title>
  <style>
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .date-range { color: #6b7280; font-size: 14px; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .summary-card { background: #f9fafb; padding: 15px; border-radius: 8px; }
    .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; }
    .summary-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
    .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #22c55e; }
    .severity-low { color: #22c55e; }
    .severity-medium { color: #f59e0b; }
    .severity-high { color: #ef4444; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .chart-placeholder { background: #f3f4f6; height: 200px; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Health Summary Report</h1>
    <div class="date-range">${data.dateRange.start} - ${data.dateRange.end}</div>
    <div class="date-range">Generated: ${new Date(data.generatedAt).toLocaleDateString()}</div>
  </div>

  <h2>Overview</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.summary.entriesLogged}</div>
      <div class="summary-label">Days Logged (of ${data.summary.totalDays})</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.averageHealthScore}/10</div>
      <div class="summary-label">Average Health Score</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.averageEnergyLevel}/10</div>
      <div class="summary-label">Average Energy</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.averageSleepQuality}/10</div>
      <div class="summary-label">Average Sleep Quality</div>
    </div>
  </div>

  <h2>Symptoms</h2>
  ${data.symptoms.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Symptom</th>
        <th>Occurrences</th>
        <th>Avg Severity</th>
        <th>Common Locations</th>
      </tr>
    </thead>
    <tbody>
      ${data.symptoms.map(s => `
        <tr>
          <td>${sanitizeHTML(s.symptom.name)}</td>
          <td>${s.occurrences}</td>
          <td class="${s.averageSeverity <= 3 ? 'severity-low' : s.averageSeverity <= 6 ? 'severity-medium' : 'severity-high'}">
            ${s.averageSeverity.toFixed(1)}/10
          </td>
          <td>${s.mostAffectedRegions.map(r => sanitizeHTML(r)).join(', ') || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>No symptoms recorded in this period.</p>'}

  <h2>Medications</h2>
  ${data.medications.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Medication</th>
        <th>Total Doses</th>
        <th>Taken</th>
        <th>Adherence</th>
      </tr>
    </thead>
    <tbody>
      ${data.medications.map(m => `
        <tr>
          <td>${sanitizeHTML(m.medication.name)} (${sanitizeHTML(m.medication.dosage || '')})</td>
          <td>${m.totalDoses}</td>
          <td>${m.takenCount}</td>
          <td>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${m.adherenceRate}%"></div>
            </div>
            ${m.adherenceRate.toFixed(0)}%
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>No medication events recorded in this period.</p>'}

  <div class="page-break"></div>

  <h2>Flare Activity</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.flares.total}</div>
      <div class="summary-label">Total Flares</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.flares.active}</div>
      <div class="summary-label">Currently Active</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.flares.resolved}</div>
      <div class="summary-label">Resolved</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.flares.averageDuration} days</div>
      <div class="summary-label">Avg Duration</div>
    </div>
  </div>

  ${data.flares.mostAffectedRegions.length > 0 ? `
  <h3>Most Affected Areas</h3>
  <table>
    <thead>
      <tr>
        <th>Body Region</th>
        <th>Flare Count</th>
      </tr>
    </thead>
    <tbody>
      ${data.flares.mostAffectedRegions.map(r => `
        <tr>
          <td>${sanitizeHTML(r.region)}</td>
          <td>${r.count}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <h2>Daily Trends (Last 30 Days)</h2>
  ${data.dailyTrends.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Health</th>
        <th>Energy</th>
        <th>Symptoms</th>
      </tr>
    </thead>
    <tbody>
      ${data.dailyTrends.slice(-15).map(d => `
        <tr>
          <td>${d.date}</td>
          <td>${d.healthScore}/10</td>
          <td>${d.energyLevel}/10</td>
          <td>${d.symptomCount}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>No daily entries in this period.</p>'}

  <div class="footer">
    <p>This report was generated by Pocket Symptom Tracker</p>
    <p>All data is stored locally on your device</p>
  </div>
</body>
</html>
`
}

// Generate HTML for flare summary
export function generateFlareSummaryHTML(data: FlareSummaryData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Flare Summary Report - ${data.dateRange.start} to ${data.dateRange.end}</title>
  <style>
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 { color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .date-range { color: #6b7280; font-size: 14px; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .summary-card { background: #f9fafb; padding: 15px; border-radius: 8px; }
    .summary-value { font-size: 24px; font-weight: bold; color: #dc2626; }
    .summary-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .flare-card { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .flare-header { display: flex; justify-content: space-between; align-items: center; }
    .flare-status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .status-active { background: #fee2e2; color: #dc2626; }
    .status-resolved { background: #dcfce7; color: #16a34a; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
    .intervention-tag { display: inline-block; padding: 2px 8px; background: #e0e7ff; color: #3730a3; border-radius: 4px; font-size: 12px; margin: 2px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Flare Summary Report</h1>
    <div class="date-range">${data.dateRange.start} - ${data.dateRange.end}</div>
    <div class="date-range">Generated: ${new Date(data.generatedAt).toLocaleDateString()}</div>
  </div>

  <h2>Statistics</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.statistics.totalFlares}</div>
      <div class="summary-label">Total Flares</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.statistics.averageDuration} days</div>
      <div class="summary-label">Average Duration</div>
    </div>
  </div>

  <h3>Most Common Locations</h3>
  ${data.statistics.mostCommonLocations.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Location</th>
        <th>Count</th>
      </tr>
    </thead>
    <tbody>
      ${data.statistics.mostCommonLocations.map(l => `
        <tr>
          <td>${sanitizeHTML(l.region)}</td>
          <td>${l.count}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>No location data available.</p>'}

  <h3>Intervention Effectiveness</h3>
  ${data.statistics.mostEffectiveInterventions.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Intervention</th>
        <th>Success Rate</th>
      </tr>
    </thead>
    <tbody>
      ${data.statistics.mostEffectiveInterventions.map(i => `
        <tr>
          <td style="text-transform: capitalize">${sanitizeHTML(i.intervention)}</td>
          <td>${i.successRate.toFixed(0)}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>No intervention data available.</p>'}

  <div class="page-break"></div>

  <h2>Individual Flares</h2>
  ${data.flares.length > 0 ? data.flares.map((f, index) => `
    <div class="flare-card">
      <div class="flare-header">
        <strong>Flare #${index + 1} - ${sanitizeHTML(f.flare.bodyRegion)}</strong>
        <span class="flare-status ${f.flare.status === 'resolved' ? 'status-resolved' : 'status-active'}">
          ${f.flare.status.toUpperCase()}
        </span>
      </div>
      <p>
        <strong>Started:</strong> ${new Date(f.flare.startDate).toLocaleDateString()}<br>
        ${f.flare.endDate ? `<strong>Ended:</strong> ${new Date(f.flare.endDate).toLocaleDateString()}<br>` : ''}
        <strong>Duration:</strong> ${f.duration !== null ? `${f.duration.toFixed(1)} days` : 'Ongoing'}<br>
        <strong>Peak Severity:</strong> ${f.peakSeverity}/10
      </p>
      ${f.interventions.length > 0 ? `
        <p><strong>Interventions:</strong><br>
          ${f.interventions.map(i => `<span class="intervention-tag">${sanitizeHTML(i)}</span>`).join(' ')}
        </p>
      ` : ''}
    </div>
  `).join('') : '<p>No flares recorded in this period.</p>'}

  <div class="footer">
    <p>This report was generated by Pocket Symptom Tracker</p>
    <p>All data is stored locally on your device</p>
  </div>
</body>
</html>
`
}

// Generate HTML for correlation report
export function generateCorrelationReportHTML(data: CorrelationReportData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Correlation Analysis - ${data.dateRange.start} to ${data.dateRange.end}</title>
  <style>
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .date-range { color: #6b7280; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
    .correlation-high { color: #dc2626; font-weight: bold; }
    .correlation-medium { color: #f59e0b; }
    .correlation-low { color: #22c55e; }
    .confidence-high { background: #dcfce7; color: #166534; }
    .confidence-medium { background: #fef3c7; color: #92400e; }
    .confidence-low { background: #fee2e2; color: #991b1b; }
    .confidence-tag { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .recommendation-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .recommendation-item { padding: 8px 0; border-bottom: 1px solid #d1fae5; }
    .recommendation-item:last-child { border-bottom: none; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .correlation-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; width: 100px; display: inline-block; margin-right: 8px; }
    .correlation-fill { height: 100%; }
    .fill-high { background: #dc2626; }
    .fill-medium { background: #f59e0b; }
    .fill-low { background: #22c55e; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Correlation Analysis Report</h1>
    <div class="date-range">${data.dateRange.start} - ${data.dateRange.end}</div>
    <div class="date-range">Generated: ${new Date(data.generatedAt).toLocaleDateString()}</div>
  </div>

  <h2>Food-Symptom Correlations</h2>
  ${data.foodCorrelations.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Food</th>
        <th>Related Symptom</th>
        <th>Correlation</th>
        <th>Confidence</th>
      </tr>
    </thead>
    <tbody>
      ${data.foodCorrelations.flatMap(fc =>
        fc.symptomCorrelations.slice(0, 3).map((sc, i) => `
          <tr>
            ${i === 0 ? `<td rowspan="${Math.min(fc.symptomCorrelations.length, 3)}">${sanitizeHTML(fc.food.name)}</td>` : ''}
            <td>${sanitizeHTML(sc.symptom.name)}</td>
            <td>
              <div class="correlation-bar">
                <div class="correlation-fill ${sc.correlationScore > 0.6 ? 'fill-high' : sc.correlationScore > 0.3 ? 'fill-medium' : 'fill-low'}"
                     style="width: ${sc.correlationScore * 100}%"></div>
              </div>
              <span class="${sc.correlationScore > 0.6 ? 'correlation-high' : sc.correlationScore > 0.3 ? 'correlation-medium' : 'correlation-low'}">
                ${(sc.correlationScore * 100).toFixed(0)}%
              </span>
            </td>
            <td><span class="confidence-tag confidence-${sc.confidence}">${sc.confidence}</span></td>
          </tr>
        `)
      ).join('')}
    </tbody>
  </table>
  ` : '<p>Not enough data for food-symptom correlation analysis. Continue logging meals and symptoms for insights.</p>'}

  <div class="page-break"></div>

  <h2>Trigger-Symptom Analysis</h2>
  ${data.triggerCorrelations.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Trigger</th>
        <th>Related Symptom</th>
        <th>Impact Score</th>
      </tr>
    </thead>
    <tbody>
      ${data.triggerCorrelations.flatMap(tc =>
        tc.symptomImpact.slice(0, 3).map((si, i) => `
          <tr>
            ${i === 0 ? `<td rowspan="${Math.min(tc.symptomImpact.length, 3)}">${sanitizeHTML(tc.triggerName)}</td>` : ''}
            <td>${sanitizeHTML(si.symptom.name)}</td>
            <td>
              <div class="correlation-bar">
                <div class="correlation-fill ${si.impactScore > 0.6 ? 'fill-high' : si.impactScore > 0.4 ? 'fill-medium' : 'fill-low'}"
                     style="width: ${si.impactScore * 100}%"></div>
              </div>
              ${(si.impactScore * 100).toFixed(0)}%
            </td>
          </tr>
        `)
      ).join('')}
    </tbody>
  </table>
  ` : '<p>Not enough data for trigger-symptom analysis. Continue logging triggers and symptoms for insights.</p>'}

  <h2>Recommendations</h2>
  <div class="recommendation-box">
    ${data.recommendations.map(r => `
      <div class="recommendation-item">${sanitizeHTML(r)}</div>
    `).join('')}
  </div>

  <div class="footer">
    <p>This report was generated by Pocket Symptom Tracker</p>
    <p>Correlations are based on temporal patterns and should be discussed with a healthcare provider</p>
  </div>
</body>
</html>
`
}

// Open print dialog with generated HTML
export function openPrintDialog(html: string, title: string): void {
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    alert('Please allow popups to generate PDF reports')
    return
  }

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.document.title = title

  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

// Main export function
export async function generatePDFReport(
  reportType: PDFReportType,
  dateRange: DateRange
): Promise<void> {
  let html: string
  let title: string

  switch (reportType) {
    case 'medical':
      const medicalData = await gatherMedicalReportData(dateRange)
      html = generateMedicalReportHTML(medicalData)
      title = 'Medical Report'
      break

    case 'flare-summary':
      const flareData = await gatherFlareSummaryData(dateRange)
      html = generateFlareSummaryHTML(flareData)
      title = 'Flare Summary'
      break

    case 'correlation':
      const correlationData = await gatherCorrelationReportData(dateRange)
      html = generateCorrelationReportHTML(correlationData)
      title = 'Correlation Analysis'
      break

    default:
      throw new Error(`Unknown report type: ${reportType}`)
  }

  openPrintDialog(html, title)
}
