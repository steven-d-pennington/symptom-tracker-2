'use client'

import { useState, useEffect } from 'react'
import { SettingsSection } from './SettingsSection'
import { updateTheme, getStoredTheme } from '@/lib/settings/userSettings'

type Theme = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: Theme; label: string; icon: string; description: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️', description: 'Always use light theme' },
  { value: 'dark', label: 'Dark', icon: '🌙', description: 'Always use dark theme' },
  { value: 'system', label: 'System', icon: '💻', description: 'Follow system preference' }
]

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedTheme = getStoredTheme()
    setCurrentTheme(storedTheme)
    setIsLoading(false)
  }, [])

  const handleThemeChange = async (theme: Theme) => {
    setCurrentTheme(theme)
    await updateTheme(theme)
  }

  if (isLoading) {
    return (
      <SettingsSection title="Appearance" icon="🎨" description="Customize the look and feel">
        <div className="animate-pulse h-24 bg-gray-100 dark:bg-gray-700 rounded"></div>
      </SettingsSection>
    )
  }

  return (
    <SettingsSection title="Appearance" icon="🎨" description="Customize the look and feel">
      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleThemeChange(option.value)}
            className={`relative p-3 rounded-lg border-2 text-center transition-all ${
              currentTheme === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{option.icon}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {option.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {option.description}
            </div>
            {currentTheme === option.value && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Theme Preview */}
      <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Current: {currentTheme === 'system' ? 'Following system preference' : `${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} theme`}
        </p>
      </div>
    </SettingsSection>
  )
}
