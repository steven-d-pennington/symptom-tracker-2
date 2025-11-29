/**
 * HS Provider Report Generation
 *
 * Aggregates data from various sources to create a comprehensive report
 */

import { db } from '@/lib/db'
import { getRegionById } from '@/lib/bodyMap/regions'
import { calculateCurrentIHS4 } from '../ihs4'
import { getAllRegionHurleyStatuses } from '../hurley'
import { entriesToTrendData, calculateTrendSummary } from '../trends'
import type { HSLesion, DailyHSEntry, LesionType } from '../types'
import type {
  HSProviderReport,
  AffectedRegionSummary,
  SymptomTrendsSummary,
  QualityOfLifeSummary,
  TriggerSummary,
  TreatmentSummary,
} from './types'

export interface GenerateReportOptions {
  startDate: string
  endDate: string
}

/**
 * Generates a comprehensive HS Provider Report
 */
export async function generateHSReport(
  options: GenerateReportOptions
): Promise<HSProviderReport> {
  const { startDate, endDate } = options

  // Fetch all relevant data
  const [allLesions, dailyEntries, hurleyStatuses] = await Promise.all([
    db.hsLesions.toArray(),
    db.dailyHSEntries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray(),
    getAllRegionHurleyStatuses(),
  ])

  // Filter lesions for the period
  const activeLesions = allLesions.filter(
    (l) => l.status === 'active' || l.status === 'healing'
  )
  const healingLesions = allLesions.filter((l) => l.status === 'healing')
  const healedInPeriod = allLesions.filter(
    (l) =>
      l.status === 'healed' &&
      l.healedDate &&
      l.healedDate >= startDate &&
      l.healedDate <= endDate
  )

  // Calculate current IHS4
  const currentIHS4 = calculateCurrentIHS4(activeLesions)

  // Build affected regions summary
  const affectedRegions = buildAffectedRegionsSummary(
    activeLesions,
    hurleyStatuses
  )

  // Build symptom trends
  const symptomTrends = buildSymptomTrendsSummary(dailyEntries)

  // Build quality of life summary
  const qualityOfLife = buildQualityOfLifeSummary(dailyEntries)

  // Build triggers analysis
  const triggers = buildTriggersSummary(dailyEntries)

  // Build treatments summary
  const treatments = buildTreatmentsSummary(dailyEntries)

  return {
    generatedAt: new Date().toISOString(),
    dateRange: { start: startDate, end: endDate },
    currentStatus: {
      ihs4: currentIHS4,
      activeLesionCount: activeLesions.filter((l) => l.status === 'active')
        .length,
      healingLesionCount: healingLesions.length,
      healedInPeriod: healedInPeriod.length,
    },
    affectedRegions,
    symptomTrends,
    qualityOfLife,
    triggers,
    treatments,
  }
}

/**
 * Builds affected regions summary grouped by region
 */
function buildAffectedRegionsSummary(
  lesions: HSLesion[],
  hurleyStatuses: Awaited<ReturnType<typeof getAllRegionHurleyStatuses>>
): AffectedRegionSummary[] {
  // Group lesions by region
  const regionMap = new Map<
    string,
    { nodules: number; abscesses: number; drainingTunnels: number }
  >()

  for (const lesion of lesions) {
    const existing = regionMap.get(lesion.regionId) || {
      nodules: 0,
      abscesses: 0,
      drainingTunnels: 0,
    }

    if (lesion.lesionType === 'nodule') existing.nodules++
    else if (lesion.lesionType === 'abscess') existing.abscesses++
    else if (lesion.lesionType === 'draining_tunnel') existing.drainingTunnels++

    regionMap.set(lesion.regionId, existing)
  }

  // Create Hurley status lookup
  const hurleyMap = new Map(hurleyStatuses.map((s) => [s.regionId, s]))

  // Build summaries
  const summaries: AffectedRegionSummary[] = []

  for (const [regionId, breakdown] of regionMap.entries()) {
    const region = getRegionById(regionId)
    const hurleyStatus = hurleyMap.get(regionId)

    summaries.push({
      regionId,
      regionName: region?.name || regionId.replace(/-/g, ' '),
      hurleyStage: hurleyStatus?.hurleyStage ?? null,
      activeLesions:
        breakdown.nodules + breakdown.abscesses + breakdown.drainingTunnels,
      lesionBreakdown: breakdown,
      lastAssessedDate: hurleyStatus?.lastAssessedDate ?? null,
    })
  }

  // Sort by severity (most lesions first)
  return summaries.sort((a, b) => b.activeLesions - a.activeLesions)
}

