'use client'

import { useState, useMemo } from 'react'
import { DailyEntry } from '@/lib/db'
import { MOOD_OPTIONS, Mood } from '@/lib/daily/saveDailyEntry'

interface HealthCalendarProps {
  entries: DailyEntry[]
  onSelectDate: (date: string) => void
  selectedDate?: string
}

type ViewMode = 'month' | 'week'

function getHealthColor(score: number): string {
  if (score >= 8) return 'bg-green-500'
  if (score >= 6) return 'bg-green-400'
  if (score >= 4) return 'bg-yellow-400'
  if (score >= 2) return 'bg-orange-400'
  return 'bg-red-400'
}

function getHealthBgColor(score: number): string {
  if (score >= 8) return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
  if (score >= 6) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  if (score >= 4) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
  if (score >= 2) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
  return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
}

export function HealthCalendar({ entries, onSelectDate, selectedDate }: HealthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  // Create a map of entries by date
  const entriesByDate = useMemo(() => {
    const map = new Map<string, DailyEntry>()
    entries.forEach((entry) => {
      map.set(entry.date, entry)
    })
    return map
  }, [entries])

  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]

  // Get calendar days
  const calendarDays = useMemo(() => {
    if (viewMode === 'week') {
      // Week view - get current week
      const days: Date[] = []
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek)
        day.setDate(startOfWeek.getDate() + i)
        days.push(day)
      }
      return days
    }

    // Month view
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: Date[] = []

    // Add days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i)
      days.push(day)
    }

    // Add all days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // Add days from next month to fill last week
    const remainingDays = 42 - days.length // 6 weeks × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }, [currentDate, viewMode])

  const navigatePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        newDate.setDate(prev.getDate() - 7)
        return newDate
      })
    } else {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    }
  }

  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        newDate.setDate(prev.getDate() + 7)
        return newDate
      })
    } else {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getMoodEmoji = (mood?: Mood) => {
    const option = MOOD_OPTIONS.find((o) => o.value === mood)
    return option?.emoji || ''
  }

  const currentMonth = currentDate.getMonth()
  const headerText =
    viewMode === 'week'
      ? `Week of ${calendarDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {headerText}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mr-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Week
            </button>
          </div>

          {/* Navigation */}
          <button
            onClick={navigatePrev}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={navigateNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 gap-1 ${viewMode === 'week' ? '' : ''}`}>
        {calendarDays.map((day, index) => {
          const dateKey = day.toISOString().split('T')[0]
          const entry = entriesByDate.get(dateKey)
          const isCurrentMonth = day.getMonth() === currentMonth
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate
          const isFuture = day > today

          return (
            <button
              key={index}
              onClick={() => !isFuture && onSelectDate(dateKey)}
              disabled={isFuture}
              className={`relative p-2 rounded-lg border transition-all ${
                viewMode === 'week' ? 'min-h-[100px]' : 'min-h-[60px]'
              } ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800'
                  : ''
              } ${
                entry
                  ? getHealthBgColor(entry.overallHealthScore)
                  : isCurrentMonth
                    ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    : 'bg-gray-100 dark:bg-gray-950 border-gray-100 dark:border-gray-800 opacity-50'
              } ${isFuture ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Date Number */}
              <div
                className={`text-sm font-medium ${
                  isToday
                    ? 'w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-full'
                    : entry
                      ? 'text-gray-900 dark:text-gray-100'
                      : isCurrentMonth
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {day.getDate()}
              </div>

              {/* Entry Info */}
              {entry && (
                <div className="mt-1">
                  {/* Health Score */}
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(entry.overallHealthScore)}`} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {entry.overallHealthScore}
                    </span>
                    {entry.mood && (
                      <span className="text-xs">{getMoodEmoji(entry.mood)}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Add Entry Indicator */}
              {!entry && !isFuture && isCurrentMonth && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gray-400 dark:text-gray-500">+ Add</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Great (8-10)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-400" />
            <span className="text-gray-600 dark:text-gray-400">Okay (4-7)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span className="text-gray-600 dark:text-gray-400">Poor (1-3)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
