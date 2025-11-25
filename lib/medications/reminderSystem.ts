import { db, Medication } from '../db'

export interface ScheduledReminder {
  medicationId: string
  medicationName: string
  dosage: string
  scheduledTime: Date
  timeoutId?: number
}

export interface ReminderSettings {
  enabled: boolean
  snoozeMinutes: number
}

// Store active reminders in memory
let activeReminders: Map<string, ScheduledReminder> = new Map()
let reminderTimeouts: Map<string, number> = new Map()

/**
 * Check if notification permission is granted
 */
export function hasNotificationPermission(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }
  return Notification.permission === 'granted'
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * Show a medication reminder notification
 */
export async function showMedicationReminder(
  medication: Medication,
  onTaken?: () => void,
  onSkipped?: () => void,
  onSnooze?: (minutes: number) => void
): Promise<void> {
  if (!hasNotificationPermission()) {
    console.warn('Notification permission not granted')
    return
  }

  const options: NotificationOptions & { vibrate?: number[] } = {
    body: `Time to take ${medication.dosage}`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `medication-${medication.guid}`,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      medicationId: medication.guid,
      type: 'medication-reminder',
    },
  }

  // Try to use service worker notifications (more reliable)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title: `💊 ${medication.name}`,
      options,
    })
  } else {
    // Fallback to regular Notification API
    const notification = new Notification(`💊 ${medication.name}`, options)

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }
}

/**
 * Schedule a reminder for a medication at a specific time
 */
export function scheduleReminder(
  medication: Medication,
  scheduledTime: Date,
  onReminder: (medication: Medication) => void
): string {
  const now = new Date()
  const delay = scheduledTime.getTime() - now.getTime()

  if (delay < 0) {
    // Time has already passed today, skip
    return ''
  }

  const reminderId = `${medication.guid}-${scheduledTime.getTime()}`

  // Clear existing timeout if any
  const existingTimeout = reminderTimeouts.get(reminderId)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }

  // Schedule the reminder
  const timeoutId = window.setTimeout(() => {
    onReminder(medication)
    activeReminders.delete(reminderId)
    reminderTimeouts.delete(reminderId)
  }, delay)

  // Store the reminder
  activeReminders.set(reminderId, {
    medicationId: medication.guid,
    medicationName: medication.name,
    dosage: medication.dosage,
    scheduledTime,
    timeoutId,
  })

  reminderTimeouts.set(reminderId, timeoutId)

  return reminderId
}

/**
 * Cancel a scheduled reminder
 */
export function cancelReminder(reminderId: string): void {
  const timeoutId = reminderTimeouts.get(reminderId)
  if (timeoutId) {
    clearTimeout(timeoutId)
    reminderTimeouts.delete(reminderId)
    activeReminders.delete(reminderId)
  }
}

/**
 * Cancel all reminders for a medication
 */
export function cancelMedicationReminders(medicationId: string): void {
  for (const [reminderId, reminder] of activeReminders.entries()) {
    if (reminder.medicationId === medicationId) {
      cancelReminder(reminderId)
    }
  }
}

/**
 * Snooze a reminder for the specified number of minutes
 */
export function snoozeReminder(
  medication: Medication,
  minutes: number,
  onReminder: (medication: Medication) => void
): string {
  const snoozeTime = new Date(Date.now() + minutes * 60 * 1000)
  return scheduleReminder(medication, snoozeTime, onReminder)
}

/**
 * Schedule all reminders for today based on medication schedules
 */
export async function scheduleAllRemindersForToday(
  onReminder: (medication: Medication) => void
): Promise<number> {
  const medications = await db.medications.where('isActive').equals(1).toArray()
  let scheduledCount = 0

  const today = new Date()
  const dayOfWeek = today.getDay()

  for (const medication of medications) {
    const { times, days } = medication.schedule

    // Check if today is a scheduled day
    if (days && days.length > 0 && !days.includes(dayOfWeek)) {
      continue
    }

    // Schedule reminders for each time
    for (const timeStr of times) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const scheduledTime = new Date(today)
      scheduledTime.setHours(hours, minutes, 0, 0)

      const reminderId = scheduleReminder(medication, scheduledTime, onReminder)
      if (reminderId) {
        scheduledCount++
      }
    }
  }

  return scheduledCount
}

/**
 * Get all active reminders
 */
export function getActiveReminders(): ScheduledReminder[] {
  return Array.from(activeReminders.values()).sort(
    (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()
  )
}

/**
 * Get next reminder time for a medication
 */
export function getNextReminderTime(medication: Medication): Date | null {
  const now = new Date()
  const today = new Date()
  const dayOfWeek = today.getDay()

  const { times, days } = medication.schedule

  // Check if today is a scheduled day
  if (days && days.length > 0 && !days.includes(dayOfWeek)) {
    // Find next scheduled day
    for (let i = 1; i <= 7; i++) {
      const nextDay = (dayOfWeek + i) % 7
      if (days.includes(nextDay)) {
        const nextDate = new Date(today)
        nextDate.setDate(nextDate.getDate() + i)
        const [hours, minutes] = times[0].split(':').map(Number)
        nextDate.setHours(hours, minutes, 0, 0)
        return nextDate
      }
    }
    return null
  }

  // Find next time today or tomorrow
  for (const timeStr of times) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const scheduledTime = new Date(today)
    scheduledTime.setHours(hours, minutes, 0, 0)

    if (scheduledTime > now) {
      return scheduledTime
    }
  }

  // All times today have passed, return first time tomorrow
  if (times.length > 0) {
    const [hours, minutes] = times[0].split(':').map(Number)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(hours, minutes, 0, 0)
    return tomorrow
  }

  return null
}

/**
 * Clear all scheduled reminders
 */
export function clearAllReminders(): void {
  for (const reminderId of reminderTimeouts.keys()) {
    cancelReminder(reminderId)
  }
}

/**
 * Format time until next reminder
 */
export function formatTimeUntilReminder(date: Date): string {
  const now = Date.now()
  const diff = date.getTime() - now

  if (diff < 0) return 'Overdue'

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`
  }
  return `${minutes}m`
}
