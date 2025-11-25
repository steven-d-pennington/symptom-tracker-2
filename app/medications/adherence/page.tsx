'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  AdherenceReport,
  calculateOverallAdherence,
  getDateRangePreset,
  exportAdherenceToCSV,
  getAdherenceStatus,
} from '@/lib/medications/adherenceTracking'

type DateRangePreset = 'week' | 'month' | 'quarter' | 'year'

export default function AdherencePage() {
  const [report, setReport] = useState<AdherenceReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [preset, setPreset] = useState<DateRangePreset>('month')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { start, end } = getDateRangePreset(preset)
      const data = await calculateOverallAdherence(start, end)
      setReport(data)
    } catch (error) {
      console.error('Error loading adherence data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [preset])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExportCSV = () => {
    if (!report) return
    const csv = exportAdherenceToCSV(report)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `adherence-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Calculating adherence data</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Error</div>
          <p className="text-gray-600 dark:text-gray-400">Could not load adherence data</p>
        </div>
      </div>
    )
  }

  const status = getAdherenceStatus(report.overallAdherence)

  const statusColors = {
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
    red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Adherence Tracking
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {report.dateRange.start.toLocaleDateString()} -{' '}
                {report.dateRange.end.toLocaleDateString()}
              </p>
            </div>
            <Link
              href="/medications"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Medications
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          {/* Date Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as DateRangePreset[]).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  preset === p
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Overall Adherence */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Overall Adherence
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                {report.overallAdherence.toFixed(1)}%
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status.color]}`}>
                {status.label}
              </span>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {report.totalTaken}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Doses Taken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {report.totalSkipped}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Doses Skipped</div>
              </div>
            </div>
          </div>

          {/* Simple Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  report.overallAdherence >= 90
                    ? 'bg-green-500'
                    : report.overallAdherence >= 75
                      ? 'bg-yellow-500'
                      : report.overallAdherence >= 50
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(report.overallAdherence, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        {report.weeklyTrend.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Weekly Trend
            </h2>
            <div className="flex items-end gap-2 h-48">
              {report.weeklyTrend.map((week, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t transition-all ${
                      week.adherenceRate >= 90
                        ? 'bg-green-500'
                        : week.adherenceRate >= 75
                          ? 'bg-yellow-500'
                          : week.adherenceRate >= 50
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                    }`}
                    style={{ height: `${Math.max(week.adherenceRate, 5)}%` }}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per Medication Breakdown */}
        {report.byMedication.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              By Medication
            </h2>
            <div className="space-y-4">
              {report.byMedication.map((med) => {
                const medStatus = getAdherenceStatus(med.adherenceRate)
                return (
                  <div key={med.medicationId} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {med.medicationName}
                        </span>
                        <span className={`text-sm font-medium ${
                          med.adherenceRate >= 90
                            ? 'text-green-600 dark:text-green-400'
                            : med.adherenceRate >= 75
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : med.adherenceRate >= 50
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-red-600 dark:text-red-400'
                        }`}>
                          {med.adherenceRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            med.adherenceRate >= 90
                              ? 'bg-green-500'
                              : med.adherenceRate >= 75
                                ? 'bg-yellow-500'
                                : med.adherenceRate >= 50
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(med.adherenceRate, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {med.taken} taken / {med.skipped} skipped
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Missed Doses */}
        {report.missedDoses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Missed Doses
            </h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {report.missedDoses.slice(0, 20).map((missed, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {missed.medication.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {missed.date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  {missed.reason && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 italic max-w-xs truncate">
                      {missed.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {report.missedDoses.length > 20 && (
              <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                Showing 20 of {report.missedDoses.length} missed doses
              </div>
            )}
          </div>
        )}

        {/* No Data State */}
        {report.totalTaken === 0 && report.totalSkipped === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start logging your medication doses to see adherence data.
            </p>
            <Link
              href="/medications"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Go to Medications
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
