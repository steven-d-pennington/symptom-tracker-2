'use client'

import { useState, useEffect, useCallback } from 'react'
import { SettingsSection, SettingsRow, ToggleSwitch } from './SettingsSection'
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings as NotificationSettingsType,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendTestNotification
} from '@/lib/settings/userSettings'

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<string>('default')
  const [isLoading, setIsLoading] = useState(true)
  const [testSent, setTestSent] = useState(false)

  const loadSettings = useCallback(async () => {
    const data = await getNotificationSettings()
    setSettings(data)
    setPermissionStatus(getNotificationPermissionStatus())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleUpdate = async (updates: Partial<NotificationSettingsType>) => {
    if (!settings) return

    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    await updateNotificationSettings(updates)
  }

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermissionStatus(granted ? 'granted' : 'denied')
    if (granted) {
      await handleUpdate({ enabled: true })
    }
  }

  const handleTestNotification = async () => {
    const sent = await sendTestNotification()
    if (sent) {
      setTestSent(true)
      setTimeout(() => setTestSent(false), 3000)
    }
  }

  if (isLoading || !settings) {
    return (
      <SettingsSection title="Notifications" icon="🔔" description="Configure reminders and alerts">
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </SettingsSection>
    )
  }

  return (
    <SettingsSection title="Notifications" icon="🔔" description="Configure reminders and alerts">
      {/* Permission Status */}
      {permissionStatus !== 'granted' && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {permissionStatus === 'denied' ? 'Notifications Blocked' : 'Enable Notifications'}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {permissionStatus === 'denied'
                  ? 'Please enable notifications in your browser settings'
                  : 'Allow notifications to receive reminders'}
              </p>
            </div>
            {permissionStatus !== 'denied' && (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
              >
                Enable
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Toggle */}
      <SettingsRow
        label="Enable Notifications"
        description="Receive reminders and alerts"
      >
        <ToggleSwitch
          enabled={settings.enabled}
          onChange={(enabled) => handleUpdate({ enabled })}
          disabled={permissionStatus !== 'granted'}
        />
      </SettingsRow>

      {/* Medication Reminders */}
      <SettingsRow
        label="Medication Reminders"
        description="Get reminded to take your medications"
      >
        <ToggleSwitch
          enabled={settings.medicationReminders}
          onChange={(medicationReminders) => handleUpdate({ medicationReminders })}
          disabled={!settings.enabled}
        />
      </SettingsRow>

      {/* Daily Reflection */}
      <SettingsRow
        label="Daily Reflection Reminder"
        description="Remind to complete daily health check-in"
      >
        <ToggleSwitch
          enabled={settings.dailyReflectionReminder}
          onChange={(dailyReflectionReminder) => handleUpdate({ dailyReflectionReminder })}
          disabled={!settings.enabled}
        />
      </SettingsRow>

      {/* Reminder Time */}
      <SettingsRow
        label="Default Reminder Time"
        description="When to send daily reminder"
      >
        <input
          type="time"
          value={settings.reminderTime}
          onChange={(e) => handleUpdate({ reminderTime: e.target.value })}
          disabled={!settings.enabled}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm disabled:opacity-50"
        />
      </SettingsRow>

      {/* Sound */}
      <SettingsRow
        label="Notification Sound"
        description="Play sound with notifications"
      >
        <ToggleSwitch
          enabled={settings.soundEnabled}
          onChange={(soundEnabled) => handleUpdate({ soundEnabled })}
          disabled={!settings.enabled}
        />
      </SettingsRow>

      {/* Quiet Hours */}
      <SettingsRow
        label="Quiet Hours"
        description="Mute notifications during certain hours"
      >
        <ToggleSwitch
          enabled={settings.quietHoursEnabled}
          onChange={(quietHoursEnabled) => handleUpdate({ quietHoursEnabled })}
          disabled={!settings.enabled}
        />
      </SettingsRow>

      {settings.quietHoursEnabled && settings.enabled && (
        <div className="flex items-center gap-4 py-2 pl-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">From</span>
            <input
              type="time"
              value={settings.quietHoursStart}
              onChange={(e) => handleUpdate({ quietHoursStart: e.target.value })}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">To</span>
            <input
              type="time"
              value={settings.quietHoursEnd}
              onChange={(e) => handleUpdate({ quietHoursEnd: e.target.value })}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>
        </div>
      )}

      {/* Test Notification */}
      {permissionStatus === 'granted' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleTestNotification}
            disabled={!settings.enabled}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {testSent ? '✓ Notification Sent!' : 'Send Test Notification'}
          </button>
        </div>
      )}
    </SettingsSection>
  )
}
