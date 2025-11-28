'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BodyImagePreference } from '@/lib/db'
import { getBodyImageUrl } from '@/lib/settings/userSettings'

interface BodyTypeOption {
  gender: 'male' | 'female'
  bodyType: 'average' | 'heavy'
  label: string
}

const BODY_TYPE_OPTIONS: BodyTypeOption[] = [
  { gender: 'female', bodyType: 'average', label: 'Female (Average)' },
  { gender: 'female', bodyType: 'heavy', label: 'Female (Larger)' },
  { gender: 'male', bodyType: 'average', label: 'Male (Average)' },
  { gender: 'male', bodyType: 'heavy', label: 'Male (Larger)' },
]

interface BodyMapStepProps {
  bodyImagePreference: BodyImagePreference | null | undefined
  onPreferenceChange: (pref: BodyImagePreference | null) => void
  onNext: () => void
  onSkip: () => void
}

function isMatchingPreference(
  option: BodyTypeOption,
  preference: BodyImagePreference | null | undefined
): boolean {
  if (!preference) return false
  return preference.gender === option.gender && preference.bodyType === option.bodyType
}

export function BodyMapStep({
  bodyImagePreference,
  onPreferenceChange,
  onNext,
  onSkip,
}: BodyMapStepProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleSelect = (option: BodyTypeOption | null) => {
    if (option === null) {
      onPreferenceChange(null)
    } else {
      onPreferenceChange({
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

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Personalize Your Body Map
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Choose an anatomical reference image (optional)
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        {/* No Image Option */}
        <button
          onClick={() => handleSelect(null)}
          className={`w-full p-4 rounded-lg border-2 text-left mb-4 transition-all ${
            bodyImagePreference === null || bodyImagePreference === undefined
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
              🚫
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                No Background Image
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Just show the region outlines for tracking
              </div>
            </div>
            {(bodyImagePreference === null || bodyImagePreference === undefined) && (
              <div className="ml-auto w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* Body Type Grid */}
        <div className="grid grid-cols-2 gap-4">
          {BODY_TYPE_OPTIONS.map((option) => {
            const key = getOptionKey(option)
            const isSelected = isMatchingPreference(option, bodyImagePreference)
            const imageUrl = getBodyImageUrl(
              { gender: option.gender, bodyType: option.bodyType },
              'front'
            )
            const hasError = imageErrors.has(key)

            return (
              <button
                key={key}
                onClick={() => handleSelect(option)}
                className={`relative p-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-full h-36 mb-3 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                      {hasError ? 'Not available yet' : 'Loading...'}
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </div>

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-2">
            <div className="text-blue-500 flex-shrink-0">ℹ️</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p>
                This image appears behind the body map regions to help you visualize where to track
                symptoms and lesions. You can change this anytime in Settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <button
          onClick={onSkip}
          className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-semibold transition-colors"
        >
          Skip
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
