/**
 * HS Provider Report Module
 *
 * Generates comprehensive reports for healthcare provider visits
 */

// Types
export type {
  HSProviderReport,
  AffectedRegionSummary,
  SymptomTrendsSummary,
  QualityOfLifeSummary,
  TriggerSummary,
  TreatmentSummary,
  ReportExportOptions,
} from './types'

// Report generation
export {
  generateHSReport,
  formatReportAsCSV,
  formatReportAsJSON,
} from './generateReport'
export type { GenerateReportOptions } from './generateReport'
