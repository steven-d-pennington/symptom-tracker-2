'use client'

import { useState, useEffect, useCallback } from 'react'
import { SettingsSection } from './SettingsSection'
import { TrackingCategory } from './TrackingCategory'
import { getTrackingCounts, TrackingCounts } from '@/lib/settings/trackingPreferences'

type CategoryType = 'symptoms' | 'medications' | 'triggers' | 'foods'

interface CategoryConfig {
  key: CategoryType
  title: string
  icon: string
  color: string
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'symptoms', title: 'Symptoms', icon: '📊', color: 'blue' },
  { key: 'medications', title: 'Medications', icon: '💊', color: 'purple' },
  { key: 'triggers', title: 'Triggers', icon: '⚡', color: 'orange' },
  { key: 'foods', title: 'Foods', icon: '🍽️', color: 'green' },
]

export function TrackingPreferences() {
  const [counts, setCounts] = useState<TrackingCounts>({ symptoms: 0, medications: 0, triggers: 0, foods: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<CategoryType | null>(null)

  const loadCounts = useCallback(async () => {
    try {
      const newCounts = await getTrackingCounts()
      setCounts(newCounts)
    } catch (error) {
      console.error('Error loading tracking counts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCounts()
  }, [loadCounts])

  const handleCategoryToggle = (category: CategoryType) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  const handleCountChange = (category: CategoryType, count: number) => {
    setCounts(prev => ({ ...prev, [category]: count }))
  }

  if (isLoading) {
    return (
      <SettingsSection
        title="Tracking Preferences"
        icon="📋"
        description="Manage what you track in the app"
      >
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse h-16 bg-gray-100 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </SettingsSection>
    )
  }

  return (
    <SettingsSection
      title="Tracking Preferences"
      icon="📋"
      description="Manage what you track in the app"
    >
      <div className="space-y-3">
        {CATEGORIES.map(category => (
          <div key={category.key}>
            {/* Category Header Button */}
            <button
              onClick={() => handleCategoryToggle(category.key)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                expandedCategory === category.key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {category.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {counts[category.key]} tracked
                  </div>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedCategory === category.key ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Category Content */}
            {expandedCategory === category.key && (
              <div className="mt-2 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                <TrackingCategory
                  category={category.key}
                  onCountChange={(count) => handleCountChange(category.key, count)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Only tracked items appear in logging screens, daily reflections, and analytics filters.
        </p>
      </div>
    </SettingsSection>
  )
}
