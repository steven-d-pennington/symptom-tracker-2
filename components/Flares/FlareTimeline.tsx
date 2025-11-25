'use client'

import { FlareEvent } from '@/lib/db'

interface FlareTimelineProps {
  events: FlareEvent[]
}

function getEventIcon(eventType: FlareEvent['eventType']): string {
  switch (eventType) {
    case 'created':
      return '🆕'
    case 'severity_update':
      return '📊'
    case 'trend_change':
      return '📈'
    case 'intervention':
      return '💊'
    case 'resolved':
      return '✅'
    default:
      return '📝'
  }
}

function getEventTitle(event: FlareEvent): string {
  switch (event.eventType) {
    case 'created':
      return 'Flare Started'
    case 'severity_update':
      return `Severity Updated to ${event.severity}`
    case 'trend_change':
      return `Trend: ${event.trend?.charAt(0).toUpperCase()}${event.trend?.slice(1) || 'Unknown'}`
    case 'intervention':
      return `Intervention: ${event.interventionType?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown'}`
    case 'resolved':
      return 'Flare Resolved'
    default:
      return 'Event'
  }
}

function getEventColor(eventType: FlareEvent['eventType']): string {
  switch (eventType) {
    case 'created':
      return 'bg-blue-500'
    case 'severity_update':
      return 'bg-amber-500'
    case 'trend_change':
      return 'bg-purple-500'
    case 'intervention':
      return 'bg-green-500'
    case 'resolved':
      return 'bg-emerald-500'
    default:
      return 'bg-gray-500'
  }
}

export function FlareTimeline({ events }: FlareTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No events recorded yet
      </div>
    )
  }

  // Sort events by timestamp (newest first for display)
  const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <div key={event.guid} className="relative flex gap-4">
          {/* Timeline line */}
          {index < sortedEvents.length - 1 && (
            <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
          )}

          {/* Event dot */}
          <div
            className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${getEventColor(event.eventType)} flex items-center justify-center text-white shadow-md`}
          >
            <span className="text-lg">{getEventIcon(event.eventType)}</span>
          </div>

          {/* Event content */}
          <div className="flex-1 pb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {getEventTitle(event)}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                {event.severity && event.eventType !== 'resolved' && (
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {event.severity}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">
                      severity
                    </span>
                  </div>
                )}
              </div>

              {/* Additional details */}
              {event.notes && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded p-2">
                  {event.notes}
                </p>
              )}

              {event.interventionDetails && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Details:</span> {event.interventionDetails}
                </p>
              )}

              {event.trend && event.eventType === 'trend_change' && (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      event.trend === 'improving'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : event.trend === 'worsening'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {event.trend === 'improving' && '↓ '}
                    {event.trend === 'worsening' && '↑ '}
                    {event.trend === 'stable' && '→ '}
                    {event.trend}
                  </span>
                </div>
              )}

              {event.resolutionNotes && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Resolution notes:</span> {event.resolutionNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
