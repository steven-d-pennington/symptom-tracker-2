'use client'

import { SymptomInstance, Symptom } from '@/lib/db'
import { getSeverityColor } from '@/lib/bodyMap/coordinateUtils'

interface SymptomTrendChartProps {
  instances: SymptomInstance[]
  symptomsMap: Map<string, Symptom>
  selectedSymptomId?: string
  className?: string
}

interface DataPoint {
  timestamp: number
  severity: number
  symptomId: string
  symptomName: string
}

export function SymptomTrendChart({
  instances,
  symptomsMap,
  selectedSymptomId,
  className = '',
}: SymptomTrendChartProps) {
  // Filter by selected symptom if provided
  const filteredInstances = selectedSymptomId
    ? instances.filter((i) => i.symptomId === selectedSymptomId)
    : instances

  if (filteredInstances.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        No data to display
      </div>
    )
  }

  // Convert to data points and sort by timestamp
  const dataPoints: DataPoint[] = filteredInstances
    .map((instance) => ({
      timestamp: instance.timestamp,
      severity: instance.severity,
      symptomId: instance.symptomId,
      symptomName: symptomsMap.get(instance.symptomId)?.name || 'Unknown',
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  // Chart dimensions
  const width = 500
  const height = 250
  const padding = { top: 20, right: 20, bottom: 50, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate scales
  const minTime = dataPoints[0].timestamp
  const maxTime = dataPoints[dataPoints.length - 1].timestamp
  const timeRange = maxTime - minTime || 1

  const scaleX = (timestamp: number) =>
    padding.left + ((timestamp - minTime) / timeRange) * chartWidth

  const scaleY = (severity: number) =>
    padding.top + chartHeight - (severity / 10) * chartHeight

  // Generate path for trend line
  const pathData = dataPoints
    .map((point, index) => {
      const x = scaleX(point.timestamp)
      const y = scaleY(point.severity)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  // Calculate average severity
  const avgSeverity =
    dataPoints.reduce((sum, p) => sum + p.severity, 0) / dataPoints.length

  // Calculate trend direction
  const firstHalfAvg =
    dataPoints.slice(0, Math.ceil(dataPoints.length / 2)).reduce((sum, p) => sum + p.severity, 0) /
    Math.ceil(dataPoints.length / 2)
  const secondHalfAvg =
    dataPoints.slice(Math.ceil(dataPoints.length / 2)).reduce((sum, p) => sum + p.severity, 0) /
    Math.floor(dataPoints.length / 2) || firstHalfAvg

  const trendDirection = secondHalfAvg < firstHalfAvg ? 'improving' : secondHalfAvg > firstHalfAvg ? 'worsening' : 'stable'

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        aria-label="Symptom severity trend chart"
      >
        {/* Grid lines */}
        <g className="text-gray-200 dark:text-gray-700">
          {[0, 2, 4, 6, 8, 10].map((severity) => (
            <g key={severity}>
              <line
                x1={padding.left}
                y1={scaleY(severity)}
                x2={width - padding.right}
                y2={scaleY(severity)}
                stroke="currentColor"
                strokeDasharray="4 2"
                opacity={0.5}
              />
              <text
                x={padding.left - 8}
                y={scaleY(severity)}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-gray-500 dark:fill-gray-400"
              >
                {severity}
              </text>
            </g>
          ))}
        </g>

        {/* Average line */}
        <line
          x1={padding.left}
          y1={scaleY(avgSeverity)}
          x2={width - padding.right}
          y2={scaleY(avgSeverity)}
          stroke="#9ca3af"
          strokeWidth={1}
          strokeDasharray="8 4"
        />
        <text
          x={width - padding.right + 5}
          y={scaleY(avgSeverity)}
          dominantBaseline="middle"
          className="text-xs fill-gray-400"
        >
          avg
        </text>

        {/* Area fill */}
        {dataPoints.length > 1 && (
          <path
            d={`${pathData} L ${scaleX(dataPoints[dataPoints.length - 1].timestamp)} ${padding.top + chartHeight} L ${scaleX(dataPoints[0].timestamp)} ${padding.top + chartHeight} Z`}
            fill="url(#trendGradient)"
            opacity={0.3}
          />
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>

        {/* Trend line */}
        <path
          d={pathData}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <g key={index}>
            <circle
              cx={scaleX(point.timestamp)}
              cy={scaleY(point.severity)}
              r={5}
              fill={getSeverityColor(point.severity)}
              stroke="white"
              strokeWidth={2}
              className="cursor-pointer"
            />
            <title>
              {point.symptomName}
              {'\n'}
              {new Date(point.timestamp).toLocaleString()}
              {'\n'}
              Severity: {point.severity}
            </title>
          </g>
        ))}

        {/* X-axis labels */}
        {dataPoints.length > 1 && (
          <>
            <text
              x={scaleX(dataPoints[0].timestamp)}
              y={height - 15}
              textAnchor="start"
              className="text-xs fill-gray-500 dark:fill-gray-400"
            >
              {new Date(dataPoints[0].timestamp).toLocaleDateString()}
            </text>
            <text
              x={scaleX(dataPoints[dataPoints.length - 1].timestamp)}
              y={height - 15}
              textAnchor="end"
              className="text-xs fill-gray-500 dark:fill-gray-400"
            >
              {new Date(dataPoints[dataPoints.length - 1].timestamp).toLocaleDateString()}
            </text>
          </>
        )}

        {/* Y-axis label */}
        <text
          x={-height / 2}
          y={15}
          textAnchor="middle"
          transform="rotate(-90)"
          className="text-xs fill-gray-500 dark:fill-gray-400"
        >
          Severity
        </text>
      </svg>

      {/* Summary stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Avg: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {avgSeverity.toFixed(1)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Entries: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {dataPoints.length}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            trendDirection === 'improving'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : trendDirection === 'worsening'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {trendDirection === 'improving' && '↓ '}
          {trendDirection === 'worsening' && '↑ '}
          {trendDirection === 'stable' && '→ '}
          {trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)}
        </div>
      </div>
    </div>
  )
}
