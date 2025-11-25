'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SettingsSection, SettingsRow, ToggleSwitch } from './SettingsSection'
import {
  getPrivacySettings,
  updatePrivacySettings,
  PrivacySettings as PrivacySettingsType,
  getStorageStats,
  clearAllData,
  clearPhotoCache
} from '@/lib/settings/userSettings'

export function PrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettingsType | null>(null)
  const [storageStats, setStorageStats] = useState<{
    totalSize: string
    breakdown: { name: string; count: number; size: string }[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearingData, setClearingData] = useState(false)
  const [clearingPhotos, setClearingPhotos] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [privacySettings, stats] = await Promise.all([
      getPrivacySettings(),
      getStorageStats()
    ])
    setSettings(privacySettings)
    setStorageStats(stats)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdate = async (updates: Partial<PrivacySettingsType>) => {
    if (!settings) return

    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    await updatePrivacySettings(updates)
  }

  const handleClearPhotos = async () => {
    setClearingPhotos(true)
    try {
      const count = await clearPhotoCache()
      setMessage(`Cleared ${count} photo(s) from cache`)
      await loadData()
    } catch (error) {
      setMessage('Error clearing photo cache')
    } finally {
      setClearingPhotos(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleClearAllData = async () => {
    setClearingData(true)
    try {
      await clearAllData()
      setMessage('All health data has been cleared')
      setShowClearConfirm(false)
      await loadData()
    } catch (error) {
      setMessage('Error clearing data')
    } finally {
      setClearingData(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (isLoading || !settings || !storageStats) {
    return (
      <SettingsSection title="Privacy & Data" icon="🔒" description="Manage your data and privacy">
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </SettingsSection>
    )
  }

  return (
    <SettingsSection title="Privacy & Data" icon="🔒" description="Manage your data and privacy">
      {/* Message */}
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">{message}</p>
        </div>
      )}

      {/* Storage Overview */}
      <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Storage Usage</h4>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {storageStats.totalSize}
          </span>
        </div>

        {storageStats.breakdown.length > 0 ? (
          <div className="space-y-2">
            {storageStats.breakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {item.name} ({item.count})
                </span>
                <span className="text-gray-900 dark:text-gray-100">{item.size}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No data stored yet</p>
        )}
      </div>

      {/* Privacy Toggle */}
      <SettingsRow
        label="Usage Analytics"
        description="Help improve the app by sharing anonymous usage data"
      >
        <ToggleSwitch
          enabled={settings.uxAnalyticsEnabled}
          onChange={(uxAnalyticsEnabled) => handleUpdate({ uxAnalyticsEnabled })}
        />
      </SettingsRow>

      {/* Data Retention */}
      <SettingsRow
        label="Data Retention"
        description="How long to keep your health data"
      >
        <select
          value={settings.dataRetentionDays}
          onChange={(e) => handleUpdate({ dataRetentionDays: parseInt(e.target.value) })}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value={0}>Forever</option>
          <option value={90}>90 days</option>
          <option value={180}>6 months</option>
          <option value={365}>1 year</option>
          <option value={730}>2 years</option>
        </select>
      </SettingsRow>

      {/* Export Data Link */}
      <div className="py-3 border-b border-gray-100 dark:border-gray-700">
        <Link
          href="/settings/export"
          className="flex items-center justify-between text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <div>
            <div className="font-medium">Export Your Data</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Download a backup of all your data</div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Danger Zone */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">Danger Zone</h4>

        <div className="space-y-3">
          {/* Clear Photo Cache */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Clear Photo Cache</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Remove all stored photos</div>
            </div>
            <button
              onClick={handleClearPhotos}
              disabled={clearingPhotos}
              className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {clearingPhotos ? 'Clearing...' : 'Clear Photos'}
            </button>
          </div>

          {/* Clear All Data */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Clear All Data</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Delete all health logs and entries</div>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
              Delete All Data?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will permanently delete all your health logs, flares, symptom entries,
              medication logs, and other tracked data. This action cannot be undone.
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mb-6">
              Your preferences and library items (symptoms, medications, etc.) will be kept.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                disabled={clearingData}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {clearingData ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-2">
          <span className="text-green-600 dark:text-green-400">✓</span>
          <div className="text-xs text-green-800 dark:text-green-200">
            <strong>Your data stays on your device.</strong> All health information is stored locally
            using IndexedDB. No data is sent to external servers. Your privacy is protected by design.
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}
