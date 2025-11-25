'use client'

import { FlareEvent } from '@/lib/db'
import { getSeverityColor } from '@/lib/bodyMap/coordinateUtils'

interface SeverityChartProps {
  events: FlareEvent[]
  className?: string
}

interface DataPoint {
  timestamp: number
  severity: number
  label: string
}

export function SeverityChart({ events, className = '' }: SeverityChartProps) {
  // Extract severity data points from events
  const dataPoints: DataPoint[] = events
    .filter((e) => e.severity !== undefined)
    .map((e) => ({
      timestamp: e.timestamp,
      severity: e.severity!,
      label: new Date(e.timestamp).toLocaleDateString(),
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  if (dataPoints.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        No severity data to display
      </div>
    )
  }

  // Chart dimensions
  const width = 400
  const height = 200
  const padding = { top: 20, right: 20, bottom: 40, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate scales
  const minTime = dataPoints[0].timestamp
  const maxTime = dataPoints[dataPoints.length - 1].timestamp
  const timeRange = maxTime - minTime || 1 // Avoid division by zero

  const scaleX = (timestamp: number) =>
    padding.left + ((timestamp - minTime) / timeRange) * chartWidth

  const scaleY = (severity: number) =>
    padding.top + chartHeight - (severity / 10) * chartHeight

  // Generate path
  const pathData = dataPoints
    .map((point, index) => {
      const x = scaleX(point.timestamp)
      const y = scaleY(point.severity)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  // Generate area fill path
  const areaPath = dataPoints.length > 0
    ? `${pathData} L ${scaleX(dataPoints[dataPoints.length - 1].timestamp)} ${padding.top + chartHeight} L ${scaleX(dataPoints[0].timestamp)} ${padding.top + chartHeight} Z`
    : ''

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        aria-label="Severity over time chart"
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

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#severityGradient)"
          opacity={0.3}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="severityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
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
              r={6}
              fill={getSeverityColor(point.severity)}
              stroke="white"
              strokeWidth={2}
              className="cursor-pointer hover:r-8 transition-all"
            />
            {/* Tooltip on hover - simplified version */}
            <title>
              {new Date(point.timestamp).toLocaleString()}: Severity {point.severity}
            </title>
          </g>
        ))}

        {/* X-axis labels */}
        {dataPoints.length > 1 && (
          <>
            <text
              x={scaleX(dataPoints[0].timestamp)}
              y={height - 10}
              textAnchor="start"
              className="text-xs fill-gray-500 dark:fill-gray-400"
            >
              {new Date(dataPoints[0].timestamp).toLocaleDateString()}
            </text>
            <text
              x={scaleX(dataPoints[dataPoints.length - 1].timestamp)}
              y={height - 10}
              textAnchor="end"
              className="text-xs fill-gray-500 dark:fill-gray-400"
            >
              {new Date(dataPoints[dataPoints.length - 1].timestamp).toLocaleDateString()}
            </text>
          </>
        )}

        {/* Single point label */}
        {dataPoints.length === 1 && (
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-gray-500 dark:fill-gray-400"
          >
            {new Date(dataPoints[0].timestamp).toLocaleDateString()}
          </text>
        )}

        {/* Y-axis label */}
        <text
          x={-height / 2}
          y={12}
          textAnchor="middle"
          transform="rotate(-90)"
          className="text-xs fill-gray-500 dark:fill-gray-400"
        >
          Severity
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-lime-500" />
          <span>Low (1-3)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Medium (4-7)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>High (8-10)</span>
        </div>
      </div>
    </div>
  )
}
