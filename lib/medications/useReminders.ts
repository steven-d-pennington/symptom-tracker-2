'use client'

import { useEffect, useState, useCallback } from 'react'
import { Medication } from '../db'
import {
  scheduleAllRemindersForToday,
  showMedicationReminder,
  snoozeReminder,
  getActiveReminders,
  clearAllReminders,
  hasNotificationPermission,
  requestNotificationPermission,
  ScheduledReminder,
  getNextReminderTime,
  formatTimeUntilReminder,
} from './reminderSystem'
import { logMedicationEvent } from './logMedication'
import { getNotificationSettings } from '../settings/userSettings'

export interface UseRemindersReturn {
  activeReminders: ScheduledReminder[]
  hasPermission: boolean
  isEnabled: boolean
  requestPermission: () => Promise<boolean>
  initializeReminders: () => Promise<void>
  snooze: (medication: Medication, minutes: number) => void
  clearReminders: () => void
  getNextReminder: (medication: Medication) => Date | null
  formatTimeUntil: (date: Date) => string
}

export function useReminders(): UseRemindersReturn {
  const [activeReminders, setActiveReminders] = useState<ScheduledReminder[]>([])
  const [hasPermission, setHasPermission] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  // Handle reminder trigger
  const handleReminderTrigger = useCallback(async (medication: Medication) => {
    await showMedicationReminder(medication)
    setActiveReminders(getActiveReminders())
  }, [])

  // Initialize reminders
  const initializeReminders = useCallback(async () => {
    const settings = await getNotificationSettings()
    setIsEnabled(settings.enabled && settings.medicationReminders)
    setHasPermission(hasNotificationPermission())

    if (settings.enabled && settings.medicationReminders && hasNotificationPermission()) {
      await scheduleAllRemindersForToday(handleReminderTrigger)
      setActiveReminders(getActiveReminders())
    }
  }, [handleReminderTrigger])

  // Request notification permission
  const handleRequestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission()
    setHasPermission(granted)
    return granted
  }, [])

  // Snooze a reminder
  const handleSnooze = useCallback(
    (medication: Medication, minutes: number) => {
      snoozeReminder(medication, minutes, handleReminderTrigger)
      setActiveReminders(getActiveReminders())
    },
    [handleReminderTrigger]
  )

  // Clear all reminders
  const handleClearReminders = useCallback(() => {
    clearAllReminders()
    setActiveReminders([])
  }, [])

  // Listen for service worker messages
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'MEDICATION_REMINDER_ACTION') {
        const { action, medicationId } = event.data

        if (action === 'taken') {
          await logMedicationEvent({
            medicationId,
            taken: true,
          })
        } else if (action === 'snooze') {
          // Snooze for 15 minutes - need to get medication first
          // This will be handled by the component
        }
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  // Update reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReminders(getActiveReminders())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeReminders()
  }, [initializeReminders])

  // Re-schedule reminders at midnight
  useEffect(() => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const timeUntilMidnight = midnight.getTime() - now.getTime()

    const timeout = setTimeout(() => {
      initializeReminders()
    }, timeUntilMidnight)

    return () => clearTimeout(timeout)
  }, [initializeReminders])

  return {
    activeReminders,
    hasPermission,
    isEnabled,
    requestPermission: handleRequestPermission,
    initializeReminders,
    snooze: handleSnooze,
    clearReminders: handleClearReminders,
    getNextReminder: getNextReminderTime,
    formatTimeUntil: formatTimeUntilReminder,
  }
}
