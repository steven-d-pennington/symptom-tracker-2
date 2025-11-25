'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { db, Symptom, SymptomInstance } from '@/lib/db'

type DateRange = '7d' | '30d' | '90d' | 'all'

interface SymptomStats {
  symptom: Symptom
  totalCount: number
  avgSeverity: number
  trend: 'increasing' | 'decreasing' | 'stable'
  byDayOfWeek: number[]
  byHourOfDay: number[]
  recentInstances: SymptomInstance[]
}

interface SymptomTrends {
  symptoms: SymptomStats[]
  totalInstances: number
  mostFrequent: SymptomStats | null
  highestSeverity: SymptomStats | null
}

export default function SymptomTrendsPage() {
  const [trends, setTrends] = useState<SymptomTrends | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = Date.now()
      let startDate: number

      switch (dateRange) {
        case '7d':
          startDate = now - 7 * 24 * 60 * 60 * 1000
          break
        case '30d':
          startDate = now - 30 * 24 * 60 * 60 * 1000
          break
        case '90d':
          startDate = now - 90 * 24 * 60 * 60 * 1000
          break
        case 'all':
        default:
          startDate = 0
          break
      }

      // Get all symptoms
      const symptoms = await db.symptoms.filter((s) => s.isActive).toArray()

      // Get all symptom instances in date range
      const instances = await db.symptomInstances
        .filter((i) => i.timestamp >= startDate)
        .toArray()

      // Calculate stats for each symptom
      const symptomStats: SymptomStats[] = []

      for (const symptom of symptoms) {
        const symptomInstances = instances.filter((i) => i.symptomId === symptom.guid)

        if (symptomInstances.length === 0) continue

        const totalCount = symptomInstances.length
        const avgSeverity =
          symptomInstances.reduce((sum, i) => sum + i.severity, 0) / totalCount

        // Calculate trend (compare first half to second half)
        const midpoint = startDate + (now - startDate) / 2
        const firstHalf = symptomInstances.filter((i) => i.timestamp < midpoint)
        const secondHalf = symptomInstances.filter((i) => i.timestamp >= midpoint)

        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
        if (firstHalf.length > 0 && secondHalf.length > 0) {
          const firstAvg = firstHalf.reduce((sum, i) => sum + i.severity, 0) / firstHalf.length
          const secondAvg = secondHalf.reduce((sum, i) => sum + i.severity, 0) / secondHalf.length
          const diff = secondAvg - firstAvg
          if (diff > 0.5) trend = 'increasing'
          else if (diff < -0.5) trend = 'decreasing'
        }

        // By day of week
        const byDayOfWeek = [0, 0, 0, 0, 0, 0, 0]
        symptomInstances.forEach((i) => {
          const day = new Date(i.timestamp).getDay()
          byDayOfWeek[day]++
        })

        // By hour of day
        const byHourOfDay = new Array(24).fill(0)
        symptomInstances.forEach((i) => {
          const hour = new Date(i.timestamp).getHours()
          byHourOfDay[hour]++
        })

        symptomStats.push({
          symptom,
          totalCount,
          avgSeverity,
          trend,
          byDayOfWeek,
          byHourOfDay,
          recentInstances: symptomInstances.slice(-10).reverse(),
        })
      }

      // Sort by frequency
      symptomStats.sort((a, b) => b.totalCount - a.totalCount)

      const mostFrequent = symptomStats[0] || null
      const highestSeverity =
        [...symptomStats].sort((a, b) => b.avgSeverity - a.avgSeverity)[0] || null

      setTrends({
        symptoms: symptomStats,
        totalInstances: instances.length,
        mostFrequent,
        highestSeverity,
      })
    } catch (error) {
      console.error('Error loading symptom trends:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const selectedStats = trends?.symptoms.find((s) => s.symptom.guid === selectedSymptom)

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getTrendIcon = (trend: SymptomStats['trend']) => {
    switch (trend) {
      case 'increasing':
        return '📈'
      case 'decreasing':
        return '📉'
      default:
        return '➡️'
    }
  }

  const getTrendColor = (trend: SymptomStats['trend']) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600 dark:text-red-400'
      case 'decreasing':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Analyzing symptom trends...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Symptom Trends</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {trends?.totalInstances || 0} symptom logs analyzed
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
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Summary Cards */}
        {trends && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {trends.mostFrequent && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Frequent</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {trends.mostFrequent.symptom.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {trends.mostFrequent.totalCount} occurrences
                </p>
              </div>
            )}
            {trends.highestSeverity && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Highest Severity</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {trends.highestSeverity.symptom.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg: {trends.highestSeverity.avgSeverity.toFixed(1)} / 10
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Symptom List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Symptoms by Frequency
            </h2>

            {trends?.symptoms && trends.symptoms.length > 0 ? (
              <div className="space-y-2">
                {trends.symptoms.map((stat) => (
                  <button
                    key={stat.symptom.guid}
                    onClick={() => setSelectedSymptom(stat.symptom.guid)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSymptom === stat.symptom.guid
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stat.symptom.name}
                      </span>
                      <span className={getTrendColor(stat.trend)}>
                        {getTrendIcon(stat.trend)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.totalCount} logs
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Avg: {stat.avgSeverity.toFixed(1)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No symptoms logged in this period
              </p>
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStats ? (
              <>
                {/* Symptom Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedStats.symptom.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedStats.symptom.category}
                      </p>
                    </div>
                    <div className={`text-right ${getTrendColor(selectedStats.trend)}`}>
                      <span className="text-2xl">{getTrendIcon(selectedStats.trend)}</span>
                      <p className="text-sm capitalize">{selectedStats.trend}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedStats.totalCount}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Severity</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedStats.avgSeverity.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Day of Week Pattern */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Day of Week Pattern
                  </h3>
                  <div className="flex items-end justify-between h-32 gap-2">
                    {selectedStats.byDayOfWeek.map((count, index) => {
                      const max = Math.max(...selectedStats.byDayOfWeek)
                      const heightPercent = max > 0 ? (count / max) * 100 : 0

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {count}
                          </span>
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all"
                            style={{ height: `${Math.max(heightPercent, 5)}%` }}
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {DAYS[index]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Time of Day Pattern */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Time of Day Pattern
                  </h3>
                  <div className="flex items-end justify-between h-32 gap-px">
                    {selectedStats.byHourOfDay.map((count, index) => {
                      const max = Math.max(...selectedStats.byHourOfDay)
                      const heightPercent = max > 0 ? (count / max) * 100 : 0

                      return (
                        <div
                          key={index}
                          className="flex-1 bg-purple-500 rounded-t transition-all"
                          style={{ height: `${Math.max(heightPercent, 2)}%` }}
                          title={`${index}:00 - ${count} logs`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">12 AM</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">6 AM</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">12 PM</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">6 PM</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">12 AM</span>
                  </div>
                </div>

                {/* Recent Logs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Logs
                  </h3>
                  <div className="space-y-2">
                    {selectedStats.recentInstances.map((instance) => (
                      <div
                        key={instance.guid}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(instance.timestamp).toLocaleString()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            instance.severity >= 7
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : instance.severity >= 4
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          Severity: {instance.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a symptom to view detailed trends
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
