'use client'

import { useState } from 'react'
import type { OverallSymptoms, QualityOfLifeAssessment, DrainageAmount, OdorLevel } from '@/lib/hs/types'

interface DailyHSEntryFormProps {
  existingEntry?: Partial<DailyHSEntryFormData>
  onSave: (data: DailyHSEntryFormData) => Promise<void>
  onCancel?: () => void
}

export interface DailyHSEntryFormData {
  overallSymptoms: OverallSymptoms
  qualityOfLife: QualityOfLifeAssessment
  triggers?: string[]
  treatments?: string[]
  notes?: string
  mood?: 1 | 2 | 3 | 4 | 5
}

const TRIGGER_OPTIONS = [
  'Heat/sweating',
  'Friction from clothing',
  'Stress',
  'Poor sleep',
  'Dietary triggers',
  'Hormonal changes',
  'Physical activity',
  'Shaving/hair removal',
  'Tight clothing',
  'Other',
]

const TREATMENT_OPTIONS = [
  'Warm compress',
  'Cold compress',
  'Topical antibiotic',
  'Oral antibiotic',
  'Pain medication',
  'Anti-inflammatory',
  'Wound dressing',
  'Topical steroid',
  'Bleach bath',
  'Other',
]

const ACTIVITIES_OPTIONS: { key: keyof QualityOfLifeAssessment['activitiesAffected']; label: string }[] = [
  { key: 'mobility', label: 'Difficulty moving/walking' },
  { key: 'sleep', label: 'Sleep disrupted' },
  { key: 'workOrSchool', label: 'Work/school affected' },
  { key: 'socialActivities', label: 'Social activities limited' },
  { key: 'intimacy', label: 'Intimacy affected' },
  { key: 'dressing', label: 'Clothing choices limited' },
  { key: 'exercise', label: 'Exercise limited' },
]

const DRAINAGE_OPTIONS: { value: DrainageAmount; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
]

const ODOR_OPTIONS: { value: OdorLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
]

