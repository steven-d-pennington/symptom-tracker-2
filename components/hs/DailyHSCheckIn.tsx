'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IHS4Badge } from './IHS4ScoreCard'
import type { IHS4Severity } from '@/lib/hs/types'

interface DailyHSCheckInProps {
  currentIHS4Score: number
  currentSeverity: IHS4Severity
  activeLesionCount: number
  onQuickSave: (data: QuickCheckInData) => void
  onAddLesion?: () => void
  onViewDetails?: () => void
}

export interface QuickCheckInData {
  overallMood: 1 | 2 | 3 | 4 | 5
  overallPain: number          // 0-10
  hasNewLesions: boolean
  quickNotes?: string
}

const MOOD_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
  { value: 1, emoji: '😫', label: 'Very bad' },
  { value: 2, emoji: '😔', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
]

export function DailyHSCheckIn({
  currentIHS4Score,
  currentSeverity,
  activeLesionCount,
  onQuickSave,
  onAddLesion,
  onViewDetails,
}: DailyHSCheckInProps) {
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [painLevel, setPainLevel] = useState(0)
  const [hasNewLesions, setHasNewLesions] = useState(false)
  const [notes, setNotes] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onQuickSave({
        overallMood: mood,
        overallPain: painLevel,
        hasNewLesions,
        quickNotes: notes || undefined,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header with IHS4 summary */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Daily HS Check-In
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">IHS4</div>
              <IHS4Badge score={currentIHS4Score} severity={currentSeverity} />
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {activeLesionCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick check-in form */}
      <div className="p-4 space-y-4">
        {/* Mood selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How are you feeling today?
          </label>
          <div className="flex justify-between gap-1">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setMood(option.value)}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  mood === option.value
                    ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title={option.label}
              >
                <span className="text-2xl">{option.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overall pain */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall pain level
            </label>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {painLevel}/10
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>None</span>
            <span>Severe</span>
          </div>
        </div>

        {/* New lesions question */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Any new lesions today?
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setHasNewLesions(false)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                !hasNewLesions
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              No
            </button>
            <button
              onClick={() => {
                setHasNewLesions(true)
                if (onAddLesion) onAddLesion()
              }}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                hasNewLesions
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              Yes
            </button>
          </div>
        </div>

        {/* Expandable notes section */}
        {isExpanded && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations about today..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isExpanded ? 'Less options' : 'More options'}
          </button>
          <div className="flex gap-2">
            {onViewDetails && (
              <Link
                href="/hs"
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                View Details
              </Link>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Check-In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version for dashboard widgets
 */
export function DailyHSCheckInCompact({
  currentIHS4Score,
  currentSeverity,
  activeLesionCount,
}: {
  currentIHS4Score: number
  currentSeverity: IHS4Severity
  activeLesionCount: number
}) {
  return (
    <Link
      href="/hs"
      className="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">HS Tracker</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {activeLesionCount} active lesion{activeLesionCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">IHS4 Score</div>
          <IHS4Badge score={currentIHS4Score} severity={currentSeverity} />
        </div>
      </div>
    </Link>
  )
}
