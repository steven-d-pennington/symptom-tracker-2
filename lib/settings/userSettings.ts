'use client'

import { db, User, BodyImagePreference } from '@/lib/db'

export type { BodyImagePreference }

export interface NotificationSettings {
  enabled: boolean
  medicationReminders: boolean
  dailyReflectionReminder: boolean
  reminderTime: string // HH:mm format
  quietHoursEnabled: boolean
  quietHoursStart: string // HH:mm
  quietHoursEnd: string // HH:mm
  soundEnabled: boolean
}

export interface PrivacySettings {
  uxAnalyticsEnabled: boolean
  dataRetentionDays: number // 0 = forever
  autoBackupEnabled: boolean
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  medicationReminders: true,
  dailyReflectionReminder: true,
  reminderTime: '20:00',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  soundEnabled: true
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  uxAnalyticsEnabled: false,
  dataRetentionDays: 0,
  autoBackupEnabled: false
}

export async function getUserSettings(): Promise<User | null> {
  const users = await db.users.toArray()
  return users[0] || null
}

export async function updateTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
  const user = await getUserSettings()
  if (user && user.id) {
    await db.users.update(user.id, {
      theme,
      updatedAt: Date.now()
    })
  }
  applyTheme(theme)
}

export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }

  // Store in localStorage for immediate access on page load
  localStorage.setItem('theme', theme)
}

export function getStoredTheme(): 'light' | 'dark' | 'system' {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const user = await getUserSettings()
  if (!user) return DEFAULT_NOTIFICATION_SETTINGS

  const settings = user.notificationSettings as Partial<NotificationSettings>
  return { ...DEFAULT_NOTIFICATION_SETTINGS, ...settings }
}

export async function updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  const user = await getUserSettings()
  if (user && user.id) {
    const currentSettings = await getNotificationSettings()
    await db.users.update(user.id, {
      notificationSettings: { ...currentSettings, ...settings },
      updatedAt: Date.now()
    })
  }
}

export async function getPrivacySettings(): Promise<PrivacySettings> {
  const user = await getUserSettings()
  if (!user) return DEFAULT_PRIVACY_SETTINGS

  const settings = user.privacySettings as Partial<PrivacySettings>
  return { ...DEFAULT_PRIVACY_SETTINGS, ...settings }
}

export async function updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<void> {
  const user = await getUserSettings()
  if (user && user.id) {
    const currentSettings = await getPrivacySettings()
    await db.users.update(user.id, {
      privacySettings: { ...currentSettings, ...settings },
      updatedAt: Date.now()
    })
  }
}

// Body Image Preference Settings
export async function getBodyImagePreference(): Promise<BodyImagePreference | null> {
  const user = await getUserSettings()
  if (!user) return null
  return user.bodyImagePreference ?? null
}

export async function updateBodyImagePreference(preference: BodyImagePreference | null): Promise<void> {
  const user = await getUserSettings()
  if (user && user.id) {
    await db.users.update(user.id, {
      bodyImagePreference: preference,
      updatedAt: Date.now()
    })
  }
}

/**
 * Get the body image URL for a given preference and view
 */
export function getBodyImageUrl(
  preference: BodyImagePreference | null,
  view: 'front' | 'back'
): string | null {
  if (!preference) return null
  const typeCode = preference.bodyType === 'average' ? 'a' : 'h'
  return `/body-images/${preference.gender}-${typeCode}-${view}.png`
}

export async function getStorageStats(): Promise<{
  totalSize: string
  breakdown: { name: string; count: number; size: string }[]
}> {
  const [
    symptoms,
    symptomInstances,
    medications,
    medicationEvents,
    triggers,
    triggerEvents,
    foods,
    foodEvents,
    flares,
    flareEvents,
    dailyEntries,
    photos
  ] = await Promise.all([
    db.symptoms.count(),
    db.symptomInstances.count(),
    db.medications.count(),
    db.medicationEvents.count(),
    db.triggers.count(),
    db.triggerEvents.count(),
    db.foods.count(),
    db.foodEvents.count(),
    db.flares.count(),
    db.flareEvents.count(),
    db.dailyEntries.count(),
    db.photoAttachments.count()
  ])

  // Estimate sizes (rough approximations)
  const estimateSize = (count: number, avgBytes: number) => count * avgBytes

  const breakdown = [
    { name: 'Symptoms', count: symptoms, size: formatBytes(estimateSize(symptoms, 500)) },
    { name: 'Symptom Logs', count: symptomInstances, size: formatBytes(estimateSize(symptomInstances, 300)) },
    { name: 'Medications', count: medications, size: formatBytes(estimateSize(medications, 600)) },
    { name: 'Medication Logs', count: medicationEvents, size: formatBytes(estimateSize(medicationEvents, 200)) },
    { name: 'Triggers', count: triggers, size: formatBytes(estimateSize(triggers, 400)) },
    { name: 'Trigger Logs', count: triggerEvents, size: formatBytes(estimateSize(triggerEvents, 200)) },
    { name: 'Foods', count: foods, size: formatBytes(estimateSize(foods, 500)) },
    { name: 'Meal Logs', count: foodEvents, size: formatBytes(estimateSize(foodEvents, 400)) },
    { name: 'Flares', count: flares, size: formatBytes(estimateSize(flares, 400)) },
    { name: 'Flare Events', count: flareEvents, size: formatBytes(estimateSize(flareEvents, 300)) },
    { name: 'Daily Entries', count: dailyEntries, size: formatBytes(estimateSize(dailyEntries, 500)) },
    { name: 'Photos', count: photos, size: formatBytes(estimateSize(photos, 100000)) } // ~100KB avg per photo
  ]

  const totalBytes = breakdown.reduce((sum, item) => {
    const bytes = parseFloat(item.size) * (item.size.includes('KB') ? 1024 : item.size.includes('MB') ? 1024 * 1024 : 1)
    return sum + bytes
  }, 0)

  return {
    totalSize: formatBytes(totalBytes),
    breakdown: breakdown.filter(b => b.count > 0)
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.symptomInstances.clear(),
    db.medicationEvents.clear(),
    db.triggerEvents.clear(),
    db.foodEvents.clear(),
    db.flareEvents.clear(),
    db.flareBodyLocations.clear(),
    db.dailyEntries.clear(),
    db.bodyMapLocations.clear(),
    db.photoAttachments.clear(),
    db.photoComparisons.clear(),
    db.uxEvents.clear(),
    db.foodCombinationCorrelations.clear()
  ])

  // Reset flares
  await db.flares.clear()
}

export async function clearPhotoCache(): Promise<number> {
  const count = await db.photoAttachments.count()
  await db.photoAttachments.clear()
  await db.photoComparisons.clear()
  return count
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export function getNotificationPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

export async function sendTestNotification(): Promise<boolean> {
  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return false

  new Notification('Pocket Symptom Tracker', {
    body: 'Notifications are working correctly!',
    icon: '/icon-192.png'
  })

  return true
}
