'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { db, Flare, FlareEvent } from '@/lib/db'

type DateRange = '30d' | '90d' | '180d' | 'all'

interface FlareMetrics {
  totalFlares: number
  activeFlares: number
  resolvedFlares: number
  avgDuration: number // hours
  avgSeverity: number
  improvingCount: number
  worseningCount: number
  flaresByMonth: { month: string; count: number }[]
  durationByRegion: { region: string; avgDuration: number; count: number }[]
  interventionEffectiveness: { type: string; avgReduction: number; count: number }[]
}

export default function FlareMetricsPage() {
  const [metrics, setMetrics] = useState<FlareMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('90d')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = Date.now()
      let startDate: number

      switch (dateRange) {
        case '30d':
          startDate = now - 30 * 24 * 60 * 60 * 1000
          break
        case '90d':
          startDate = now - 90 * 24 * 60 * 60 * 1000
          break
        case '180d':
          startDate = now - 180 * 24 * 60 * 60 * 1000
          break
        case 'all':
        default:
          startDate = 0
          break
      }

      // Get all flares in date range
      const flares = await db.flares
        .filter((f) => f.startDate >= startDate)
        .toArray()

      // Get all flare events
      const flareEvents = await db.flareEvents.toArray()

      // Calculate metrics
      const activeFlares = flares.filter((f) => f.status === 'active').length
      const resolvedFlares = flares.filter((f) => f.status === 'resolved').length
      const improvingCount = flares.filter((f) => f.status === 'improving').length
      const worseningCount = flares.filter((f) => f.status === 'worsening').length

      // Average duration (only for resolved flares)
      const resolvedWithEnd = flares.filter((f) => f.endDate)
      const avgDuration =
        resolvedWithEnd.length > 0
          ? resolvedWithEnd.reduce((sum, f) => sum + (f.endDate! - f.startDate), 0) /
            resolvedWithEnd.length /
            (60 * 60 * 1000)
          : 0

      // Average severity
      const avgSeverity =
        flares.length > 0
          ? flares.reduce((sum, f) => sum + f.currentSeverity, 0) / flares.length
          : 0

      // Flares by month
      const monthCounts = new Map<string, number>()
      flares.forEach((f) => {
        const date = new Date(f.startDate)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1)
      })

      const flaresByMonth = Array.from(monthCounts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12)
        .map(([month, count]) => ({ month, count }))

      // Duration by region
      const regionData = new Map<string, { totalDuration: number; count: number }>()
      resolvedWithEnd.forEach((f) => {
        const duration = (f.endDate! - f.startDate) / (60 * 60 * 1000)
        const existing = regionData.get(f.bodyRegion) || { totalDuration: 0, count: 0 }
        regionData.set(f.bodyRegion, {
          totalDuration: existing.totalDuration + duration,
          count: existing.count + 1,
        })
      })

      const durationByRegion = Array.from(regionData.entries())
        .map(([region, data]) => ({
          region,
          avgDuration: data.totalDuration / data.count,
          count: data.count,
        }))
        .sort((a, b) => b.avgDuration - a.avgDuration)

      // Intervention effectiveness
      const interventionEvents = flareEvents.filter(
        (e) => e.eventType === 'intervention' && e.interventionType
      )
      const interventionData = new Map<
        string,
        { totalReduction: number; count: number }
      >()

      for (const event of interventionEvents) {
        const flare = flares.find((f) => f.guid === event.flareId)
        if (!flare || !event.interventionType) continue

        // Find next severity update after intervention
        const nextSeverityUpdate = flareEvents.find(
          (e) =>
            e.flareId === event.flareId &&
            e.eventType === 'severity_update' &&
            e.timestamp > event.timestamp &&
            e.severity !== undefined
        )

        if (nextSeverityUpdate?.severity !== undefined && event.severity !== undefined) {
          const reduction = event.severity - nextSeverityUpdate.severity
          const existing = interventionData.get(event.interventionType) || {
            totalReduction: 0,
            count: 0,
          }
          interventionData.set(event.interventionType, {
            totalReduction: existing.totalReduction + reduction,
            count: existing.count + 1,
          })
        }
      }

      const interventionEffectiveness = Array.from(interventionData.entries())
        .map(([type, data]) => ({
          type,
          avgReduction: data.totalReduction / data.count,
          count: data.count,
        }))
        .sort((a, b) => b.avgReduction - a.avgReduction)

      setMetrics({
        totalFlares: flares.length,
        activeFlares,
        resolvedFlares,
        avgDuration,
        avgSeverity,
        improvingCount,
        worseningCount,
        flaresByMonth,
        durationByRegion,
        interventionEffectiveness,
      })
    } catch (error) {
      console.error('Error loading flare metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours.toFixed(1)} hours`
    const days = hours / 24
    return `${days.toFixed(1)} days`
  }

  const getMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading flare metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flare Metrics</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metrics?.totalFlares || 0} flares analyzed
              </p>
            </div>
            <Link
              href="/analytics"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Analytics
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="180d">Last 6 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Flares</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {metrics?.activeFlares || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {metrics?.resolvedFlares || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatDuration(metrics?.avgDuration || 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Severity</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {(metrics?.avgSeverity || 0).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Flare Status Breakdown
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-700 dark:text-gray-300">Active</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics?.activeFlares || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">Improving</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics?.improvingCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-gray-700 dark:text-gray-300">Worsening</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics?.worseningCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Resolved</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics?.resolvedFlares || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Intervention Effectiveness */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Intervention Effectiveness
            </h2>
            {metrics?.interventionEffectiveness && metrics.interventionEffectiveness.length > 0 ? (
              <div className="space-y-3">
                {metrics.interventionEffectiveness.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{item.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.count}x used
                      </span>
                      <span
                        className={`font-medium ${item.avgReduction > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}
                      >
                        {item.avgReduction > 0 ? '-' : ''}
                        {item.avgReduction.toFixed(1)} severity
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No intervention data available
              </p>
            )}
          </div>
        </div>

        {/* Flares Over Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Flares Over Time
          </h2>
          {metrics?.flaresByMonth && metrics.flaresByMonth.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-2">
              {metrics.flaresByMonth.map((item) => {
                const maxCount = Math.max(...metrics.flaresByMonth.map((m) => m.count))
                const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {getMonthLabel(item.month)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No flare history to display
            </p>
          )}
        </div>

        {/* Duration by Region */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Average Duration by Body Region
          </h2>
          {metrics?.durationByRegion && metrics.durationByRegion.length > 0 ? (
            <div className="space-y-3">
              {metrics.durationByRegion.map((item) => {
                const maxDuration = Math.max(...metrics.durationByRegion.map((r) => r.avgDuration))
                const widthPercent =
                  maxDuration > 0 ? (item.avgDuration / maxDuration) * 100 : 0

                return (
                  <div key={item.region}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">
                        {item.region.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDuration(item.avgDuration)} ({item.count} flares)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No duration data available
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
