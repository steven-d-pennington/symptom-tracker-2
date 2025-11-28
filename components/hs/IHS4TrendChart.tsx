'use client'

import { useState, useMemo, useCallback } from 'react'
import { DailyHSEntry, IHS4Severity } from '@/lib/hs/types'
import {
  entriesToTrendData,
  filterTrendDataByRange,
  calculateTrendSummary,
  formatChartDate,
  getSeverityBands,
  getTrendColor,
  getDateRangeFromPreset,
  DateRangePreset,
  DateRange,
  TrendDataPoint,
} from '@/lib/hs/trends'
import { getIHS4SeverityColor, getIHS4SeverityLabel } from '@/lib/hs/ihs4'

interface IHS4TrendChartProps {
  entries: DailyHSEntry[]
  height?: number
  showDateRangeSelector?: boolean
  showSummary?: boolean
  className?: string
}

/**
 * IHS4 Trend Chart with severity bands and interactive tooltips
 */
export function IHS4TrendChart({
  entries,
  height = 280,
  showDateRangeSelector = true,
  showSummary = true,
  className = '',
}: IHS4TrendChartProps) {
  const [dateRange, setDateRange] = useState<DateRange>(
    getDateRangeFromPreset('30d')
  )
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Convert entries to trend data
  const allTrendData = useMemo(
    () => entriesToTrendData(entries),
    [entries]
  )

  // Filter by date range
  const trendData = useMemo(
    () => filterTrendDataByRange(allTrendData, dateRange.start, dateRange.end),
    [allTrendData, dateRange]
  )

  // Calculate summary
  const summary = useMemo(
    () => calculateTrendSummary(trendData),
    [trendData]
  )

  // Chart dimensions
  const width = 600
  const padding = { top: 20, right: 30, bottom: 50, left: 45 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate scales
  const maxScore = Math.max(15, summary.maxScore + 2)
  const minDate = trendData.length > 0 ? new Date(trendData[0].date).getTime() : Date.now()
  const maxDate = trendData.length > 0
    ? new Date(trendData[trendData.length - 1].date).getTime()
    : Date.now()
  const dateRange_ = maxDate - minDate || 1

  const scaleX = useCallback(
    (date: string) => {
      const time = new Date(date).getTime()
      return padding.left + ((time - minDate) / dateRange_) * chartWidth
    },
    [minDate, dateRange_, chartWidth, padding.left]
  )

  const scaleY = useCallback(
    (score: number) => {
      return padding.top + chartHeight - (score / maxScore) * chartHeight
    },
    [maxScore, chartHeight, padding.top]
  )

  // Generate path for trend line
  const pathData = useMemo(() => {
    if (trendData.length === 0) return ''
    return trendData
      .map((point, index) => {
        const x = scaleX(point.date)
        const y = scaleY(point.score)
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }, [trendData, scaleX, scaleY])

  // Severity bands
  const severityBands = getSeverityBands()

  // Handle date range change
  const handlePresetChange = (preset: DateRangePreset) => {
    setDateRange(getDateRangeFromPreset(preset))
  }

  // Handle point hover
  const handlePointHover = (
    point: TrendDataPoint,
    event: React.MouseEvent<SVGCircleElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
    setHoveredPoint(point)
  }

  if (entries.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No IHS4 data available</p>
          <p className="text-sm mt-1">Start tracking daily entries to see trends</p>
        </div>
      </div>
    )
  }

  const trendColors = getTrendColor(summary.trend)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with date range selector */}
      {showDateRangeSelector && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            IHS4 Score History
          </h3>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as DateRangePreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange.preset === preset
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ maxHeight: `${height}px` }}
        >
          {/* Severity band backgrounds */}
          {severityBands.map((band) => {
            const y1 = scaleY(band.maxY)
            const y2 = scaleY(band.minY)
            const bandHeight = y2 - y1

            return (
              <rect
                key={band.name}
                x={padding.left}
                y={y1}
                width={chartWidth}
                height={Math.max(0, bandHeight)}
                fill={band.color}
                className="dark:fill-current"
                style={{ opacity: 0.5 }}
              />
            )
          })}

          {/* Severity threshold lines */}
          <line
            x1={padding.left}
            y1={scaleY(3)}
            x2={width - padding.right}
            y2={scaleY(3)}
            stroke="rgb(34, 197, 94)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <line
            x1={padding.left}
            y1={scaleY(10)}
            x2={width - padding.right}
            y2={scaleY(10)}
            stroke="rgb(234, 179, 8)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-600"
            strokeWidth="1"
          />

          {/* Y-axis labels */}
          {[0, 3, 10, maxScore].map((score) => (
            <g key={score}>
              <text
                x={padding.left - 8}
                y={scaleY(score)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-gray-500 dark:fill-gray-400 text-xs"
              >
                {score}
              </text>
              <line
                x1={padding.left - 4}
                y1={scaleY(score)}
                x2={padding.left}
                y2={scaleY(score)}
                stroke="currentColor"
                className="text-gray-300 dark:text-gray-600"
              />
            </g>
          ))}

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-600"
            strokeWidth="1"
          />

          {/* X-axis labels */}
          {trendData.length > 0 &&
            trendData
              .filter((_, i) => {
                const step = Math.max(1, Math.floor(trendData.length / 6))
                return i % step === 0 || i === trendData.length - 1
              })
              .map((point) => (
                <text
                  key={point.date}
                  x={scaleX(point.date)}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  className="fill-gray-500 dark:fill-gray-400 text-xs"
                >
                  {formatChartDate(point.date)}
                </text>
              ))}

          {/* Trend line */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="rgb(139, 92, 246)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {trendData.map((point) => {
            const x = scaleX(point.date)
            const y = scaleY(point.score)
            const severityColors = getIHS4SeverityColor(point.severity)

            return (
              <g key={point.date}>
                {/* Flare day indicator */}
                {point.isFlareDay && (
                  <circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill="rgba(239, 68, 68, 0.2)"
                    className="animate-pulse"
                  />
                )}
                {/* Data point */}
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="white"
                  stroke="rgb(139, 92, 246)"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-7 transition-all"
                  onMouseEnter={(e) => handlePointHover(point, e)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            )
          })}

          {/* Severity labels on right */}
          <text
            x={width - padding.right + 8}
            y={scaleY(1.5)}
            className="fill-green-600 dark:fill-green-400 text-xs font-medium"
          >
            Mild
          </text>
          <text
            x={width - padding.right + 8}
            y={scaleY(7)}
            className="fill-yellow-600 dark:fill-yellow-400 text-xs font-medium"
          >
            Mod
          </text>
          <text
            x={width - padding.right + 8}
            y={scaleY(13)}
            className="fill-red-600 dark:fill-red-400 text-xs font-medium"
          >
            Severe
          </text>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="fixed z-50 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-sm pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y - 10,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatChartDate(hoveredPoint.date, 'long')}
            </p>
            <div className="mt-1 space-y-0.5">
              <p className={getIHS4SeverityColor(hoveredPoint.severity).text}>
                Score: {hoveredPoint.score} ({getIHS4SeverityLabel(hoveredPoint.severity)})
              </p>
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                <span className="text-orange-500">●</span> {hoveredPoint.breakdown.nodules} Nodules{' '}
                <span className="text-pink-500">●</span> {hoveredPoint.breakdown.abscesses} Abscesses{' '}
                <span className="text-purple-500">●</span> {hoveredPoint.breakdown.drainingTunnels} Tunnels
              </div>
              {hoveredPoint.isFlareDay && (
                <p className="text-red-500 text-xs font-medium">⚠️ Flare Day</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {showSummary && trendData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Average
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {summary.averageScore.toFixed(1)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Range
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {summary.minScore} - {summary.maxScore}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Flare Days
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {summary.flareDays}
            </p>
          </div>
          <div className={`${trendColors.bg} rounded-lg p-3`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Trend
            </p>
            <p className={`text-xl font-bold ${trendColors.text}`}>
              {trendColors.icon} {summary.trend.charAt(0).toUpperCase() + summary.trend.slice(1)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact version of IHS4 Trend Chart for dashboard widgets
 */
export function IHS4TrendChartCompact({
  entries,
  className = '',
}: {
  entries: DailyHSEntry[]
  className?: string
}) {
  return (
    <IHS4TrendChart
      entries={entries}
      height={200}
      showDateRangeSelector={false}
      showSummary={false}
      className={className}
    />
  )
}
