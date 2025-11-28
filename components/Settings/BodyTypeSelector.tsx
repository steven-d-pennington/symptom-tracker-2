'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { SettingsSection } from './SettingsSection'
import { BodyImagePreference } from '@/lib/db'
import { useBodyImagePreference } from '@/lib/hooks/useBodyImagePreference'
import { getBodyImageUrl } from '@/lib/settings/userSettings'

interface BodyTypeOption {
  gender: 'male' | 'female'
  bodyType: 'average' | 'heavy'
  label: string
  description: string
}

const BODY_TYPE_OPTIONS: BodyTypeOption[] = [
  { gender: 'female', bodyType: 'average', label: 'Female (Average)', description: 'Average body type' },
  { gender: 'female', bodyType: 'heavy', label: 'Female (Larger)', description: 'Larger body type' },
  { gender: 'male', bodyType: 'average', label: 'Male (Average)', description: 'Average body type' },
  { gender: 'male', bodyType: 'heavy', label: 'Male (Larger)', description: 'Larger body type' },
]

function isMatchingPreference(
  option: BodyTypeOption,
  preference: BodyImagePreference | null
): boolean {
  if (!preference) return false
  return preference.gender === option.gender && preference.bodyType === option.bodyType
}

export function BodyTypeSelector() {
  const { preference, isLoading, updatePreference } = useBodyImagePreference()
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleSelect = async (option: BodyTypeOption | null) => {
    if (option === null) {
      await updatePreference(null)
    } else {
      await updatePreference({
        gender: option.gender,
        bodyType: option.bodyType,
      })
    }
  }

  const handleImageError = (key: string) => {
    setImageErrors((prev) => new Set([...prev, key]))
  }

  const getOptionKey = (option: BodyTypeOption) =>
    `${option.gender}-${option.bodyType}`

  if (isLoading) {
    return (
      <SettingsSection
        title="Body Map Appearance"
        icon="🧍"
        description="Choose an anatomical reference image for the body map"
      >
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </SettingsSection>
    )
  }

  return (
    <SettingsSection
      title="Body Map Appearance"
      icon="🧍"
      description="Choose an anatomical reference image for the body map (optional)"
    >
      {/* No Image Option */}
      <button
        onClick={() => handleSelect(null)}
        className={`w-full p-3 rounded-lg border-2 text-left mb-3 transition-all ${
          preference === null
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
            🚫
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              No Background Image
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Show only region outlines
            </div>
          </div>
          {preference === null && (
            <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </button>

      {/* Body Type Grid */}
      <div className="grid grid-cols-2 gap-3">
        {BODY_TYPE_OPTIONS.map((option) => {
          const key = getOptionKey(option)
          const isSelected = isMatchingPreference(option, preference)
          const imageUrl = getBodyImageUrl(
            { gender: option.gender, bodyType: option.bodyType },
            'front'
          )
          const hasError = imageErrors.has(key)

          return (
            <button
              key={key}
              onClick={() => handleSelect(option)}
              className={`relative p-2 rounded-lg border-2 text-center transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-full h-28 mb-2 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                {!hasError && imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={option.label}
                    fill
                    className="object-contain"
                    onError={() => handleImageError(key)}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                    {hasError ? 'Image not available' : 'Loading...'}
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {option.label}
              </div>

              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          The anatomical image provides a visual reference behind the body map regions.
          Your selection helps personalize the tracking experience.
        </p>
      </div>
    </SettingsSection>
  )
}