/**
 * Builds symptom trends summary from daily entries
 */
function buildSymptomTrendsSummary(
  entries: DailyHSEntry[]
): SymptomTrendsSummary {
  if (entries.length === 0) {
    return {
      averagePain: null,
      worstPainDay: null,
      flareDays: 0,
      totalEntries: 0,
      ihs4Summary: {
        average: 0,
        min: 0,
        max: 0,
        trend: 'stable',
      },
      ihs4History: [],
    }
  }

  // Calculate pain statistics
  const painEntries = entries.filter((e) => e.overallSymptoms?.worstPain != null)
  const averagePain =
    painEntries.length > 0
      ? painEntries.reduce((sum, e) => sum + (e.overallSymptoms?.worstPain || 0), 0) /
        painEntries.length
      : null

  // Find worst pain day
  let worstPainDay: { date: string; pain: number } | null = null
  for (const entry of painEntries) {
    const pain = entry.overallSymptoms?.worstPain || 0
    if (!worstPainDay || pain > worstPainDay.pain) {
      worstPainDay = { date: entry.date, pain }
    }
  }

  // Count flare days
  const flareDays = entries.filter((e) => e.flare?.isFlareDay).length

  // Calculate IHS4 trends
  const trendData = entriesToTrendData(entries)
  const trendSummary = calculateTrendSummary(trendData)

  return {
    averagePain: averagePain !== null ? Math.round(averagePain * 10) / 10 : null,
    worstPainDay,
    flareDays,
    totalEntries: entries.length,
    ihs4Summary: {
      average: Math.round(trendSummary.averageScore * 10) / 10,
      min: trendSummary.minScore,
      max: trendSummary.maxScore,
      trend: trendSummary.trend,
    },
    ihs4History: trendData.map((d) => ({ date: d.date, score: d.score })),
  }
}

/**
 * Builds quality of life summary from daily entries
 */
function buildQualityOfLifeSummary(entries: DailyHSEntry[]): QualityOfLifeSummary {
  const entriesWithQoL = entries.filter((e) => e.qualityOfLife)

  if (entriesWithQoL.length === 0) {
    return {
      daysWithData: 0,
      sleepAffectedDays: 0,
      workMissedDays: 0,
      mobilityLimitedDays: 0,
      socialAffectedDays: 0,
      emotionalImpact: {
        averageAnxiety: 0,
        averageDepression: 0,
        averageFrustration: 0,
      },
    }
  }

  let sleepAffectedDays = 0
  let workMissedDays = 0
  let mobilityLimitedDays = 0
  let socialAffectedDays = 0
  let totalAnxiety = 0
  let totalDepression = 0
  let totalFrustration = 0
  let emotionalCount = 0

  for (const entry of entriesWithQoL) {
    const qol = entry.qualityOfLife!
    const activities = qol.activitiesAffected

    if (activities?.sleep) sleepAffectedDays++
    if (activities?.workOrSchool) workMissedDays++
    if (activities?.mobility) mobilityLimitedDays++
    if (activities?.socialActivities) socialAffectedDays++

    if (qol.emotional) {
      totalAnxiety += qol.emotional.anxiety || 0
      totalDepression += qol.emotional.depression || 0
      totalFrustration += qol.emotional.frustration || 0
      emotionalCount++
    }
  }

  return {
    daysWithData: entriesWithQoL.length,
    sleepAffectedDays,
    workMissedDays,
    mobilityLimitedDays,
    socialAffectedDays,
    emotionalImpact: {
      averageAnxiety:
        emotionalCount > 0
          ? Math.round((totalAnxiety / emotionalCount) * 10) / 10
          : 0,
      averageDepression:
        emotionalCount > 0
          ? Math.round((totalDepression / emotionalCount) * 10) / 10
          : 0,
      averageFrustration:
        emotionalCount > 0
          ? Math.round((totalFrustration / emotionalCount) * 10) / 10
          : 0,
    },
  }
}

