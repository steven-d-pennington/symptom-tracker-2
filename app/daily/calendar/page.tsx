'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DailyEntry } from '@/lib/db'
import { getAllDailyEntries, getTodayKey, MOOD_OPTIONS, Mood } from '@/lib/daily/saveDailyEntry'
import { HealthCalendar } from '@/components/Daily'

export default function CalendarPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | undefined>()

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const allEntries = await getAllDailyEntries()
      setEntries(allEntries)
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
  }

  const handleEditEntry = () => {
    if (selectedDate) {
      router.push(`/daily?date=${selectedDate}`)
    }
  }

  // Get selected entry
  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null
    return entries.find((e) => e.date === selectedDate) || null
  }, [entries, selectedDate])

  // Calculate patterns
  const patterns = useMemo(() => {
    if (entries.length < 7) return null

    // Calculate average by day of week
    const dayAverages: Record<number, { total: number; count: number }> = {}
    entries.forEach((entry) => {
      const date = new Date(entry.date + 'T12:00:00')
      const day = date.getDay()
      if (!dayAverages[day]) {
        dayAverages[day] = { total: 0, count: 0 }
      }
      dayAverages[day].total += entry.overallHealthScore
      dayAverages[day].count++
    })

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    let worstDay = { day: '', avg: 10 }
    let bestDay = { day: '', avg: 0 }

    Object.entries(dayAverages).forEach(([day, data]) => {
      if (data.count >= 2) {
        const avg = data.total / data.count
        if (avg < worstDay.avg) {
          worstDay = { day: dayNames[parseInt(day)], avg }
        }
        if (avg > bestDay.avg) {
          bestDay = { day: dayNames[parseInt(day)], avg }
        }
      }
    })

    return { worstDay, bestDay }
  }, [entries])

  const getMoodEmoji = (mood?: Mood) => {
    const option = MOOD_OPTIONS.find((o) => o.value === mood)
    return option?.emoji || '😐'
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading calendar</p>
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
                Health Calendar
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {entries.length} days tracked
              </p>
            </div>
            <Link
              href="/daily"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Daily Reflection
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <HealthCalendar
              entries={entries}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Day Details */}
            {selectedDate && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {formatDate(selectedDate)}
                </h3>

                {selectedEntry ? (
                  <div className="space-y-4">
                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedEntry.overallHealthScore}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Health</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedEntry.energyLevel}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Energy</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedEntry.sleepQuality}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Sleep</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {selectedEntry.stressLevel}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Stress</div>
                      </div>
                    </div>

                    {/* Mood */}
                    {selectedEntry.mood && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getMoodEmoji(selectedEntry.mood)}</span>
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {selectedEntry.mood}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedEntry.notes && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedEntry.notes}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleEditEntry}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Edit Entry
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No entry for this day</p>
                    <button
                      onClick={handleEditEntry}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Add Entry
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Patterns */}
            {patterns && (patterns.bestDay.day || patterns.worstDay.day) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Patterns Detected
                </h3>
                <div className="space-y-3">
                  {patterns.bestDay.day && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">↑</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Best days: <strong>{patterns.bestDay.day}s</strong> (avg {patterns.bestDay.avg.toFixed(1)})
                      </span>
                    </div>
                  )}
                  {patterns.worstDay.day && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">↓</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Challenging days: <strong>{patterns.worstDay.day}s</strong> (avg {patterns.worstDay.avg.toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Overall Stats
              </h3>
              {entries.length > 0 ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Avg Health</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {(entries.reduce((a, e) => a + e.overallHealthScore, 0) / entries.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Avg Energy</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {(entries.reduce((a, e) => a + e.energyLevel, 0) / entries.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Avg Sleep</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {(entries.reduce((a, e) => a + e.sleepQuality, 0) / entries.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Avg Stress</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {(entries.reduce((a, e) => a + e.stressLevel, 0) / entries.length).toFixed(1)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No entries yet. Start tracking to see stats.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
