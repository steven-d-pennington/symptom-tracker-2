'use client'

import { useState, useEffect } from 'react'
import { DailyEntry } from '@/lib/db'
import {
  saveDailyEntry,
  getTodaysSummary,
  Mood,
  MOOD_OPTIONS,
} from '@/lib/daily/saveDailyEntry'

interface DailyEntryFormProps {
  date: string // YYYY-MM-DD
  existingEntry?: DailyEntry | null
  onSave?: () => void
}

function ScoreSlider({
  label,
  value,
  onChange,
  disabled,
  lowLabel = '1',
  highLabel = '10',
  colorClass = 'bg-blue-500',
}: {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  lowLabel?: string
  highLabel?: string
  colorClass?: string
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, ${colorClass === 'bg-blue-500' ? '#3b82f6' : colorClass === 'bg-green-500' ? '#22c55e' : colorClass === 'bg-purple-500' ? '#a855f7' : '#ef4444'} 0%, ${colorClass === 'bg-blue-500' ? '#3b82f6' : colorClass === 'bg-green-500' ? '#22c55e' : colorClass === 'bg-purple-500' ? '#a855f7' : '#ef4444'} ${(value - 1) * 11.11}%, #e5e7eb ${(value - 1) * 11.11}%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

export function DailyEntryForm({ date, existingEntry, onSave }: DailyEntryFormProps) {
  const [overallHealth, setOverallHealth] = useState(5)
  const [energyLevel, setEnergyLevel] = useState(5)
  const [sleepQuality, setSleepQuality] = useState(5)
  const [stressLevel, setStressLevel] = useState(5)
  const [mood, setMood] = useState<Mood | undefined>('neutral')
  const [notes, setNotes] = useState('')
  const [symptomIds, setSymptomIds] = useState<string[]>([])
  const [medicationIds, setMedicationIds] = useState<string[]>([])
  const [triggerIds, setTriggerIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing entry or today's summary
  useEffect(() => {
    if (existingEntry) {
      setOverallHealth(existingEntry.overallHealthScore)
      setEnergyLevel(existingEntry.energyLevel)
      setSleepQuality(existingEntry.sleepQuality)
      setStressLevel(existingEntry.stressLevel)
      setMood(existingEntry.mood)
      setNotes(existingEntry.notes || '')
      setSymptomIds(existingEntry.symptomIds || [])
      setMedicationIds(existingEntry.medicationIds || [])
      setTriggerIds(existingEntry.triggerIds || [])
    } else {
      // Load today's summary
      loadTodaysSummary()
    }
  }, [existingEntry])

  const loadTodaysSummary = async () => {
    try {
      const summary = await getTodaysSummary()
      setSymptomIds(summary.symptomIds)
      setMedicationIds(summary.medicationIds)
      setTriggerIds(summary.triggerIds)
    } catch (err) {
      console.error('Error loading today summary:', err)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    setIsSaved(false)

    try {
      await saveDailyEntry({
        date,
        overallHealthScore: overallHealth,
        energyLevel,
        sleepQuality,
        stressLevel,
        mood,
        symptomIds,
        medicationIds,
        triggerIds,
        notes: notes || undefined,
      })

      setIsSaved(true)
      if (onSave) {
        onSave()
      }

      // Clear saved indicator after 3 seconds
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      console.error('Error saving daily entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isToday = date === new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Date Header */}
      <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="text-3xl mb-2">{isToday ? '📅' : '📆'}</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isToday ? "Today's Reflection" : formatDate(date)}
        </h2>
        {existingEntry && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {new Date(existingEntry.updatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {isSaved && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">Entry saved successfully!</p>
        </div>
      )}

      {/* Score Sliders */}
      <ScoreSlider
        label="Overall Health"
        value={overallHealth}
        onChange={setOverallHealth}
        disabled={isSubmitting}
        lowLabel="Poor"
        highLabel="Excellent"
        colorClass="bg-blue-500"
      />

      <ScoreSlider
        label="Energy Level"
        value={energyLevel}
        onChange={setEnergyLevel}
        disabled={isSubmitting}
        lowLabel="Exhausted"
        highLabel="Energetic"
        colorClass="bg-green-500"
      />

      <ScoreSlider
        label="Sleep Quality"
        value={sleepQuality}
        onChange={setSleepQuality}
        disabled={isSubmitting}
        lowLabel="Terrible"
        highLabel="Great"
        colorClass="bg-purple-500"
      />

      <ScoreSlider
        label="Stress Level"
        value={stressLevel}
        onChange={setStressLevel}
        disabled={isSubmitting}
        lowLabel="Relaxed"
        highLabel="Very Stressed"
        colorClass="bg-red-500"
      />

      {/* Mood Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Mood
        </label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setMood(option.value)}
              disabled={isSubmitting}
              className={`flex flex-col items-center px-4 py-3 rounded-lg border transition-all ${
                mood === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              } disabled:opacity-50`}
            >
              <span className="text-2xl mb-1">{option.emoji}</span>
              <span className="text-xs text-gray-700 dark:text-gray-300">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Counts */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Today&apos;s Activity
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {symptomIds.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Symptoms</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {medicationIds.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Medications</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {triggerIds.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Triggers</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          placeholder="How was your day? Any notable events or observations..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{notes.length}/1000</p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </>
        ) : existingEntry ? (
          'Update Entry'
        ) : (
          'Save Daily Reflection'
        )}
      </button>
    </div>
  )
}