/**
 * Builds triggers analysis from daily entries
 */
function buildTriggersSummary(entries: DailyHSEntry[]): TriggerSummary[] {
  const entriesWithTriggers = entries.filter((e) => e.triggers)
  if (entriesWithTriggers.length === 0) return []

  const triggerCounts: Record<string, number> = {}

  for (const entry of entriesWithTriggers) {
    const triggers = entry.triggers!

    if (triggers.menstruation) {
      triggerCounts['Menstruation'] = (triggerCounts['Menstruation'] || 0) + 1
    }
    if (triggers.stress && triggers.stress !== 'none') {
      triggerCounts['Stress'] = (triggerCounts['Stress'] || 0) + 1
    }
    if (triggers.poorSleep) {
      triggerCounts['Poor Sleep'] = (triggerCounts['Poor Sleep'] || 0) + 1
    }
    if (triggers.heatExposure) {
      triggerCounts['Heat Exposure'] = (triggerCounts['Heat Exposure'] || 0) + 1
    }
    if (triggers.friction) {
      triggerCounts['Friction/Tight Clothing'] =
        (triggerCounts['Friction/Tight Clothing'] || 0) + 1
    }
    if (triggers.shaving) {
      triggerCounts['Shaving'] = (triggerCounts['Shaving'] || 0) + 1
    }
    if (triggers.illness) {
      triggerCounts['Illness'] = (triggerCounts['Illness'] || 0) + 1
    }
    if (triggers.dietaryFactors && triggers.dietaryFactors.length > 0) {
      for (const factor of triggers.dietaryFactors) {
        const key = `Diet: ${factor}`
        triggerCounts[key] = (triggerCounts[key] || 0) + 1
      }
    }
  }

  // Convert to array and calculate percentages
  const totalEntries = entriesWithTriggers.length

  return Object.entries(triggerCounts)
    .map(([trigger, occurrences]) => ({
      trigger,
      occurrences,
      percentOfEntries: Math.round((occurrences / totalEntries) * 100),
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
}

/**
 * Builds treatments summary from daily entries
 */
function buildTreatmentsSummary(entries: DailyHSEntry[]): TreatmentSummary[] {
  const entriesWithTreatments = entries.filter((e) => e.treatments)
  if (entriesWithTreatments.length === 0) return []

  const treatmentData: Record<
    string,
    { count: number; category: TreatmentSummary['category']; dates: string[] }
  > = {}

  for (const entry of entriesWithTreatments) {
    const treatments = entry.treatments!

    if (treatments.warmCompress) {
      addTreatment(treatmentData, 'Warm Compress', 'other', entry.date)
    }
    if (treatments.coolCompress) {
      addTreatment(treatmentData, 'Cool Compress', 'other', entry.date)
    }
    if (treatments.woundCare) {
      addTreatment(treatmentData, 'Wound Care', 'other', entry.date)
    }
    if (treatments.incisionDrainage) {
      addTreatment(treatmentData, 'Incision & Drainage', 'procedure', entry.date)
    }

    if (treatments.topicalTreatments) {
      for (const treatment of treatments.topicalTreatments) {
        addTreatment(treatmentData, treatment, 'topical', entry.date)
      }
    }

    if (treatments.oralMedications) {
      for (const medication of treatments.oralMedications) {
        addTreatment(treatmentData, medication, 'oral', entry.date)
      }
    }

    if (treatments.biologicInjection) {
      addTreatment(
        treatmentData,
        treatments.biologicInjection.medication,
        'biologic',
        entry.date
      )
    }
  }

  // Convert to array
  return Object.entries(treatmentData)
    .map(([treatment, data]) => ({
      treatment,
      category: data.category,
      usageCount: data.count,
      firstUsed: data.dates.length > 0 ? data.dates.sort()[0] : null,
      lastUsed:
        data.dates.length > 0 ? data.dates.sort()[data.dates.length - 1] : null,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
}

function addTreatment(
  data: Record<
    string,
    { count: number; category: TreatmentSummary['category']; dates: string[] }
  >,
  treatment: string,
  category: TreatmentSummary['category'],
  date: string
): void {
  if (!data[treatment]) {
    data[treatment] = { count: 0, category, dates: [] }
  }
  data[treatment].count++
  data[treatment].dates.push(date)
}

/**
 * Formats report as CSV for export
 */
export function formatReportAsCSV(report: HSProviderReport): string {
  const lines: string[] = []

  // Header
  lines.push('HS Provider Report')
  lines.push(`Generated: ${new Date(report.generatedAt).toLocaleDateString()}`)
  lines.push(`Date Range: ${report.dateRange.start} to ${report.dateRange.end}`)
  lines.push('')

  // Current Status
  lines.push('CURRENT STATUS')
  lines.push(`IHS4 Score,${report.currentStatus.ihs4.score}`)
  lines.push(`Severity,${report.currentStatus.ihs4.severity}`)
  lines.push(`Active Lesions,${report.currentStatus.activeLesionCount}`)
  lines.push(`Healing Lesions,${report.currentStatus.healingLesionCount}`)
  lines.push(`Nodules,${report.currentStatus.ihs4.breakdown.nodules}`)
  lines.push(`Abscesses,${report.currentStatus.ihs4.breakdown.abscesses}`)
  lines.push(`Draining Tunnels,${report.currentStatus.ihs4.breakdown.drainingTunnels}`)
  lines.push('')

  // Affected Regions
  lines.push('AFFECTED REGIONS')
  lines.push('Region,Hurley Stage,Active Lesions,Nodules,Abscesses,Tunnels')
  for (const region of report.affectedRegions) {
    lines.push(
      `${region.regionName},${region.hurleyStage || 'N/A'},${region.activeLesions},${region.lesionBreakdown.nodules},${region.lesionBreakdown.abscesses},${region.lesionBreakdown.drainingTunnels}`
    )
  }
  lines.push('')

  // Symptom Trends
  lines.push('SYMPTOM TRENDS')
  lines.push(`Average Pain,${report.symptomTrends.averagePain ?? 'N/A'}`)
  lines.push(`Flare Days,${report.symptomTrends.flareDays}`)
  lines.push(`IHS4 Average,${report.symptomTrends.ihs4Summary.average}`)
  lines.push(`IHS4 Range,${report.symptomTrends.ihs4Summary.min}-${report.symptomTrends.ihs4Summary.max}`)
  lines.push(`Trend,${report.symptomTrends.ihs4Summary.trend}`)
  lines.push('')

  // IHS4 History
  if (report.symptomTrends.ihs4History.length > 0) {
    lines.push('IHS4 HISTORY')
    lines.push('Date,Score')
    for (const point of report.symptomTrends.ihs4History) {
      lines.push(`${point.date},${point.score}`)
    }
    lines.push('')
  }

  // Quality of Life
  lines.push('QUALITY OF LIFE IMPACT')
  lines.push(`Days with Data,${report.qualityOfLife.daysWithData}`)
  lines.push(`Sleep Affected Days,${report.qualityOfLife.sleepAffectedDays}`)
  lines.push(`Work/School Missed Days,${report.qualityOfLife.workMissedDays}`)
  lines.push(`Mobility Limited Days,${report.qualityOfLife.mobilityLimitedDays}`)
  lines.push('')

  // Triggers
  if (report.triggers.length > 0) {
    lines.push('POTENTIAL TRIGGERS')
    lines.push('Trigger,Occurrences,Percentage')
    for (const trigger of report.triggers) {
      lines.push(`${trigger.trigger},${trigger.occurrences},${trigger.percentOfEntries}%`)
    }
    lines.push('')
  }

  // Treatments
  if (report.treatments.length > 0) {
    lines.push('TREATMENTS USED')
    lines.push('Treatment,Category,Usage Count,First Used,Last Used')
    for (const treatment of report.treatments) {
      lines.push(
        `${treatment.treatment},${treatment.category},${treatment.usageCount},${treatment.firstUsed || 'N/A'},${treatment.lastUsed || 'N/A'}`
      )
    }
  }

  return lines.join('\n')
}

/**
 * Formats report as JSON for export
 */
export function formatReportAsJSON(report: HSProviderReport): string {
  return JSON.stringify(report, null, 2)
}
