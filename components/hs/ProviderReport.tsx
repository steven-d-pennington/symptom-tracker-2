'use client'

import { useMemo } from 'react'
import type {
  HSProviderReport,
  AffectedRegionSummary,
  TriggerSummary,
  TreatmentSummary,
} from '@/lib/hs'
import {
  getHurleyStageLabel,
  getHurleSeverityColors,
  getIHS4SeverityColor,
  getTrendColor,
} from '@/lib/hs'

interface ProviderReportProps {
  report: HSProviderReport
  showChart?: boolean
}

/**
 * Printable provider report component
 */
export function ProviderReport({ report, showChart = true }: ProviderReportProps) {
  const formattedDate = useMemo(() => {
    return new Date(report.generatedAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [report.generatedAt])

  const dateRangeFormatted = useMemo(() => {
    const start = new Date(report.dateRange.start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const end = new Date(report.dateRange.end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${start} - ${end}`
  }, [report.dateRange])

  const severityColor = getIHS4SeverityColor(report.currentStatus.ihs4.severity)
  const trendColors = getTrendColor(report.symptomTrends.ihs4Summary.trend)

  return (
    <div className="provider-report bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 print:bg-white print:text-black">
      {/* Header */}
      <header className="border-b-2 border-gray-300 dark:border-gray-700 pb-4 mb-6 print:border-black">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white print:text-black">
          HS Status Report
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
          Generated: {formattedDate}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
          Date Range: {dateRangeFormatted}
        </p>
      </header>

      {/* Current Status Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 print:border-gray-400">
          Current Status
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 print:bg-gray-100 print:border print:border-gray-300">
            <div className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
              IHS4 Score
            </div>
            <div className={`text-3xl font-bold ${severityColor}`}>
              {report.currentStatus.ihs4.score}
            </div>
            <div className={`text-sm font-medium capitalize ${severityColor}`}>
              {report.currentStatus.ihs4.severity}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 print:bg-gray-100 print:border print:border-gray-300">
            <div className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
              Active Lesions
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white print:text-black">
              {report.currentStatus.activeLesionCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {report.currentStatus.healingLesionCount} healing
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 print:bg-gray-100 print:border print:border-gray-300">
            <div className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
              Breakdown
            </div>
            <div className="text-sm space-y-1 mt-2">
              <div className="flex justify-between">
                <span>Nodules:</span>
                <span className="font-medium">{report.currentStatus.ihs4.breakdown.nodules}</span>
              </div>
              <div className="flex justify-between">
                <span>Abscesses:</span>
                <span className="font-medium">{report.currentStatus.ihs4.breakdown.abscesses}</span>
              </div>
              <div className="flex justify-between">
                <span>Tunnels:</span>
                <span className="font-medium">{report.currentStatus.ihs4.breakdown.drainingTunnels}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 print:bg-gray-100 print:border print:border-gray-300">
            <div className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
              Healed This Period
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 print:text-green-700">
              {report.currentStatus.healedInPeriod}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">lesions</div>
          </div>
        </div>
      </section>

      {/* Affected Regions Section */}
      {report.affectedRegions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 print:border-gray-400">
            Affected Regions
          </h2>

          <div className="space-y-3">
            {report.affectedRegions.map((region) => (
              <RegionSummaryRow key={region.regionId} region={region} />
            ))}
          </div>
        </section>
      )}

      {/* Symptom Trends Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 print:border-gray-400">
          Symptom Trends ({report.symptomTrends.totalEntries} days of data)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 print:bg-gray-100 print:border print:border-gray-300">
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Pain</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white print:text-black">
              {report.symptomTrends.averagePain !== null
                ? `${report.symptomTrends.averagePain}/10`
                : 'N/A'}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 print:bg-gray-100 print:border print:border-gray-300">
            <div className="text-sm text-gray-600 dark:text-gray-400">Worst Pain Day</div>
            {report.symptomTrends.worstPainDay ? (
              <>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 print:text-red-700">
                  {report.symptomTrends.worstPainDay.pain}/10
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(report.symptomTrends.worstPainDay.date).toLocaleDateString()}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-400">N/A</div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 print:bg-gray-100 print:border print:border-gray-300">
            <div className="text-sm text-gray-600 dark:text-gray-400">Flare Days</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 print:text-orange-700">
              {report.symptomTrends.flareDays}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {report.symptomTrends.totalEntries > 0
                ? `${Math.round((report.symptomTrends.flareDays / report.symptomTrends.totalEntries) * 100)}% of days`
                : ''}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 print:bg-gray-100 print:border print:border-gray-300">
            <div className="text-sm text-gray-600 dark:text-gray-400">IHS4 Trend</div>
            <div className={`text-2xl font-bold ${trendColors.text}`}>
              {trendColors.icon} {report.symptomTrends.ihs4Summary.trend}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Range: {report.symptomTrends.ihs4Summary.min}-{report.symptomTrends.ihs4Summary.max}
            </div>
          </div>
        </div>

        {/* Simple IHS4 History Chart for print */}
        {showChart && report.symptomTrends.ihs4History.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg print:bg-white print:border print:border-gray-300">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              IHS4 Score Over Time
            </div>
            <SimpleLineChart data={report.symptomTrends.ihs4History} />
          </div>
        )}
      </section>

      {/* Quality of Life Section */}
      {report.qualityOfLife.daysWithData > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 print:border-gray-400">
            Quality of Life Impact
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
            <ImpactCard
              label="Sleep Affected"
              value={report.qualityOfLife.sleepAffectedDays}
              total={report.qualityOfLife.daysWithData}
            />
            <ImpactCard
              label="Work/School Missed"
              value={report.qualityOfLife.workMissedDays}
              total={report.qualityOfLife.daysWithData}
            />
            <ImpactCard
              label="Mobility Limited"
              value={report.qualityOfLife.mobilityLimitedDays}
              total={report.qualityOfLife.daysWithData}
            />
            <ImpactCard
              label="Social Activities"
              value={report.qualityOfLife.socialAffectedDays}
              total={report.qualityOfLife.daysWithData}
            />
          </div>

          {/* Emotional Impact */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg print:bg-gray-100 print:border print:border-gray-300">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Average Emotional Impact (0-4 scale)
            </div>
            <div className="grid grid-cols-3 gap-4">
              <EmotionalScore label="Anxiety" value={report.qualityOfLife.emotionalImpact.averageAnxiety} />
              <EmotionalScore label="Depression" value={report.qualityOfLife.emotionalImpact.averageDepression} />
              <EmotionalScore label="Frustration" value={report.qualityOfLife.emotionalImpact.averageFrustration} />
            </div>
          </div>
        </section>
      )}

      {/* Triggers Section */}
      {report.triggers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 print:border-gray-400">
            Potential Triggers Identified
          </h2>

          <div className="space-y-2">
            {report.triggers.slice(0, 8).map((trigger) => (
              <TriggerRow key={trigger.trigger} trigger={trigger} />
            ))}
          </div>
        </section>
      )}

      {/* Treatments Section */}
      {report.treatments.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 print:border-gray-400">
            Treatments Used
          </h2>

          <div className="space-y-2">
            {report.treatments.map((treatment) => (
              <TreatmentRow key={treatment.treatment} treatment={treatment} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 print:border-gray-400 print:text-gray-600">
        <p>
          This report was generated from self-reported data using a symptom tracking application.
          It is intended to supplement, not replace, clinical evaluation.
        </p>
        <p className="mt-1">
          IHS4 = International Hidradenitis Suppurativa Severity Score System.
          Score interpretation: Mild (0-3), Moderate (4-10), Severe (11+).
        </p>
      </footer>
    </div>
  )
}

/**
 * Region summary row component
 */
function RegionSummaryRow({ region }: { region: AffectedRegionSummary }) {
  const hurleyColors = getHurleSeverityColors(region.hurleyStage)

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg print:bg-gray-100 print:border print:border-gray-300">
      <div className="flex items-center gap-3">
        {region.hurleyStage && (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${hurleyColors.bg} ${hurleyColors.text}`}>
            Stage {region.hurleyStage}
          </span>
        )}
        <span className="font-medium text-gray-900 dark:text-white print:text-black">
          {region.regionName}
        </span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {region.lesionBreakdown.nodules > 0 && (
          <span className="mr-2">{region.lesionBreakdown.nodules} nodule{region.lesionBreakdown.nodules !== 1 ? 's' : ''}</span>
        )}
        {region.lesionBreakdown.abscesses > 0 && (
          <span className="mr-2">{region.lesionBreakdown.abscesses} abscess{region.lesionBreakdown.abscesses !== 1 ? 'es' : ''}</span>
        )}
        {region.lesionBreakdown.drainingTunnels > 0 && (
          <span>{region.lesionBreakdown.drainingTunnels} tunnel{region.lesionBreakdown.drainingTunnels !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  )
}

/**
 * Impact card component
 */
function ImpactCard({ label, value, total }: { label: string; value: number; total: number }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 print:bg-gray-100 print:border print:border-gray-300">
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white print:text-black">
        {value} <span className="text-sm font-normal text-gray-500">days</span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {percentage}% of tracked days
      </div>
    </div>
  )
}

/**
 * Emotional score component
 */
function EmotionalScore({ label, value }: { label: string; value: number }) {
  const getColor = (val: number) => {
    if (val <= 1) return 'text-green-600 dark:text-green-400'
    if (val <= 2) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${getColor(value)}`}>{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}

/**
 * Trigger row component
 */
function TriggerRow({ trigger }: { trigger: TriggerSummary }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded print:bg-gray-100">
      <span className="text-gray-900 dark:text-white print:text-black">{trigger.trigger}</span>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {trigger.occurrences}x ({trigger.percentOfEntries}%)
      </span>
    </div>
  )
}

/**
 * Treatment row component
 */
function TreatmentRow({ treatment }: { treatment: TreatmentSummary }) {
  const categoryColors: Record<string, string> = {
    topical: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    oral: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    biologic: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    procedure: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  }

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded print:bg-gray-100">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[treatment.category]}`}>
          {treatment.category}
        </span>
        <span className="text-gray-900 dark:text-white print:text-black capitalize">
          {treatment.treatment}
        </span>
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {treatment.usageCount}x used
      </span>
    </div>
  )
}

/**
 * Simple SVG line chart for IHS4 history
 */
function SimpleLineChart({ data }: { data: Array<{ date: string; score: number }> }) {
  if (data.length === 0) return null

  const width = 600
  const height = 150
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxScore = Math.max(...data.map((d) => d.score), 15)
  const minScore = 0

  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth + padding.left
  const yScale = (score: number) =>
    chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight + padding.top

  // Generate path
  const pathData = data
    .map((point, index) => {
      const x = xScale(index)
      const y = yScale(point.score)
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  // Severity bands
  const bands = [
    { name: 'Mild', minY: 0, maxY: 3, color: 'rgba(34, 197, 94, 0.2)' },
    { name: 'Moderate', minY: 4, maxY: 10, color: 'rgba(234, 179, 8, 0.2)' },
    { name: 'Severe', minY: 11, maxY: maxScore, color: 'rgba(239, 68, 68, 0.2)' },
  ]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Severity bands */}
      {bands.map((band) => {
        const y1 = yScale(Math.min(band.maxY, maxScore))
        const y2 = yScale(band.minY)
        return (
          <rect
            key={band.name}
            x={padding.left}
            y={y1}
            width={chartWidth}
            height={y2 - y1}
            fill={band.color}
          />
        )
      })}

      {/* Grid lines */}
      {[0, 3, 10, maxScore].map((score) => (
        <g key={score}>
          <line
            x1={padding.left}
            y1={yScale(score)}
            x2={width - padding.right}
            y2={yScale(score)}
            stroke="#e5e7eb"
            strokeDasharray="2,2"
          />
          <text
            x={padding.left - 5}
            y={yScale(score)}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-gray-500"
          >
            {score}
          </text>
        </g>
      ))}

      {/* Data line */}
      <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />

      {/* Data points */}
      {data.map((point, index) => (
        <circle
          key={point.date}
          cx={xScale(index)}
          cy={yScale(point.score)}
          r={3}
          fill="#3b82f6"
        />
      ))}

      {/* X-axis labels (show first, middle, last) */}
      {[0, Math.floor(data.length / 2), data.length - 1].map((index) => {
        if (index >= data.length) return null
        const date = new Date(data[index].date)
        return (
          <text
            key={index}
            x={xScale(index)}
            y={height - 5}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        )
      })}
    </svg>
  )
}

/**
 * Compact report summary for dashboard
 */
export function ProviderReportSummary({ report }: { report: HSProviderReport }) {
  const severityColor = getIHS4SeverityColor(report.currentStatus.ihs4.severity)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Report Summary</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(report.generatedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className={`text-2xl font-bold ${severityColor}`}>
            {report.currentStatus.ihs4.score}
          </div>
          <div className="text-xs text-gray-500">IHS4</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {report.currentStatus.activeLesionCount}
          </div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {report.symptomTrends.flareDays}
          </div>
          <div className="text-xs text-gray-500">Flare Days</div>
        </div>
      </div>
    </div>
  )
}
