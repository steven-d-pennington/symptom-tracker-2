'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { HSLesion, IHS4Result } from '@/lib/hs/types'
import { calculateIHS4ForDate } from '@/lib/hs/ihs4'
import { IHS4Badge } from '@/components/hs'
import { LESION_COLORS } from '@/components/BodyMap/HSLesionMarker'

interface HistoryEntry {
  date: string
  ihs4: IHS4Result
  lesions: HSLesion[]
  newLesions: number
  healedLesions: number
}

export default function HSHistoryPage() {
  const [allLesions, setAllLesions] = useState<HSLesion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Load all lesions
  useEffect(() => {
    async function loadLesions() {
      setIsLoading(true)
      try {
        const lesions = await db.hsLesions.toArray()
        setAllLesions(lesions)
      } catch (error) {
        console.error('Error loading lesions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadLesions()
  }, [])

  // Calculate history entries based on date range
  const historyEntries = useMemo(() => {
    if (allLesions.length === 0) return []

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    let startDate: Date
    switch (dateRange) {
      case '7d':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 90)
        break
      case 'all':
        // Find earliest lesion date
        const earliestDate = allLesions.reduce((earliest, lesion) => {
          const onset = new Date(lesion.onsetDate)
          return onset < earliest ? onset : earliest
        }, today)
        startDate = earliestDate
        break
    }

    const entries: HistoryEntry[] = []
    const currentDate = new Date(today)

    while (currentDate >= startDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const ihs4 = calculateIHS4ForDate(allLesions, dateStr)

      // Count new lesions on this date
      const newLesions = allLesions.filter(
        (l) => l.onsetDate === dateStr
      ).length

      // Count lesions healed on this date
      const healedLesions = allLesions.filter(
        (l) => l.healedDate === dateStr
      ).length

      // Get active lesions on this date
      const activeLesions = allLesions.filter((lesion) => {
        const onsetDate = new Date(lesion.onsetDate)
        const healedDate = lesion.healedDate ? new Date(lesion.healedDate) : null
        const targetDate = new Date(dateStr)
        targetDate.setHours(23, 59, 59, 999)

        return onsetDate <= targetDate && (!healedDate || healedDate > targetDate)
      })

      entries.push({
        date: dateStr,
        ihs4,
        lesions: activeLesions,
        newLesions,
        healedLesions,
      })

      currentDate.setDate(currentDate.getDate() - 1)
    }

    return entries
  }, [allLesions, dateRange])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (historyEntries.length === 0) {
      return { avgScore: 0, maxScore: 0, totalNewLesions: 0, totalHealedLesions: 0 }
    }

    const scores = historyEntries.map((e) => e.ihs4.score)
    const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    const maxScore = Math.max(...scores)
    const totalNewLesions = historyEntries.reduce((sum, e) => sum + e.newLesions, 0)
    const totalHealedLesions = historyEntries.reduce((sum, e) => sum + e.healedLesions, 0)

    return { avgScore, maxScore, totalNewLesions, totalHealedLesions }
  }, [historyEntries])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading history data</p>
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
                HS History
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your IHS4 score and lesion history over time
              </p>
            </div>
            <Link
              href="/hs"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to HS Tracker
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Average IHS4</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.avgScore}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Peak IHS4</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.maxScore}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">New Lesions</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">+{summaryStats.totalNewLesions}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Healed Lesions</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">-{summaryStats.totalHealedLesions}</div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Daily History</h2>
          </div>

          {historyEntries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No history data available</p>
              <Link
                href="/hs"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Tracking
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {historyEntries.map((entry) => (
                <div
                  key={entry.date}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="min-w-[100px]">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>

                      <IHS4Badge score={entry.ihs4.score} severity={entry.ihs4.severity} />

                      {/* Lesion breakdown */}
                      <div className="flex items-center gap-3 text-sm">
                        {entry.ihs4.breakdown.nodules > 0 && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: LESION_COLORS.nodule.fill }}
                            />
                            {entry.ihs4.breakdown.nodules}
                          </span>
                        )}
                        {entry.ihs4.breakdown.abscesses > 0 && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-3 h-3 rotate-45"
                              style={{ backgroundColor: LESION_COLORS.abscess.fill }}
                            />
                            {entry.ihs4.breakdown.abscesses}
                          </span>
                        )}
                        {entry.ihs4.breakdown.drainingTunnels > 0 && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent"
                              style={{ borderBottomColor: LESION_COLORS.draining_tunnel.fill }}
                            />
                            {entry.ihs4.breakdown.drainingTunnels}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Changes */}
                    <div className="flex items-center gap-3 text-sm">
                      {entry.newLesions > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          +{entry.newLesions} new
                        </span>
                      )}
                      {entry.healedLesions > 0 && (
                        <span className="text-green-600 dark:text-green-400">
                          -{entry.healedLesions} healed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
