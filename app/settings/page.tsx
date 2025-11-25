'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ThemeSelector,
  NotificationSettings,
  PrivacySettings,
  DeleteAccount
} from '@/components/Settings'

type SettingsTab = 'general' | 'notifications' | 'privacy' | 'about' | 'danger'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy & Data', icon: '🔒' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' }
  ]

  const filteredTabs = searchQuery
    ? tabs.filter(tab => tab.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : tabs

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize your experience
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filteredTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {activeTab === 'general' && (
            <>
              <ThemeSelector />

              {/* Quick Links */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Links</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/settings/export"
                    className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">📦</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Export Data</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Backup your data</div>
                    </div>
                  </Link>
                  <Link
                    href="/analytics"
                    className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">📊</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Analytics</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">View insights</div>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings />
          )}

          {activeTab === 'privacy' && (
            <PrivacySettings />
          )}

          {activeTab === 'about' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 text-center">
                <div className="text-4xl mb-4">🩺</div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Pocket Symptom Tracker
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Version 1.0.0
                </p>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>Privacy-first health tracking application</p>
                  <p>All data stored locally on your device</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Features</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Symptom and flare tracking with body map</li>
                  <li>• Food journal with correlation analysis</li>
                  <li>• Medication management and reminders</li>
                  <li>• Trigger tracking and analysis</li>
                  <li>• Daily health reflections</li>
                  <li>• Analytics and insights dashboard</li>
                  <li>• Data export (JSON/CSV)</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Privacy</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>
                    <strong>Local-First:</strong> All your health data is stored locally on your device
                    using IndexedDB. No data is sent to external servers.
                  </p>
                  <p>
                    <strong>No Account Required:</strong> Use the app without signing up or providing
                    personal information.
                  </p>
                  <p>
                    <strong>Photo Encryption:</strong> Photos are encrypted before storage using
                    AES-256-GCM encryption.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    GitHub
                  </a>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Terms of Use
                  </a>
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Made with ❤️ for better health tracking
                </p>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <DeleteAccount />
          )}
        </div>
      </main>
    </div>
  )
}
