'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { DailyEntry, db } from '@/lib/db'
import {
  getDailyEntryByDate,
  getRecentDailyEntries,
  getTodayKey,
  MOOD_OPTIONS,
  Mood,
} from '@/lib/daily/saveDailyEntry'
import { DailyEntryForm } from '@/components/Daily'
import { DailyHSCheckInCompact } from '@/components/hs'
import { calculateCurrentIHS4, HSLesion, IHS4Result } from '@/lib/hs'

export default function DailyReflectionPage() {
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null)
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(getTodayKey())

  // HS tracking state
  const [hsLesions, setHsLesions] = useState<HSLesion[]>([])
  const [ihs4Result, setIhs4Result] = useState<IHS4Result>({
    score: 0,
    severity: 'mild',
    breakdown: { nodules: 0, abscesses: 0, drainingTunnels: 0 },
    lesionIds: [],
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [today, recent, activeLesions] = await Promise.all([
        getDailyEntryByDate(selectedDate),
        getRecentDailyEntries(14),
        db.hsLesions
          .filter((lesion) => lesion.status === 'active' || lesion.status === 'healing')
          .toArray(),
      ])
      setTodayEntry(today || null)
      setRecentEntries(recent)

      // Update HS data
      setHsLesions(activeLesions)
      setIhs4Result(calculateCurrentIHS4(activeLesions))
    } catch (error) {
      console.error('Error loading daily entries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = () => {
    loadData()
  }

  const getMoodEmoji = (mood?: Mood) => {
    const option = MOOD_OPTIONS.find((o) => o.value === mood)
    return option?.emoji || '😐'
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    const today = getTodayKey()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().split('T')[0]

    if (dateStr === today) return 'Today'
    if (dateStr === yesterdayKey) return 'Yesterday'

    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const getScoreColor = (score: number, isStress: boolean = false) => {
    if (isStress) {
      // For stress, lower is better
      if (score <= 3) return 'text-green-600 dark:text-green-400'
      if (score <= 6) return 'text-yellow-600 dark:text-yellow-400'
      return 'text-red-600 dark:text-red-400'
    }
    // For other scores, higher is better
    if (score >= 7) return 'text-green-600 dark:text-green-400'
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0
    const today = new Date()

    for (let i = 0; i < recentEntries.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      const expectedKey = expectedDate.toISOString().split('T')[0]

      if (recentEntries.some((e) => e.date === expectedKey)) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading daily reflection</p>
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
                Daily Reflection
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {streak > 0 ? `${streak} day streak!` : 'Start your streak today'}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Entry Form */}
          <div className="lg:col-span-2">
            {/* Date Selector */}
            <div className="mb-6 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getTodayKey()}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <Link
                href="/daily/calendar"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Calendar
              </Link>
              {selectedDate !== getTodayKey() && (
                <button
                  onClick={() => setSelectedDate(getTodayKey())}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Go to Today
                </button>
              )}
            </div>

            <DailyEntryForm
              date={selectedDate}
              existingEntry={todayEntry}
              onSave={handleSave}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* HS Quick Check-In Widget */}
            <DailyHSCheckInCompact
              currentIHS4Score={ihs4Result.score}
              currentSeverity={ihs4Result.severity}
              activeLesionCount={hsLesions.length}
            />

            {/* Recent Entries */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Entries
              </h2>

            {recentEntries.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No entries yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Start by completing today&apos;s reflection
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <button
                    key={entry.guid}
                    onClick={() => setSelectedDate(entry.date)}
                    className={`w-full text-left bg-white dark:bg-gray-800 rounded-lg border p-4 transition-all ${
                      selectedDate === entry.date
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(entry.date)}
                      </span>
                      <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <div className={`font-bold ${getScoreColor(entry.overallHealthScore)}`}>
                          {entry.overallHealthScore}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Health</div>
                      </div>
                      <div>
                        <div className={`font-bold ${getScoreColor(entry.energyLevel)}`}>
                          {entry.energyLevel}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Energy</div>
                      </div>
                      <div>
                        <div className={`font-bold ${getScoreColor(entry.sleepQuality)}`}>
                          {entry.sleepQuality}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Sleep</div>
                      </div>
                      <div>
                        <div className={`font-bold ${getScoreColor(entry.stressLevel, true)}`}>
                          {entry.stressLevel}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Stress</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