export function DailyHSEntryForm({
  existingEntry,
  onSave,
  onCancel,
}: DailyHSEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Overall symptoms
  const [worstPain, setWorstPain] = useState(existingEntry?.overallSymptoms?.worstPain ?? 0)
  const [averagePain, setAveragePain] = useState(existingEntry?.overallSymptoms?.averagePain ?? 0)
  const [fatigue, setFatigue] = useState(existingEntry?.overallSymptoms?.fatigue ?? 0)
  const [drainage, setDrainage] = useState<DrainageAmount>(existingEntry?.overallSymptoms?.overallDrainage ?? 'none')
  const [odor, setOdor] = useState<OdorLevel>(existingEntry?.overallSymptoms?.odor ?? 'none')
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(existingEntry?.mood ?? 3)

  // Quality of life - activities
  const [activitiesAffected, setActivitiesAffected] = useState<QualityOfLifeAssessment['activitiesAffected']>(
    existingEntry?.qualityOfLife?.activitiesAffected ?? {
      mobility: false,
      dressing: false,
      sleep: false,
      workOrSchool: false,
      exercise: false,
      intimacy: false,
      socialActivities: false,
    }
  )

  // Quality of life - emotional
  const [embarrassment, setEmbarrassment] = useState<0 | 1 | 2 | 3 | 4>(existingEntry?.qualityOfLife?.emotional?.embarrassment ?? 0)
  const [anxiety, setAnxiety] = useState<0 | 1 | 2 | 3 | 4>(existingEntry?.qualityOfLife?.emotional?.anxiety ?? 0)
  const [depression, setDepression] = useState<0 | 1 | 2 | 3 | 4>(existingEntry?.qualityOfLife?.emotional?.depression ?? 0)
  const [frustration, setFrustration] = useState<0 | 1 | 2 | 3 | 4>(existingEntry?.qualityOfLife?.emotional?.frustration ?? 0)

  // Triggers and treatments
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(existingEntry?.triggers ?? [])
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(existingEntry?.treatments ?? [])

  // Notes
  const [notes, setNotes] = useState(existingEntry?.notes ?? '')

  const toggleActivity = (key: keyof QualityOfLifeAssessment['activitiesAffected']) => {
    setActivitiesAffected((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    )
  }

  const toggleTreatment = (treatment: string) => {
    setSelectedTreatments((prev) =>
      prev.includes(treatment) ? prev.filter((t) => t !== treatment) : [...prev, treatment]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSave({
        overallSymptoms: {
          worstPain,
          averagePain,
          fatigue,
          overallDrainage: drainage,
          odor,
        },
        qualityOfLife: {
          activitiesAffected,
          emotional: {
            embarrassment,
            anxiety,
            depression,
            frustration,
          },
        },
        triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
        treatments: selectedTreatments.length > 0 ? selectedTreatments : undefined,
        notes: notes || undefined,
        mood,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mood Quick Select */}
      <section>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          How are you feeling today?
        </label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setMood(level)}
              className={`flex-1 py-3 rounded-lg text-center text-2xl transition-all ${
                mood === level
                  ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {level === 1 ? '😫' : level === 2 ? '😔' : level === 3 ? '😐' : level === 4 ? '🙂' : '😊'}
            </button>
          ))}
        </div>
      </section>

      {/* Overall Symptoms Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pain & Symptoms
        </h3>

        <div className="space-y-4">
          {/* Worst Pain */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Worst pain today
              </label>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {worstPain}/10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={worstPain}
              onChange={(e) => setWorstPain(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Average Pain */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Average pain level
              </label>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {averagePain}/10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={averagePain}
              onChange={(e) => setAveragePain(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Fatigue */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fatigue level
              </label>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {fatigue}/10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={fatigue}
              onChange={(e) => setFatigue(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Drainage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Overall drainage
            </label>
            <div className="flex gap-2">
              {DRAINAGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDrainage(option.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    drainage === option.value
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Odor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Odor level
            </label>
            <div className="flex gap-2">
              {ODOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOdor(option.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    odor === option.value
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quality of Life - Activities */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activities Affected Today
        </h3>
        <div className="space-y-2">
          {ACTIVITIES_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={activitiesAffected[option.key]}
                onChange={() => toggleActivity(option.key)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Quality of Life - Emotional */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Emotional Impact
        </h3>
        <div className="space-y-4">
          {/* Embarrassment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Embarrassment
              </label>
              <span className="text-xs text-gray-500">{embarrassment}/4</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={embarrassment}
              onChange={(e) => setEmbarrassment(parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4)}
              className="w-full"
            />
          </div>

          {/* Anxiety */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Anxiety
              </label>
              <span className="text-xs text-gray-500">{anxiety}/4</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={anxiety}
              onChange={(e) => setAnxiety(parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4)}
              className="w-full"
            />
          </div>

          {/* Depression */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Low mood / Depression
              </label>
              <span className="text-xs text-gray-500">{depression}/4</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={depression}
              onChange={(e) => setDepression(parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4)}
              className="w-full"
            />
          </div>

          {/* Frustration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Frustration
              </label>
              <span className="text-xs text-gray-500">{frustration}/4</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={frustration}
              onChange={(e) => setFrustration(parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4)}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Triggers Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Possible Triggers Today
        </h3>
        <div className="flex flex-wrap gap-2">
          {TRIGGER_OPTIONS.map((trigger) => (
            <button
              key={trigger}
              type="button"
              onClick={() => toggleTrigger(trigger)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedTriggers.includes(trigger)
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {trigger}
            </button>
          ))}
        </div>
      </section>

      {/* Treatments Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Treatments Used Today
        </h3>
        <div className="flex flex-wrap gap-2">
          {TREATMENT_OPTIONS.map((treatment) => (
            <button
              key={treatment}
              type="button"
              onClick={() => toggleTreatment(treatment)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedTreatments.includes(treatment)
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {treatment}
            </button>
          ))}
        </div>
      </section>

      {/* Notes Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Additional Notes
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any other observations, symptoms, or notes about today..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        />
      </section>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Daily Entry'}
        </button>
      </div>
    </form>
  )
}
