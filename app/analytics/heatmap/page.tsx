'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  calculateProblemAreas,
  ProblemAreasReport,
  getHeatColor,
  exportProblemAreasCSV,
} from '@/lib/analytics/problemAreas'
import { BodyMap } from '@/components/BodyMap'

type DateRange = '30d' | '90d' | '180d' | 'all'

export default function HeatMapPage() {
  const [report, setReport] = useState<ProblemAreasReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('90d')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = Date.now()
      let startDate: number | undefined

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
          startDate = undefined
          break
      }

      const data = await calculateProblemAreas({
        startDate,
        endDate: now,
      })
      setReport(data)
    } catch (error) {
      console.error('Error loading heat map data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExport = () => {
    if (!report) return

    const csv = exportProblemAreasCSV(report)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `problem-areas-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getRegionStats = (regionName: string) => {
    return report?.areas.find(
      (a) => a.region.toLowerCase() === regionName.toLowerCase()
    )
  }

  const selectedStats = selectedRegion ? getRegionStats(selectedRegion) : null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Analyzing problem areas...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Problem Areas Heat Map
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {report?.totalFlares || 0} flares, {report?.totalSymptoms || 0} symptoms analyzed
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
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
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

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Body Map */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Click a region to see details
            </h2>

            <div className="relative">
              <BodyMap
                onRegionClick={(region) => setSelectedRegion(region)}
                selectedRegion={selectedRegion}
              />
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatColor('low') }} />
                <span className="text-xs text-gray-600 dark:text-gray-400">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getHeatColor('medium') }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatColor('high') }} />
                <span className="text-xs text-gray-600 dark:text-gray-400">High</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getHeatColor('critical') }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Critical</span>
              </div>
            </div>
          </div>

          {/* Region Details / Rankings */}
          <div className="space-y-6">
            {/* Selected Region Details */}
            {selectedStats ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                  {selectedRegion?.replace(/_/g, ' ')} Details
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStats.totalEvents}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Flares</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {selectedStats.flareCount}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Severity</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {selectedStats.avgSeverity.toFixed(1)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedStats.avgDuration.toFixed(0)}h
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recent Activity (30 days)</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedStats.recentFlares} new flares
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Click on a body region to see detailed statistics
                </p>
              </div>
            )}

            {/* Problem Areas Ranking */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Problem Areas Ranking
              </h2>

              {report?.areas && report.areas.length > 0 ? (
                <div className="space-y-3">
                  {report.areas.slice(0, 10).map((area, index) => (
                    <div
                      key={area.region}
                      onClick={() => setSelectedRegion(area.region)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedRegion === area.region
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                          index === 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : index === 1
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : index === 2
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium capitalize">
                          {area.region.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {area.flareCount} flares, {area.symptomCount} symptoms
                        </p>
                      </div>

                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getHeatColor(area.heatLevel) }}
                        title={area.heatLevel}
                      />

                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {area.totalEvents}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No problem areas detected. Keep tracking your symptoms!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
