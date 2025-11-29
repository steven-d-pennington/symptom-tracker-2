/**
 * HS Provider Report Types
 *
 * Structures for generating healthcare provider reports
 */

import type { IHS4Result, HurleyStage, LesionType } from '../types'

export interface HSProviderReport {
  // Metadata
  generatedAt: string
  dateRange: {
    start: string
    end: string
  }

  // Current Status
  currentStatus: {
    ihs4: IHS4Result
    activeLesionCount: number
    healingLesionCount: number
    healedInPeriod: number
  }

  // Affected Regions
  affectedRegions: AffectedRegionSummary[]

  // Symptom Trends
  symptomTrends: SymptomTrendsSummary

  // Quality of Life Impact
  qualityOfLife: QualityOfLifeSummary

  // Triggers Analysis
  triggers: TriggerSummary[]

  // Treatments
  treatments: TreatmentSummary[]
}

export interface AffectedRegionSummary {
  regionId: string
  regionName: string
  hurleyStage: HurleyStage | null
  activeLesions: number
  lesionBreakdown: {
    nodules: number
    abscesses: number
    drainingTunnels: number
  }
  lastAssessedDate: string | null
}

export interface SymptomTrendsSummary {
  averagePain: number | null
  worstPainDay: { date: string; pain: number } | null
  flareDays: number
  totalEntries: number
  ihs4Summary: {
    average: number
    min: number
    max: number
    trend: 'improving' | 'stable' | 'worsening'
  }
  ihs4History: Array<{ date: string; score: number }>
}

export interface QualityOfLifeSummary {
  daysWithData: number
  sleepAffectedDays: number
  workMissedDays: number
  mobilityLimitedDays: number
  socialAffectedDays: number
  emotionalImpact: {
    averageAnxiety: number
    averageDepression: number
    averageFrustration: number
  }
}

export interface TriggerSummary {
  trigger: string
  occurrences: number
  percentOfEntries: number
}

export interface TreatmentSummary {
  treatment: string
  category: 'topical' | 'oral' | 'biologic' | 'procedure' | 'other'
  usageCount: number
  firstUsed: string | null
  lastUsed: string | null
}

export interface ReportExportOptions {
  format: 'pdf' | 'csv' | 'json'
  includeCharts: boolean
  anonymize: boolean
}
