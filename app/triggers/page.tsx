'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TriggerEvent, Trigger } from '@/lib/db'
import { getTriggerEvents, deleteTriggerEvent, getActiveTriggers, Intensity } from '@/lib/triggers/logTrigger'
import { TriggerCard, TriggerLoggerModal } from '@/components/Triggers'

type FilterPeriod = 'today' | 'week' | 'month' | 'all'

export default function TriggersPage() {
  const [events, setEvents] = useState<TriggerEvent[]>([])
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterTriggerId, setFilterTriggerId] = useState<string>('all')
  const [filterIntensity, setFilterIntensity] = useState<Intensity | 'all'>('all')
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [allEvents, allTriggers] = await Promise.all([
        getTriggerEvents(),
        getActiveTriggers(),
      ])
      setEvents(allEvents)
      setTriggers(allTriggers)
    } catch (error) {
      console.error('Error loading triggers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleModalSuccess = () => {
    loadData()
  }

  const handleDeleteEvent = async (guid: string) => {
    if (confirm('Are you sure you want to delete this trigger log?')) {
      try {
        await deleteTriggerEvent(guid)
        loadData()
      } catch (error) {
        console.error('Error deleting trigger event:', error)
      }
    }
  }

  // Filter events
  const filteredEvents = events.filter((event) => {
    // Filter by trigger
    if (filterTriggerId !== 'all' && event.triggerId !== filterTriggerId) {
      return false
    }

    // Filter by intensity
    if (filterIntensity !== 'all' && event.intensity !== filterIntensity) {
      return false
    }

    // Filter by period
    const now = new Date()
    const eventDate = new Date(event.timestamp)

    switch (filterPeriod) {
      case 'today': {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return eventDate >= startOfToday
      }
      case 'week': {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return eventDate >= oneWeekAgo
      }
      case 'month': {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        return eventDate >= oneMonthAgo
      }
      case 'all':
      default:
        return true
    }
  })

  // Group events by date
  const eventsByDate = filteredEvents.reduce(
    (acc, event) => {
      const date = new Date(event.timestamp).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(event)
      return acc
    },
    {} as Record<string, TriggerEvent[]>
  )

  // Sort dates (most recent first)
  const sortedDates = Object.keys(eventsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  // Count today's events
  const todaysEventCount = events.filter((event) => {
    const today = new Date()
    const eventDate = new Date(event.timestamp)
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    )
  }).length

  // Get unique triggers that have been logged
  const loggedTriggerIds = new Set(events.map((e) => e.triggerId))
  const loggedTriggers = triggers.filter((t) => loggedTriggerIds.has(t.guid))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading...</div>
          <p className="text-gray-600 dark:text-gray-400">Loading trigger logs</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trigger Log</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {todaysEventCount} {todaysEventCount === 1 ? 'trigger' : 'triggers'} logged today
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
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Trigger Filter */}
            {loggedTriggers.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trigger:
                </label>
                <select
                  value={filterTriggerId}
                  onChange={(e) => setFilterTriggerId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Triggers</option>
                  {loggedTriggers.map((trigger) => (
                    <option key={trigger.guid} value={trigger.guid}>
                      {trigger.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Intensity Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Intensity:
              </label>
              <select
                value={filterIntensity}
                onChange={(e) => setFilterIntensity(e.target.value as Intensity | 'all')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Period:
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Log Trigger Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            + Log Trigger
          </button>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Triggers Logged
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking triggers to identify patterns and correlations.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Log Your First Trigger
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateStr) => {
              const dateEvents = eventsByDate[dateStr]
              const isToday = new Date().toDateString() === dateStr

              return (
                <div key={dateStr}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {isToday ? 'Today' : new Date(dateStr).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {dateEvents.length} {dateEvents.length === 1 ? 'trigger' : 'triggers'}
                    </span>
                  </div>

                  {/* Events for this date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dateEvents.map((event) => (
                      <TriggerCard key={event.guid} event={event} onDelete={handleDeleteEvent} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Trigger Logger Modal */}
      <TriggerLoggerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
