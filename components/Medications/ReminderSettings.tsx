'use client'

import { useState } from 'react'
import { Medication } from '@/lib/db'
import { useReminders } from '@/lib/medications/useReminders'

interface ReminderSettingsProps {
  medications: Medication[]
  onSnooze?: (medication: Medication, minutes: number) => void
}

export function ReminderSettings({ medications, onSnooze }: ReminderSettingsProps) {
  const {
    activeReminders,
    hasPermission,
    isEnabled,
    requestPermission,
    getNextReminder,
    formatTimeUntil
  } = useReminders()

  const [showSnoozeMenu, setShowSnoozeMenu] = useState<string | null>(null)

  if (!isEnabled) {
    return (
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-purple-800 dark:text-purple-200">
              Medication Reminders
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Enable reminders in Settings to get notified when it&apos;s time to take your medications.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Enable Notifications
            </h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Allow notifications to receive medication reminders.
            </p>
          </div>
          <button
            onClick={() => requestPermission()}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            Enable
          </button>
        </div>
      </div>
    )
  }

  // Get upcoming reminders for active medications
  const upcomingReminders = medications
    .filter((m) => m.isActive)
    .map((m) => ({
      medication: m,
      nextReminder: getNextReminder(m),
    }))
    .filter((r) => r.nextReminder)
    .sort((a, b) => a.nextReminder!.getTime() - b.nextReminder!.getTime())
    .slice(0, 5)

  if (upcomingReminders.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
          Upcoming Reminders
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No upcoming medication reminders scheduled.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          Upcoming Reminders
        </h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {upcomingReminders.map(({ medication, nextReminder }) => (
          <div
            key={medication.guid}
            className="p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💊</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {medication.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {medication.dosage} • {nextReminder!.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {formatTimeUntil(nextReminder!)}
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowSnoozeMenu(
                    showSnoozeMenu === medication.guid ? null : medication.guid
                  )}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Snooze options"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                {showSnoozeMenu === medication.guid && (
                  <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <button
                      onClick={() => {
                        onSnooze?.(medication, 15)
                        setShowSnoozeMenu(null)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                    >
                      15 minutes
                    </button>
                    <button
                      onClick={() => {
                        onSnooze?.(medication, 30)
                        setShowSnoozeMenu(null)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      30 minutes
                    </button>
                    <button
                      onClick={() => {
                        onSnooze?.(medication, 60)
                        setShowSnoozeMenu(null)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                    >
                      1 hour
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
